const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

async function getStream(url) {
  const res = await axios({ url, responseType: "stream" });
  return res.data;
}

module.exports = {
  config: {
    name: "xnxxv3",
    aliases: ["xv3", "video3"],
    version: "3.0.0",
    author: "BOTX666 🪬",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Search and download videos via reply" },
    category: "media",
    guide: { en: "{pn} <keyword>" }
  },

  onStart: async function ({ api, args, event, commandName }) {
    const { threadID, messageID, senderID } = event;
    let base;

    // সময় ও তারিখ (Asia/Dhaka)
    const timeFull = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
    const dateFull = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
    const sig = `\n━━━━━━━━━━━━━━━━━━━━\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${timeFull}\n📅 তারিখ: ${dateFull}`;

    try {
      const configRes = await axios.get(nix);
      base = configRes.data?.api;
      if (!base) throw new Error();
    } catch (e) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ এপিআই কনফিগারেশন সংগ্রহ করতে ব্যর্থ।${sig}`, threadID, messageID);
    }

    const query = args.join(" ");
    if (!query) return api.sendMessage(`⚠️ একটি কি-ওয়ার্ড দিন।\n📌 উদাহরণ: xnxxv3 horror video${sig}`, threadID, messageID);

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const res = await axios.get(`${base}/xnx?q=${encodeURIComponent(query)}`);
      const results = res.data.result;

      if (!results || results.length === 0) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`❌ দুঃখিত, কোনো রেজাল্ট পাওয়া যায়নি।${sig}`, threadID, messageID);
      }

      const limitedResults = results.slice(0, 6);
      let msg = `🎬 𝐕𝐈𝐃𝐄𝐎 𝐒𝐄𝐀𝐑𝐂𝐇 𝐑𝐄𝐒𝐔𝐋𝐓𝐒\n━━━━━━━━━━━━━━━━━━━━\n🔍 𝐐𝐮𝐞𝐫𝐲: "${query}"\n\n`;
      const thumbnails = [];

      for (let i = 0; i < limitedResults.length; i++) {
        const v = limitedResults[i];
        msg += `${i + 1}. ${v.title}\n⏱️ ${v.duration || 'N/A'} | 👀 ${v.views || 'N/A'}\n\n`;
        
        if (v.thumbnail) {
          try {
            thumbnails.push(await getStream(v.thumbnail));
          } catch (e) {}
        }
      }

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage(
        {
          body: msg + "📝 ডাউনলোড করতে ১-৬ লিখে রিপ্লাই দিন।" + sig,
          attachment: thumbnails
        },
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            results: limitedResults,
            messageID: info.messageID,
            author: senderID,
            commandName: commandName,
            base,
            sig
          });
        },
        messageID
      );

    } catch (e) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ অনুসন্ধান ব্যর্থ হয়েছে। পরে চেষ্টা করুন।${sig}`, threadID, messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { results, author, messageID, base, sig } = Reply;
    const { threadID, senderID, body, messageID: replyMsgID } = event;
    
    if (senderID !== author) return;

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > results.length) {
      return api.sendMessage("❌ ১ থেকে ৬ এর মধ্যে সঠিক সংখ্যাটি নির্বাচন করুন।", threadID, replyMsgID);
    }

    const selected = results[choice - 1];
    await api.unsendMessage(messageID).catch(() => {});
    api.setMessageReaction("⬇️", replyMsgID, () => {}, true);

    try {
      const dlRes = await axios.get(`${base}/xnxdl?url=${encodeURIComponent(selected.link)}`);
      const data = dlRes.data.result;
      const videoUrl = data.files.high || data.files.low;

      const cachePath = path.join(process.cwd(), 'cache');
      if (!fs.existsSync(cachePath)) fs.ensureDirSync(cachePath);
      const filePath = path.join(cachePath, `xnxxv3_${Date.now()}.mp4`);

      const vidRes = await axios.get(videoUrl, { responseType: "arraybuffer" });
      
      // ফাইল সাইজ চেক (ফেসবুক লিমিট)
      const fileSize = vidRes.data.byteLength / (1024 * 1024);
      if (fileSize > 48) {
        return api.sendMessage(`❌ ভিডিওর সাইজ (${fileSize.toFixed(2)} MB) অনেক বড়। এটি পাঠানো সম্ভব নয়।${sig}`, threadID, replyMsgID);
      }

      fs.writeFileSync(filePath, Buffer.from(vidRes.data));

      const responseBody = `✅ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋\n━━━━━━━━━━━━━━━━━━━━\n🎬 𝐓𝐢𝐭𝐥𝐞: ${data.title}\n⏱️ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${data.duration || 'N/A'}\n👀 𝐈𝐧𝐟𝐨: ${data.info || 'N/A'}${sig}`;

      await api.sendMessage(
        { body: responseBody, attachment: fs.createReadStream(filePath) },
        threadID,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          api.setMessageReaction("✅", replyMsgID, () => {}, true);
        },
        replyMsgID
      );

    } catch (e) {
      api.setMessageReaction("❌", replyMsgID, () => {}, true);
      return api.sendMessage(`❌ দুঃখিত, ভিডিওটি ডাউনলোড করা সম্ভব হয়নি।${sig}`, threadID, replyMsgID);
    }
  }
};
