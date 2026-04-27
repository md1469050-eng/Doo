const axios = require("axios");

module.exports = {
  config: {
    name: "voicev2",
    aliases: ["Voice", "fk", "video", "belal"],
    version: "2.5.0",
    author: "Belal YT", // Updated as requested
    countDown: 10,
    role: 0,
    shortDescription: "Random video with premium captions",
    longDescription: "High-quality video and voice captions for your group with Belal YT branding",
    category: "𝗙𝗨𝗡",
    guide: "{pn}"
  },

  onStart: async function ({ message, api, event }) {
    const { threadID, messageID } = event;
    const sig = "\n┈───╼ ┄┉❈✡️⋆⃝ চৃাঁদেৃঁরৃঁ পাৃঁহা্্ড়ৃঁ ✿⃝🪬 ╾───┈";
    const startTime = Date.now();

    // ১. সিকিউরিটি চেক
    if (this.config.author !== "Belal YT") {
      return message.reply("⚠️ [ SECURITY ALERT ]\nAuthor name change detected! Please reset to 'Belal YT'.");
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);
    } catch (e) {}

    const loadingMsg = await message.reply("⚡ 𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗦𝗦 𝗔𝗥 𝗩𝗜𝗗𝗘𝗢 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 𝗛𝗢𝗦𝗦𝗘... ⚡");

    // ভিডিও ও ক্যাপশন ডাটা
    const data = [
      { cap: "জীবনটা সহজ না, কিন্তু সুন্দর 😊\nকষ্ট থাকলেও হাসতে শিখো 💫", link: "https://files.catbox.moe/bs84st.mp4" },
      { cap: "সবাই পাশে থাকবে না 😌\nকিন্তু নিজে নিজেকে কখনো ছাড়ো না 💯", link: "https://files.catbox.moe/hgo8gp.mp4" },
      { cap: "স্বপ্ন দেখতে ভয় পেয়ো না 💭\nআজ ছোট হলেও কাল বড় হবে 🚀", link: "https://files.catbox.moe/23zj4q.mp4" },
      { cap: "মন খারাপ হলেও চুপ থেকো না 😔\nসব ঠিক হয়ে যাবে একদিন 🌸", link: "https://files.catbox.moe/gogfic.mp4" },
      { cap: "নিজের মতো থাকো 😎\nকারো জন্য বদলাতে যেও না ❌", link: "https://files.catbox.moe/9uvit1.mp4" },
      { cap: "সময় অনেক কিছু শিখায় ⏳\nমানুষ চিনতে শেখায় 😶", link: "https://files.catbox.moe/l15d8y.mp4" },
      { cap: "ভালোবাসা পেতে হলে আগে নিজেকে ভালোবাসো ❤️\nনিজের যত্ন নাও 💫", link: "https://files.catbox.moe/22enjn.mp4" },
      { cap: "ছোট ছোট মুহূর্ত উপভোগ করো 📸\nএইগুলোই একদিন স্মৃতি হবে 💖", link: "https://files.catbox.moe/gitfya.mp4" },
      { cap: "জীবন একটা যুদ্ধ ⚔️\nলড়াই চালিয়ে যাও 💪🔥", link: "https://files.catbox.moe/src6qb.mp4" },
      { cap: "চুপ থাকা সবসময় দুর্বলতা না 🤫\nকখনো এটা শক্তি 💯", link: "https://files.catbox.moe/9iqdo0.mp4" }
    ];

    try {
      const randomItem = data[Math.floor(Math.random() * data.length)];
      const latency = Date.now() - startTime;
      const execID = "B-YT" + Math.floor(Math.random() * 9000);

      // লাক্সারি ফুটার ডিজাইন
      const footer = `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
        `💠 𝗩𝗜𝗗𝗘𝗢 𝗜𝗡𝗙𝗢 💠\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📡 𝗦𝘁𝗮𝘁𝘂𝘀 : High Speed ⚡\n` +
        `⏳ 𝗟𝗮𝘁𝗲𝗻𝗰𝘆: ${latency}ms\n` +
        `🆔 𝗜𝗗     : ${execID}\n` +
        `💎 𝗕𝗿𝗮𝗻𝗱  : চৃাঁদেৃঁরৃঁ পাৃঁহা্্ড়ৃঁ\n` +
        `👑 𝗢𝘄𝗻𝗲𝗿  : 𝗕𝗲𝗹𝗮𝗹 𝗬𝗧\n` +
        `━━━━━━━━━━━━━━━━━━━━${sig}`;

      // ভিডিও স্ট্রিম তৈরি (Mirai/GoatBot Optimized)
      const videoStream = await global.utils.getStreamFromURL(randomItem.link);

      await message.reply({
        body: `『 ✨ 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗖𝗔𝗣𝗧𝗜𝗢𝗡 ✨ 』\n\n${randomItem.cap}${footer}`,
        attachment: videoStream
      });

      api.unsendMessage(loadingMsg.messageID);
      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      message.reply("❌ ভিডিও লোড হতে সমস্যা হয়েছে! দয়া করে আবার চেষ্টা করুন।");
    }
  }
};
