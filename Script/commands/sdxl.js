const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sdxl",
    aliases: ["imagine", "draw", "art"],
    version: "2.0.0",
    author: "BELAL ⊶ BOTX666 🪬",
    countDown: 15,
    role: 0,
    shortDescription: { en: "SDXL লাইট দিয়ে এআই ছবি তৈরি করুন" },
    longDescription: { en: "Generate high-quality AI images using SDXL Light API with custom styles." },
    category: "AI-IMAGE",
    guide: { en: "{pn} [প্রম্পট] | [স্টাইল]\nউদাহরণ: {pn} a futuristic city | Cinematic" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, senderID } = event;
    const startTime = Date.now();
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";
    
    const input = args.join(" ").split("|");
    const prompt = input[0]?.trim();
    const style = input[1]?.trim();

    // ১. ইনপুট ও স্টাইল ভ্যালিডেশন
    if (!prompt || !style) {
      const usage = `╭━━━❖✦🪬✦❖━━━╮\n  ✡️  চাঁদের 𖤍 পাহাড়  🪬\n╰━━━❖✦🪬✦❖━━━╯\n\n` +
        `📝 ব্যবহারের সঠিক নিয়ম:\n/sdxl [বর্ণনা] | [স্টাইল]\n\n` +
        `🎨 স্টাইল লিস্ট:\n` +
        `• 3D Model\n• Analog Film\n• Anime\n• Cinematic\n• Comic Book\n\n` +
        `𖤍 𝗔𝗱𝗺𝗶𝗻 : BELAL ⊶ BOTX666 🪬${sig}`;
      return message.reply(usage);
    }

    const validStyles = ["3D Model", "Analog Film", "Anime", "Cinematic", "Comic Book"];
    if (!validStyles.includes(style)) {
      return message.reply(`❌ বেলাল ভাই, ভুল স্টাইল দিয়েছেন! সঠিক স্টাইলগুলো হলো:\n- ${validStyles.join("\n- ")}`);
    }

    // ২. ওয়েটিং মেসেজ ও রিঅ্যাকশন
    const waitMsgBody = `╭━━━❖✦🎨✦❖━━━╮\n   𝗔𝗜 𝗔𝗥𝗧 𝗜𝗡 𝗣𝗥𝗢𝗚𝗥𝗘𝗦𝗦\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n🖌️ আপনার কল্পনাকে ছবিতে রূপান্তর করা হচ্ছে...\nদয়া করে কিছুক্ষণ অপেক্ষা করুন বস।⏳`;
    const waitMsg = await message.reply(waitMsgBody);
    api.setMessageReaction("🎨", messageID, () => {}, true);

    const cachePath = path.join(__dirname, "cache", `sdxl_${senderID}_${Date.now()}.png`);

    try {
      // ৩. এপিআই থেকে ইমেজ ফেচ
      const response = await axios({
        method: "GET",
        url: "https://www.arch2devs.ct.ws/api/sdxl-light",
        params: {
          prompt: prompt,
          style: style,
          model: "sdxl"
        },
        responseType: "arraybuffer"
      });

      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(cachePath, Buffer.from(response.data));

      const latency = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", messageID, () => {}, true);

      // ৪. ফাইনাল নিওন ইন্টারফেস ডিজাইন
      const resultMsg = `╭━━━❖✦🪬✦❖━━━╮\n  ✡️  চাঁদের 𖤍 পাহাড়  🪬\n╰━━━❖✦🪬✦❖━━━╯\n\n` +
        `✨ 𝗔𝗜 𝗜𝗠𝗔𝗚𝗘 𝗥𝗘𝗔𝗗𝗬 ✨\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📝 𝗣𝗿𝗼𝗺𝗽𝘁 : ${prompt}\n` +
        `🎨 𝗦𝘁𝘆𝗹𝗲  : ${style}\n` +
        `⚡ 𝗦𝗽𝗲𝗲𝗱  : ${latency}s\n\n` +
        `𖤍 𝗔𝗱𝗺𝗶𝗻  : BELAL ⊶ BOTX666 🪬${sig}`;

      await message.reply({
        body: resultMsg,
        attachment: fs.createReadStream(cachePath)
      });

      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);

    } catch (error) {
      console.error(error);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
      api.setMessageReaction("❌", messageID, () => {}, true);
      message.reply("❌ দুঃখিত বেলাল ভাই, এআই ছবিটি জেনারেট করতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।");
    } finally {
      if (fs.existsSync(cachePath)) {
        setTimeout(() => fs.unlinkSync(cachePath), 5000);
      }
    }
  }
};
