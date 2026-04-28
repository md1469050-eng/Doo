const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "ytmp4",
    version: "4.7.0",
    author: "BOTX666 🪬",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Download YouTube videos with high speed" },
    longDescription: { en: "Search and download YouTube videos with auto-clean cache system." },
    category: "media",
    guide: { en: "{pn} <song name>" }
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: BOTX666
 * 👤 OWNER: চাঁদের পাহাড়
 * 🛠️ PROJECT: SUPREME BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event }) {
    if (event.body && event.body.toLowerCase().startsWith("ytmp4")) {
      const input = event.body.split(/\s+/).slice(1).join(" ");
      if (!input) {
        return api.sendMessage("❌ | মামা, ভিডিওর নাম তো দিলা না!", event.threadID, event.messageID);
      }
      const args = event.body.split(/\s+/).slice(1);
      return this.onStart({ api, event, args });
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");

    // সময় ও তারিখ (Asia/Dhaka)
    const timeFull = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
    const dateFull = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
    const sig = `\n━━━━━━━━━━━━━━━━━━━━\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${timeFull}\n📅 তারিখ: ${dateFull}`;
    
    if (!query) return;

    try {
      api.setMessageReaction("🔍", messageID, () => {}, true);
      const search = await yts(query);
      const videos = search.videos.slice(0, 10);

      if (videos.length === 0) return api.sendMessage(`❌ | মামা, ইউটিউবে কিছু পাওয়া যায় নাই!${sig}`, threadID);

      let msg = "✨🔍 𝙔𝙤𝙪𝙏𝙪𝙗𝙚 𝙎𝙚𝙖𝙧𝙘𝙝 𝙍𝙚𝙨𝙪𝙡𝙩𝙨 ✨\n━━━━━━━━━━━━━━━━━━━━\n\n";
      videos.forEach((v, i) => {
        msg += `🟢 ${i + 1}. ${v.title}\n⏱ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${v.timestamp}\n\n`;
      });
      msg += "➡ ডাউনলোড করতে ১-১০ লিখে রিপ্লাই দাও।" + sig;

      const sent = await api.sendMessage(msg, threadID);

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "ytmp4",
        author: senderID,
        messageID: sent.messageID,
        videos,
        sig
      });
    } catch (err) {
      api.sendMessage("❌ | সার্চ করতে সমস্যা হচ্ছে মামা!", threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, body, senderID } = event;
    const { videos, author, messageID: replyMsgID, sig } = Reply;

    if (senderID !== author) return;

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > 10)
      return api.sendMessage("❌ মামা, ১ থেকে ১০ এর মধ্যে নাম্বার দে!", threadID);

    const video = videos[choice - 1];

    try {
      await api.unsendMessage(replyMsgID).catch(() => {});
      api.setMessageReaction("⏳", messageID, () => {}, true);
      
      const loading = await api.sendMessage(`🎬 ভিডিওটি প্রসেস হচ্ছে, দয়া করে অপেক্ষা করো...${sig}`, threadID);

      const infoRes = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp4?url=${encodeURIComponent(video.url)}`);
      const info = infoRes.data;
      
      // স্টেবল ফরম্যাট সিলেক্ট করা
      const format = info.formats.find(f => f.quality === "360p") || info.formats[0];

      const dlRes = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp4?url=${encodeURIComponent(video.url)}&format=${format.format_id}`);
      const videoUrl = dlRes.data.download.url;

      const cacheDir = path.join(process.cwd(), "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `yt_${Date.now()}.mp4`);

      const writer = fs.createWriteStream(filePath);
      const response = await axios({ url: videoUrl, method: "GET", responseType: "stream" });

      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.unsendMessage(loading.messageID).catch(() => {});

        const finalMsg = {
          body: `✅ এই নে মামা তোর ভিডিও!\n━━━━━━━━━━━━━━━━━━━━\n🎥 ${info.title}\n📺 𝐂𝐡𝐚𝐧𝐧𝐞𝐥: ${info.uploader}${sig}`,
          attachment: fs.createReadStream(filePath)
        };

        await api.sendMessage(finalMsg, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
        
        api.setMessageReaction("✅", messageID, () => {}, true);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage(`❌ ডাউনলোড ফেইল হইছে মামা! এপিআই সমস্যা থাকতে পারে।${sig}`, threadID);
    }
  }
};
