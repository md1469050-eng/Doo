const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "i",
    aliases: ["image", "im", "belal_ai"],
    version: "3.0.0",
    author: "Belal YT",
    countDown: 15,
    role: 0,
    shortDescription: { en: "টেক্সট থেকে একাধিক AI ইমেজ তৈরি করুন" },
    longDescription: { en: "Generate high-quality multiple AI images using advanced processing and Chander Pahar UI" },
    category: "AI-IMAGE",
    guide: { en: "উদাহরণ: {pn} cute girl | 4 (৪টি ছবি তৈরি হবে, সর্বোচ্চ ১০)" },
    dependencies: { "fs-extra": "", "path": "", "axios": "", "moment-timezone": "" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, senderID } = event;
    const startTime = Date.now();
    const sig = "\n┈───╼ ┄┉❈✡️ Chander Pahar ✿⃝🪬 ╾───┈";
    const cacheDir = path.join(__dirname, "cache", `ai_images_${senderID}`);

    try {
      // ১. ইনপুট ও প্রম্পট হ্যান্ডলিং
      const input = args.join(" ");
      if (!input) {
        return message.reply("⚠️ দয়া করে আপনি কী ধরণের ছবি চান তার একটি প্রম্পট দিন।\nউদাহরণ: {pn} a cyberpunk city | 2");
      }

      api.setMessageReaction("⏳", messageID, () => {}, true);

      let prompt, quantity;
      if (input.includes("|")) {
        [prompt, quantity] = input.split("|").map(str => str.trim());
        quantity = parseInt(quantity);
        if (isNaN(quantity) || quantity < 1 || quantity > 10) {
          quantity = 4; // ডিফল্ট বা ইনভ্যালিড হলে ৪টি
        }
      } else {
        prompt = input;
        quantity = 4; // ডিফল্ট ৪টি ছবি
      }

      const waitingMsgBody = `╭━━━━━━━⊱ 💠 ⊰━━━━━━━╮\n   ✨ 𝗔𝗜 𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗘𝗗 ✨\n╰━━━━━━━⊱ 💠 ⊰━━━━━━━╯\n\n🔄 আপনার জন্য ${quantity}টি প্রিমিয়াম ছবি তৈরি হচ্ছে, দয়া করে একটু অপেক্ষা করুন...⏳`;
      const waitingMessage = await message.reply(waitingMsgBody);

      // ২. প্যারালাল ইমেজ জেনারেশন (High Speed API Call)
      const ratio = "1:1";
      const imageGenerationPromises = [];
      const cacheFiles = [];
      await fs.ensureDir(cacheDir);

      for (let i = 0; i < quantity; i++) {
        // প্রতিটি ছবি জেনারেশনের জন্য একটি আলাদা প্রমিস (Parallel Execution)
        imageGenerationPromises.push((async (index) => {
          const res = await axios.get(`https://www.ai4chat.co/api/image/generate`, {
            params: { prompt, aspect_ratio: ratio }
          });
          
          if (res.data?.image_link) {
            const url = res.data.image_link;
            // ছবি ডাউনলোড ও ক্যাশে সেভ
            const imageRes = await axios.get(url, { responseType: 'arraybuffer' });
            const filePath = path.join(cacheDir, `img_${execID}_${index}.png`);
            await fs.writeFile(filePath, Buffer.from(imageRes.data));
            cacheFiles.push(filePath);
            return filePath;
          }
          return null;
        })(i));
      }

      const execID = "IM-" + Math.floor(Math.random() * 90000);
      
      // সব ছবি একসাথে জেনারেট ও ডাউনলোড হওয়ার জন্য অপেক্ষা (Parallel Efficiency)
      const generatedPaths = (await Promise.all(imageGenerationPromises)).filter(p => p !== null);

      if (generatedPaths.length === 0) {
        throw new Error("API থেকে ছবি জেনারেট করা সম্ভব হয়নি। পরে চেষ্টা করুন।");
      }

      // ৩. প্রিমিয়াম আউটপুট ডেলিভারি
      const latency = Date.now() - startTime;
      const time = moment().tz("Asia/Dhaka").format("hh:mm:ss A");
      
      const successMsg = `╭━━━━━━━⊱ 💠 ⊰━━━━━━━╮\n   🎨 𝗔𝗜 𝗜𝗠𝗔𝗚𝗘𝗦 𝗗𝗢𝗡𝗘 🎨\n╰━━━━━━━⊱ 💠 ⊰━━━━━━━╯\n\n` +
        `✅ প্রিয় বস! আপনার জন্য ছবিগুলো সফলভাবে তৈরি করা হয়েছে।\n\n` +
        `📝 𝗣𝗿𝗼𝗺𝗽𝘁  : ${prompt}\n` +
        `🔢 𝗤𝘂𝗮𝗻𝘁𝗶𝘁𝘆: ${generatedPaths.length}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🌐 𝗔𝗡𝗔𝗟𝗬𝗧𝗜𝗖𝗦:\n` +
        `⚡ 𝗦𝗽𝗲𝗲𝗱  : ${latency}ms\n` +
        `⏰ 𝗧𝗶𝗺𝗲   : ${time}\n` +
        `🆔 𝗜𝗗     : ${execID}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🏔️ 𝗕𝗿𝗮𝗻𝗱  : চাঁদের পাহাড়\n` +
        `👑 𝗔𝗱𝗺𝗶𝗻  : BELAL YT${sig}`;

      // মিরাই/গোস্টবট এ্যাটাচমেন্ট স্ট্রিম হ্যান্ডলিং
      const attachments = generatedPaths.map(p => fs.createReadStream(p));

      await message.reply({ body: successMsg, attachment: attachments }, threadID, messageID);

      // ৪. ক্লিন আপ
      await api.unsendMessage(waitingMessage.messageID);
      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      message.reply("❌ ছবি তৈরি করতে সমস্যা হয়েছে! সার্ভার বিজি থাকতে পারে।");
    } finally {
      // ৫. ১০ সেকেন্ড পর অটো ক্যাশ ক্লিন
      setTimeout(() => fs.emptyDir(cacheDir).catch(() => {}), 10000);
    }
  },
};
