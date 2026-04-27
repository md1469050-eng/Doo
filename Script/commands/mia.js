const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "mia",
    aliases: ["miakhalifa", "funny_mia"],
    version: "2.0.0",
    author: "Belal YT",
    countDown: 8,
    role: 0,
    category: "fun",
    shortDescription: { en: "মিয়া খলিফার ছবিতে আপনার টেক্সট বসান" },
    guide: { en: "{pn} [আপনার টেক্সট]" }
  },

  // ✨ স্মার্ট টেক্সট র‍্যাপিং লজিক
  wrapText: (ctx, text, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      let word = words[i];
      let width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID } = event;
    const text = args.join(" ");
    const sig = "\n┈───╼ ┄┉❈✡️ Chander Pahar ✿⃝🪬 ╾───┈";
    const startTime = Date.now();

    if (!text) return message.reply("📝 বেলাল ভাই, ছবিতে কী লেখা থাকবে তা তো দিলেন না! (যেমন: /mia আমি অনেক ভালো মেয়ে)");

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
    const pathImg = path.join(cacheDir, `mia_${Date.now()}.png`);

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      // ১. টেমপ্লেট ইমেজ ডাউনলোড
      const imageURL = "https://i.ibb.co/4gDpt4Tx/img-1765026096438.jpg";
      const res = await axios.get(imageURL, { responseType: "arraybuffer" });
      fs.writeFileSync(pathImg, Buffer.from(res.data));

      // ২. ক্যানভাস এডিটিং
      const baseImage = await loadImage(pathImg);
      const canvasImg = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvasImg.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvasImg.width, canvasImg.height);

      // ৩. ফন্ট সেটিংস
      ctx.font = "300 28px Arial"; 
      ctx.fillStyle = "#000000";
      ctx.textAlign = "start";

      const lines = this.wrapText(ctx, text, 550);
      const startY = 165; // টেক্সট পজিশন সামান্য নিচে সেট করা হয়েছে

      // ৪. লাইন অনুযায়ী টেক্সট ড্রয়িং
      lines.forEach((line, index) => {
        ctx.fillText(line, 50, startY + (index * 35)); // লাইন স্পেসিং ৩৫
      });

      fs.writeFileSync(pathImg, canvasImg.toBuffer());

      const latency = Date.now() - startTime;
      api.setMessageReaction("✅", messageID, () => {}, true);

      // ৫. ফাইনাল মেসেজ ডেলিভারি
      const finalCaption = `╭━━━━━━━⊱ 💠 ⊰━━━━━━━╮\n   🎬 𝗠𝗜𝗔 𝗠𝗘𝗠𝗘 𝗗𝗢𝗡𝗘 🎬\n╰━━━━━━━⊱ 💠 ⊰━━━━━━━╯\n\n` +
        `📊 𝗔𝗡𝗔𝗟𝗬𝗧𝗜𝗖𝗦:\n` +
        `⚡ 𝗦𝗽𝗲𝗲𝗱  : ${latency}ms\n` +
        `🏔️ 𝗕𝗿𝗮𝗻𝗱  : চাঁদের পাহাড়\n` +
        `👑 𝗔𝗱𝗺𝗶𝗻  : BELAL YT${sig}`;

      return api.sendMessage({
        body: finalCaption,
        attachment: fs.createReadStream(pathImg)
      }, threadID, () => {
        if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
      }, messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
      return message.reply("❌ দুঃখিত বেলাল ভাই, মেমে তৈরি করতে সমস্যা হয়েছে!");
    }
  },
};
