const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "eeed",
    aliases: ["nedit", "ai-edit"],
    version: "2.0.0",
    author: "Belal x Gemini",
    countDown: 15,
    role: 0,
    shortDescription: { en: "AI Image Editing with Pro Analytics" },
    longDescription: { en: "Edit images using Nano AI with high-speed processing and luxury logs" },
    category: "image",
    guide: {
      en: "{pn} <prompt> --ratio <1:1|4:3|3:2|16:9>"
    }
  },

  onStart: async function ({ message, event, api, args }) {
    const startTime = Date.now();
    const sig = "\n┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্্ড়ৃঁ✿⃝🪬 ╾───┈";
    const { threadID, messageID, messageReply, type } = event;

    // ১. রিপ্লাই চেক
    const hasPhoto = type === "message_reply" && messageReply?.attachments?.[0]?.type === "photo";
    if (!hasPhoto) return message.reply("⚠️ দয়া করে একটি ইমেজে রিপ্লাই দিয়ে আপনার প্রম্পট লিখুন।");

    // ২. ইনপুট ও রেশিও ফিল্টারিং
    const input = args.join(" ");
    if (!input) return message.reply("❌ আপনি কী ধরণের এডিট চান তার প্রম্পট দিন।\nউদাহরণ: {pn} convert to 3D disney --ratio 16:9");

    const ratioMatch = input.match(/--ratio\s+(1:1|4:3|3:2|16:9)/);
    const ratio = ratioMatch ? ratioMatch[1] : "1:1";
    const prompt = input.replace(/--ratio\s+(1:1|4:3|3:2|16:9)/, "").trim();

    const imageUrl = messageReply.attachments[0].url;
    const cachePath = path.join(__dirname, "cache", `pro_edit_${Date.now()}.png`);

    try {
      // ৩. লোডিং অ্যানিমেশন ও রিঅ্যাকশন
      api.setMessageReaction("⏳", messageID, () => {}, true);
      const processingMsg = await message.reply("🔄 𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚: আপনার ইমেজটি AI সার্ভারে এডিট হচ্ছে, দয়া করে অপেক্ষা করুন...");

      // ৪. এপিআই কল (Nano AI Engine)
      const response = await axios.get("https://rifatapiv3.vercel.app/api/ai-image/nano", {
        params: { url: imageUrl, p: prompt, ratio: ratio },
        timeout: 300000 // ৫ মিনিট টাইমআউট
      });

      const resultUrl = response.data?.result;

      if (!resultUrl || response.data.status !== "success") {
        throw new Error("API থেকে সঠিক রেসপন্স পাওয়া যায়নি।");
      }

      // ৫. ইমেজ ডাউনলোড ও বাফার প্রসেসিং
      const imageRes = await axios.get(resultUrl, { responseType: 'arraybuffer' });
      await fs.outputFile(cachePath, Buffer.from(imageRes.data));

      const latency = Date.now() - startTime;
      const execID = "EDT-" + Math.floor(Math.random() * 90000);

      // ৬. প্রিমিয়াম আউটপুট ডেলিভারি
      api.setMessageReaction("✅", messageID, () => {}, true);
      
      const successMsg = `╭━━━━━━━⊱ 💠 ⊰━━━━━━━╮\n   ✨ 𝗔𝗜 𝗘𝗗𝗜𝗧 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘 ✨\n╰━━━━━━━⊱ 💠 ⊰━━━━━━━╯\n\n` +
        `📝 𝗣𝗿𝗼𝗺𝗽𝘁 : ${prompt}\n` +
        `📐 𝗥𝗮𝘁𝗶𝗼  : ${ratio}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🌐 𝗔𝗡𝗔𝗟𝗬𝗧𝗜𝗖𝗦:\n` +
        `⚡ 𝗦𝗽𝗲𝗲𝗱 : ${latency}ms\n` +
        `🛡️ 𝗦𝘁𝗮𝘁𝘂𝘀: Verified 🟢\n` +
        `🆔 𝗜𝗗     : ${execID}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👑 Admin: BELAL (Verified)${sig}`;

      await message.reply({
        body: successMsg,
        attachment: fs.createReadStream(cachePath)
      });

      // পুরাতন প্রসেসিং মেসেজ মুছে ফেলা
      api.unsendMessage(processingMsg.messageID);

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      console.error(err);
      return message.reply(`✖️ এরর: ${err.message || "সার্ভার বিজি আছে, পরে চেষ্টা করুন।"}`);
    } finally {
      // ৭. অটো ক্যাশ ক্লিনিং (১০ সেকেন্ড পর)
      if (fs.existsSync(cachePath)) {
        setTimeout(() => fs.unlinkSync(cachePath), 10000);
      }
    }
  }
};
