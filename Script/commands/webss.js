const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "webss",
    version: "1.2.0",
    author: "BELAL ⊶ BOTX666 🪬",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Capture website screenshot"
    },
    longDescription: {
      en: "যেকোনো ওয়েবসাইটের ফুল পেজ স্ক্রিনশট তুলে পাঠাবে।"
    },
    category: "tools",
    guide: {
      en: "{p}webss <url>\nExample: {p}webss google.com"
    }
  },

  langs: {
    en: {
      missing: "⚠️ চাঁদের পাহাড়, একটি সঠিক ওয়েবসাইট লিঙ্ক দিন।\n📌 উদাহরণ: webss facebook.com",
      loading: "📸 𝐖𝐄𝐁 𝐒𝐂𝐑𝐄𝐄𝐍𝐒𝐇𝐎𝐓\n━━━━━━━━━━━━━━━\n🌐 𝐔𝐫𝐥: %1\n🪬 চাঁদের পাহাড়, পেজটি ক্যাপচার করা হচ্ছে...",
      error: "❌ স্ক্রিনশট নিতে ব্যর্থ হয়েছি! লিঙ্কটি সঠিক কিনা চেক করুন।"
    }
  },

  onStart: async function ({ api, event, args, getLang }) {
    const { threadID, messageID } = event;
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

    if (!args[0]) return api.sendMessage(getLang("missing") + sig, threadID, messageID);

    const url = args[0].startsWith("http") ? args[0] : `https://${args[0]}`;
    const waitMsg = await api.sendMessage(getLang("loading", url), threadID);

    try {
      const apiUrl = `https://api.popcat.xyz/v2/screenshot?url=${encodeURIComponent(url)}`;
      
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `webss_${Date.now()}.png`);
      await fs.writeFile(filePath, res.data);

      await api.unsendMessage(waitMsg.messageID);

      await api.sendMessage({
        body: `╭━━━━━━⊱📸⊰━━━━━━╮\n   𝐒𝐂𝐑𝐄𝐄𝐍𝐒𝐇𝐎𝐓 𝐑𝐄𝐀𝐃𝐘\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n🌐 𝐔𝐫𝐥: ${url}\n📊 𝐒𝐭𝐚𝐭𝐮𝐬: Captured\n\n𖤍 𝐀𝐝𝐦𝐢𝐧: MD BELAL (BS Dealer)\n🏠 𝐇𝐨𝐦𝐞: KURIGRAM, BD${sig}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);

    } catch (err) {
      console.error(err);
      if (waitMsg) await api.unsendMessage(waitMsg.messageID);
      api.sendMessage(getLang("error") + sig, threadID, messageID);
    }
  }
};
