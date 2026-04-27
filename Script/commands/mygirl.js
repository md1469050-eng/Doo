const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "mygirl",
    aliases: ["mahgirl", "gf"],
    version: "2.0.0",
    author: "BELAL ⊶ BOTX666 🪬",
    countDown: 8,
    role: 0,
    shortDescription: { en: "কাউকে ট্যাগ করে 'My Girl' ছবি তৈরি করুন" },
    category: "fun",
    guide: { en: "{pn} @mention or reply" }
  },

  onStart: async function ({ api, event, args, message, Users }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    const startTime = Date.now();
    
    // আপনার নতুন সিগনেচার স্টাইল
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

    // ১. টার্গেট আইডি সংগ্রহ
    const targetID = Object.keys(mentions)[0] || messageReply?.senderID;

    if (!targetID) {
      return message.reply("⚠️ বেলাল ভাই, ট্যাগ করুন অথবা কাউকে রিপ্লাই দিয়ে কমান্ডটি ব্যবহার করুন!");
    }

    // ২. ক্যাশ ডিরেক্টরি সেটআপ
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `mygirl_${senderID}_${targetID}.png`);

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      // ৩. এপিআই ইউআরএল (প্যারালাল ফেচিং এর জন্য বেস ইউআরএল ব্যবহার করা হয়েছে)
      const baseUrlRes = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
      const apiUrl = `${baseUrlRes.data.mahmud}/api/myboy?user1=${senderID}&user2=${targetID}`;

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      const latency = Date.now() - startTime;
      const targetName = await Users.getNameUser(targetID);

      // ৪. প্রিমিয়াম আউটপুট ডেলিভারি
      const resultMsg = `╭━━━❖✦🪬✦❖━━━╮\n  ✡️  চাঁদের 𖤍 পাহাড়  🪬\n╰━━━❖✦🪬✦❖━━━╯\n\n` +
        `🖤 𝐓𝐇𝐀𝐓'𝐒 𝐌𝐀𝐇 𝐆𝐈𝐑𝐋 🖤\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👤 𝗧𝗮𝗿𝗴𝗲𝘁 : ${targetName}\n` +
        `⚡ 𝗦𝗽𝗲𝗲𝗱  : ${latency}ms\n\n` +
        `𖤍 𝗔𝗱𝗺𝗶𝗻  : BELAL ⊶ BOTX666 🪬${sig}`;

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage({
        body: resultMsg,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, messageID);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      return message.reply("❌ দুঃখিত বেলাল ভাই, ইমেজ জেনারেট করতে সমস্যা হয়েছে!");
    }
  }
};
