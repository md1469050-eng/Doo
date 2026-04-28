const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "videov5",
    aliases: ["ytv5", "v5", "download"],
    version: "5.0.0",
    author: "BOTX666 🪬",
    countDown: 10,
    role: 0,
    category: "media",
    shortDescription: {
        en: "Supreme YouTube Video Downloader V5"
    },
    longDescription: {
        en: "High-speed YouTube video downloader with real-time status and branding."
    },
    guide: {
      en: "{pn} <video name>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, body } = event;
    
    // সময় ও তারিখ (Asia/Dhaka)
    const timeFull = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
    const dateFull = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
    const sig = `\n━━━━━━━━━━━━━━━━━━━━\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${timeFull}\n📅 তারিখ: ${dateFull}`;

    let query = args.join(" ");
    if (!query && body) {
      query = body.replace(/^videov5\s+/i, "").trim();
    }

    if (!query || query.toLowerCase() === "videov5") {
      return api.sendMessage(
        `❌ সঠিক ভিডিওর নাম দিন।\n📌 উদাহরণ: videov5 তমিজউদ্দিনের ডায়েরি${sig}`,
        threadID,
        messageID
      );
    }

    let tempMsgID = null;

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);
      
      const searching = await api.sendMessage(
        `🎬 𝐒𝐄𝐀𝐑𝐂𝐇𝐈𝐍𝐆 𝐕𝟓...\n━━━━━━━━━━━━━━━\n🔍 𝐐𝐮𝐞𝐫𝐲: ${query}\n⌛ মহাজাগতিক অনুসন্ধান চলছে...`,
        threadID
      );
      tempMsgID = searching.messageID;

      // ভিডিও সার্চ
      const searchRes = await axios.get(
        `https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`
      );

      const video = searchRes.data?.[0];
      if (!video || !video.url) throw new Error("দুঃখিত, এই নামে কোনো ভিডিও খুঁজে পাওয়া যায়নি!");

      await api.unsendMessage(tempMsgID).catch(() => {});

      const downloading = await api.sendMessage(
        `🎬 𝐕𝐈𝐃𝐄𝐎 𝐅𝐎𝐔𝐍𝐃!\n━━━━━━━━━━━━━━━\n📖 𝐓𝐢𝐭𝐥𝐞: ${video.title}\n⏱ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${video.time}\n⬇️ ভিডিও ফাইলটি প্রস্তুত হচ্ছে...`,
        threadID
      );
      tempMsgID = downloading.messageID;

      // ভিডিও ডাউনলোড লিংক সংগ্রহ (ইমরান এপিআই)
      const dlRes = await axios.get(
        `https://yt-api-imran.vercel.app/api?url=${video.url}`
      );

      const downloadUrl = dlRes.data?.downloadUrl;
      if (!downloadUrl) throw new Error("সার্ভার থেকে ডাউনলোড লিংক পাওয়া যায়নি!");

      const cacheDir = path.join(process.cwd(), "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `video_v5_${Date.now()}.mp4`);

      // হাই-স্পিড স্ট্রিম ডাউনলোড
      const response = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // ফাইলের সাইজ চেক করা (ফেসবুক লিমিট অনুযায়ী)
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB > 48) {
        if (fs.existsSync(filePath)) await fs.unlink(filePath);
        throw new Error(`ভিডিওর সাইজ (${fileSizeInMB.toFixed(2)}MB) ফেসবুকের লিমিট অতিক্রম করেছে। অনুগ্রহ করে ছোট ভিডিও ট্রাই করুন।`);
      }

      const finalMessage = {
        body:
          `✅ 𝐕𝐈𝐃𝐄𝐎 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐑𝐄𝐀𝐃𝐘\n━━━━━━━━━━━━━━━━━━━━\n` +
          `📖 𝐓𝐢𝐭𝐥𝐞: ${video.title}\n` +
          `⏱ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${video.time}\n` +
          `📂 𝐒𝐢𝐳𝐞: ${fileSizeInMB.toFixed(2)} MB\n` +
          `🔗 𝐔𝐑𝐋: ${video.url}` +
          sig,
        attachment: fs.createReadStream(filePath)
      };

      api.setMessageReaction("✅", messageID, () => {}, true);
      await api.unsendMessage(tempMsgID).catch(() => {});

      await api.sendMessage(finalMessage, threadID, async () => {
        if (fs.existsSync(filePath)) await fs.unlink(filePath);
      }, messageID);

    } catch (err) {
      if (tempMsgID) await api.unsendMessage(tempMsgID).catch(() => {});
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage(
        `❌ 𝐕𝟓 𝐄𝐑𝐑𝐎𝐑:\n━━━━━━━━━━━━━━━\n${err.message || "অপ্রত্যাশিত একটি সমস্যা হয়েছে।"}${sig}`,
        threadID,
        messageID
      );
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
