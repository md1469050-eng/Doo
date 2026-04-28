const axios = require('axios');
const fs = require('fs-extra'); 
const path = require('path');

module.exports = {
  config: {
    name: "imagen4",
    aliases: ["img4", "gen4", "pixel"],
    version: "2.1.0", 
    author: "BOTX666 🪬",
    countDown: 15,
    role: 0,
    shortDescription: { en: "Generate high-quality AI images" },
    category: "ai-image",
    guide: {
      en: "{pn} <আপনার কল্পনা বা প্রম্পট>"
    }
  },

  onStart: async function({ api, message, args, event }) {
    const { threadID, messageID } = event;
    const prompt = args.join(" ");
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

    // ১. প্রম্পট চেক
    if (!prompt) {
      return message.reply(`⚠️ চাঁদের পাহাড়, আপনি কী ধরনের ছবি তৈরি করতে চান তা লিখে দিন।${sig}`);
    }

    // প্রসেসিং রিঅ্যাকশন
    api.setMessageReaction("🎨", messageID, () => {}, true);
    let tempFilePath; 

    try {
      const API_ENDPOINT = "https://neokex-img-api.vercel.app/generate";
      const fullApiUrl = `${API_ENDPOINT}?prompt=${encodeURIComponent(prompt.trim())}&m=imagen4`;

      // ২. এপিআই থেকে ইমেজ স্ট্রিম রিকোয়েস্ট
      const response = await axios.get(fullApiUrl, {
        responseType: 'stream',
        timeout: 90000 // ইমেজ জেনারেট হতে সময় লাগলে যেন এরর না দেয়
      });

      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir); 

      tempFilePath = path.join(cacheDir, `imagen4_${Date.now()}.png`);
      const writer = fs.createWriteStream(tempFilePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", (err) => {
          writer.close();
          reject(err);
        });
      });

      api.setMessageReaction("✅", messageID, () => {}, true);

      // ৩. ফাইনাল আউটপুট ডিজাইন
      await message.reply({
        body: `✨ 𝐈𝐦𝐚𝐠𝐞𝐧 𝟒 𝐀𝐈 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 ✨\n━━━━━━━━━━━━━━━\n📝 𝐏𝐫𝐨𝐦𝐩𝐭: ${prompt}${sig}`,
        attachment: fs.createReadStream(tempFilePath)
      });

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      console.error("Imagen4 Error:", error);
      return message.reply(`❌ ছবি তৈরি করতে ব্যর্থ হয়েছি! সার্ভার ডাউন থাকতে পারে।${sig}`);
    } finally {
      // ৪. ফাইল ক্লিন-আপ
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        setTimeout(() => {
          try { fs.unlinkSync(tempFilePath); } catch (e) {}
        }, 5000);
      }
    }
  }
};
