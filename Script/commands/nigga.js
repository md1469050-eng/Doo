const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "nigga",
    aliases: ["roast", "burn"],
    version: "1.2.0",
    author: "BOTX666 🪬",
    countDown: 5,
    role: 0,
    category: "Fun",
    description: {
      en: "Send a roast image using target UID with premium signature."
    },
    guide: {
      en: "{pn} @mention | or use without mention to roast yourself."
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions } = event;
    
    // সময় ও তারিখ (Asia/Dhaka)
    const bdTime = moment.tz("Asia/Dhaka").format("hh:mm A");
    const bdDate = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
    const header = "💀 ━━━『 𝐑𝐎𝐀𝐒𝐓 𝐌𝐀𝐒𝐓𝐄𝐑 』━━━ 💀";
    const sig = `\n━━━━━━━━━━━━━━━━━━━━\n🏔️ 𝖲𝗂𝗀𝗇: 𝖢𝗁𝖺𝗇𝖽𝖾𝗋 𝖯𝖺𝗁𝖺𝗋\n⏰ 𝖳𝗂𝗆𝖾: ${bdTime} | ${bdDate}`;

    try {
      const mention = Object.keys(mentions || {});
      const targetUID = mention.length > 0 ? mention[0] : senderID;

      api.setMessageReaction("⏳", messageID, () => {}, true);

      // API URL (Your provided source)
      const url = `https://betadash-api-swordslush-production.up.railway.app/nigga?userid=${targetUID}`;
      
      const response = await axios.get(url, { responseType: 'arraybuffer' });

      const cacheDir = path.join(process.cwd(), "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `roast_${targetUID}_${Date.now()}.jpg`);

      await fs.writeFile(filePath, Buffer.from(response.data));

      const bodyMsg = `Look I found a nigga 😂${sig}`;

      await api.sendMessage({
        body: bodyMsg,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);

      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (e) {
      console.error("Roast Error:", e.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage(`❌ ইমেজে জেনারেট করতে সমস্যা হয়েছে। এপিআই সার্ভার চেক করুন।${sig}`, threadID, messageID);
    }
  }
};
