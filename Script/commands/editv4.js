const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "editv4",
    aliases: ["nanobanana", "imgv3"],
    version: "1.1.0",
    author: "BOTX666 🪬",
    countDown: 15,
    role: 0,
    shortDescription: { en: "Edit image using NanoBanana AI" },
    category: "AI",
    guide: {
      en: "ছবির ওপর রিপ্লাই দিয়ে লিখুন: {pn} <কি পরিবর্তন করতে চান>"
    },
  },

  onStart: async function ({ message, event, args, api }) {
    const { threadID, messageID, messageReply } = event;
    const prompt = args.join(" ");
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

    // ১. প্রম্পট চেক
    if (!prompt)
      return message.reply(`⚠️ চাঁদের পাহাড়, ছবিতে কি পরিবর্তন করতে চান তা লিখে দিন।${sig}`);

    // ২. ইমেজ রিপ্লাই চেক
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply(`⚠️ ছবিতে রিপ্লাই দিয়ে এডিট করতে বলুন।${sig}`);
    }

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo") {
      return message.reply(`⚠️ শুধুমাত্র ছবিতে রিপ্লাই দিয়ে এই কমান্ড ব্যবহার করা যাবে।${sig}`);
    }

    // প্রসেসিং শুরু হলে রিঅ্যাকশন
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const imgUrl = encodeURIComponent(attachment.url);
      const requestURL = `https://mahbub-ullash.cyberbot.top/api/nano-banana?prompt=${encodeURIComponent(prompt)}&imageUrl=${imgUrl}`;

      // ৩. এপিআই থেকে ডেটা সংগ্রহ
      const res = await axios.get(requestURL, { timeout: 60000 });

      if (!res.data || res.data.status !== true || !res.data.image) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return message.reply("❌ এপিআই থেকে ছবি তৈরি করা সম্ভব হয়নি। পরে চেষ্টা করুন।");
      }

      const finalImageURL = res.data.image;
      const cacheDir = path.join(__dirname, "cache");
      
      // ফোল্ডার না থাকলে তৈরি করা
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `editv3_${Date.now()}.jpg`);

      // ৪. ইমেজ ডাউনলোড ও সেভ (Stream Method)
      const response = await axios({
        url: finalImageURL,
        method: "GET",
        responseType: "stream",
        timeout: 60000,
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // সাকসেস রিঅ্যাকশন
      api.setMessageReaction("✅", messageID, () => {}, true);

      // ৫. আউটপুট মেসেজ
      await message.reply({
        body: `🎨 𝐈𝐦𝐚𝐠𝐞 𝐄𝐝𝐢𝐭𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!${sig}`,
        attachment: fs.createReadStream(filePath),
      }, () => {
        // ফাইল ডিলিট করা (স্টোরেজ ক্লিন রাখতে)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error("ERROR:", err.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply("❌ সার্ভার ত্রুটির কারণে ছবিটি প্রসেস করা সম্ভব হয়নি!");
    }
  },
};
