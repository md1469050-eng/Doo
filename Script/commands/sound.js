const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

const API_CONFIG_URL = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "sound",
    aliases: ["soundmeme", "audio", "snd"],
    version: "1.5.0",
    author: "BOTX666 🪬",
    countDown: 8,
    role: 0,
    category: "media",
    guide: {
      en: "{pn} [sound name]\nExample: {pn} oh no"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    // সময় ও তারিখ সিস্টেম (Asia/Dhaka)
    const time = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
    const date = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
    const sig = `\n━━━━━━━━━━━━━━━━━━━━\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${time}\n📅 তারিখ: ${date}`;

    if (!query) {
      return api.sendMessage(`⚠️ চাঁদের পাহাড়, আপনি কোন সাউন্ডটি খুঁজছেন তার নাম লিখুন।${sig}`, threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    const cachePath = path.join(__dirname, "cache", `snd_${Date.now()}.mp3`);
    await fs.ensureDir(path.dirname(cachePath));

    try {
      // ১. এপিআই ইউআরএল সংগ্রহ
      const configRes = await axios.get(API_CONFIG_URL);
      const baseUrl = configRes.data.api;

      // ২. সাউন্ড অনুসন্ধান
      const res = await axios.get(`${baseUrl}/soundmeme?q=${encodeURIComponent(query)}`);
      const result = res.data.results[0];

      if (!result || !result.sound) {
        throw new Error("Sound not found");
      }

      // ৩. অডিও ফাইল ডাউনলোড
      const audioRes = await axios.get(result.sound, { responseType: "arraybuffer" });
      await fs.writeFile(cachePath, Buffer.from(audioRes.data));

      api.setMessageReaction("✅", messageID, () => {}, true);

      // ৪. অডিও পাঠানো এবং ক্যাশ ক্লিনআপ
      await api.sendMessage({
        body: `🎵 𝐒𝐨𝐮𝐧𝐝 𝐅𝐨𝐮𝐧𝐝: ${result.title}${sig}`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, messageID);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      return api.sendMessage(`❌ দুঃখিত, আপনার কাঙ্ক্ষিত সাউন্ডটি খুঁজে পাওয়া যায়নি।${sig}`, threadID, messageID);
    }
  }
};
