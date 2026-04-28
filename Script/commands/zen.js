const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "zen",
    aliases: ["wisdom", "motivation", "উক্তি", "বাণী"],
    version: "3.0.0",
    author: "BOTX666 🪬",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: { en: "Get a legendary inspirational quote" },
    longDescription: { en: "Provides world-class motivational and Zen quotes with fail-safe backup APIs." },
    guide: { en: "{pn}" }
  },

  onStart: async function({ api, event, message }) {
    const { threadID, messageID } = event;

    // সময় ও তারিখ (Asia/Dhaka)
    const timeFull = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
    const dateFull = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
    const sig = `\n━━━━━━━━━━━━━━━━━━━━\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${timeFull}\n📅 তারিখ: ${dateFull}`;

    api.setMessageReaction("🔮", messageID, () => {}, true);

    // মাল্টিপল এপিআই সোর্স (যাতে ১০০% কাজ করে)
    const apiSources = [
      "https://zenquotes.io/api/random",
      "https://api.quotable.io/random",
      "https://type.fit/api/quotes"
    ];

    try {
      let quote, author;

      // প্রথম সোর্স ট্রাই করা
      try {
        const res = await axios.get(apiSources[0]);
        quote = res.data[0].q;
        author = res.data[0].a;
      } catch (err) {
        // ব্যাকআপ সোর্স ট্রাই করা
        const resBackup = await axios.get(apiSources[1]);
        quote = resBackup.data.content;
        author = resBackup.data.author;
      }

      // এডিট করে পাঠানোর ফিলিং দেওয়ার জন্য ছোট বিলম্ব
      const loadingMsg = await message.reply("⏳ মহাজাগতিক জ্ঞান সংগ্রহ করা হচ্ছে...");

      const finalResponse = 
        `📜 𝐖𝐈𝐒𝐃𝐎𝐌 𝐎𝐅 𝐓𝐇𝐄 𝐀𝐆𝐄𝐒 📜\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `“${quote}”\n\n` +
        `— ✍️ ${author || "Unknown Master"}\n\n` +
        `💡 𝐍𝐨𝐭𝐞: একটি ইতিবাচক চিন্তা আপনার পুরো দিনটি বদলে দিতে পারে।` +
        sig;

      setTimeout(async () => {
        await api.editMessage(finalResponse, loadingMsg.messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
      }, 1500);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      message.reply(`❌ এই মুহূর্তে কোনো বাণী পাওয়া যায়নি। সম্ভবত মহাকাশে নেটওয়ার্ক সমস্যা!${sig}`);
    }
  }
};
