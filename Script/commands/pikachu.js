const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pikachu",
    aliases: ["pika", "pika_meme"],
    version: "2.0.0",
    author: "BELAL ⊶ BOTX666 🪬",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "পিকাচু ইমেজে আপনার টেক্সট বসান"
    },
    category: "fun",
    guide: {
      en: "{pn} <text>\nউদাহরণ: {pn} হাই বেলাল ভাই"
    }
  },

  onStart: async function ({ api, event, message, args }) {
    const { threadID, messageID } = event;
    const startTime = Date.now();
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

    // ১. ইনপুট চেক
    if (!args.length) {
      return message.reply("⚠️ বেলাল ভাই, ছবিতে কী লেখা থাকবে তা তো দিলেন না!");
    }

    const text = encodeURIComponent(args.join(" "));

    // ২. ক্যাশ ডিরেক্টরি সেটআপ
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
    const filePath = path.join(cacheDir, `pikachu_${Date.now()}.png`);

    try {
      // শুরুতে রিঅ্যাকশন
      api.setMessageReaction("⏳", messageID, () => {}, true);

      // ৩. এপিআই কল
      const res = await axios.get(`https://api.popcat.xyz/v2/pikachu?text=${text}`, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, Buffer.from(res.data));

      const latency = Date.now() - startTime;
      api.setMessageReaction("✅", messageID, () => {}, true);

      // ৪. প্রিমিয়াম আউটপুট ডিজাইন
      const resultMsg = `╭━━━❖✦🪬✦❖━━━╮\n  ✡️  চাঁদের 𖤍 পাহাড়  🪬\n╰━━━❖✦🪬✦❖━━━╯\n\n` +
        `⚡ এই নাও তোমার পিকাচু মেমে!\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⚡ 𝗦𝗽𝗲𝗲𝗱 : ${latency}ms\n\n` +
        `𖤍 𝗔𝗱𝗺𝗶𝗻 : BELAL ⊶ BOTX666 🪬${sig}`;

      return message.reply({
        body: resultMsg,
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return message.reply("❌ দুঃখিত বেলাল ভাই, ইমেজ জেনারেট করতে সমস্যা হয়েছে!");
    }
  }
};
