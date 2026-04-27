const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "prefixv2",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "বটের প্রিফিক্স এবং ওনার ইনফো দেখার সিস্টেম (All GIFs)",
  commandCategory: "Information",
  usages: "prefix",
  cooldowns: 5
};

module.exports.handleEvent = async ({ event, api, Threads }) => {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;
  const ownerID = "61577502464880"; // আপনার আইডি

  const triggerWords = [
    "prefix", "bot prefix", "what is prefix", "prefx", "prfix",
    "what prefix", "XBOT666", "YT", "mprefix", "bot name"
  ];

  const lowerBody = body.toLowerCase();
  
  if (triggerWords.includes(lowerBody)) {
    api.setMessageReaction("🛸", messageID, () => {}, true);

    // 🔰 আপনার সবকটি লিঙ্ক এখানে দেওয়া হলো (একটিও বাদ নেই)
    const gifs = [
      "https://i.imgur.com/GZsIMDD.gif",
      "https://i.imgur.com/TeCvnYx.gif",
      "https://i.imgur.com/61hTdN3.gif",
      "https://i.imgur.com/oYpzLg0.gif",
      "https://i.imgur.com/MOuHXRh.gif",
      "https://i.imgur.com/NWrwi30.gif",
      "https://i.imgur.com/QklhKzM.gif",
      "https://i.imgur.com/YUKbZeN.gif",
      "https://i.imgur.com/GPd6rdT.gif",
      "https://i.imgur.com/DT4rWmV.gif",
      "https://i.imgur.com/L8C6OKO.gif",
      "https://i.imgur.com/EJC0nN5.gif",
      "https://i.imgur.com/1TT7J4s.gif",
      "https://i.imgur.com/aHExnbz.gif",
      "https://i.imgur.com/T4nc1dC.gif",
      "https://i.imgur.com/wtS2oC0.gif",
      "https://i.imgur.com/ZplnzRl.gif",
      "https://i.imgur.com/Kj9cK5G.gif",
      "https://i.imgur.com/lbaSgl2.gif"
    ];

    const gifUrl = gifs[Math.floor(Math.random() * gifs.length)];
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const gifPath = path.join(cacheDir, `prefix_${Date.now()}.gif`);

    const msg = `🌐 𝗦𝘆𝘀𝘁𝗲𝗺 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${prefix} ]
🛸 𝗚𝗿𝗼𝘂𝗽 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${prefix} ]
━━━━━━━━━━━━━━━━━━
👤 𝗢𝘄𝗻𝗲𝗿: Belal Boss
🔗 FB: https://m.me/${ownerID}
📢 Use [ ${prefix}help ] to see all commands!`;

    try {
      const response = await axios.get(gifUrl, { responseType: "arraybuffer" });
      await fs.outputFile(gifPath, Buffer.from(response.data));

      return api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(gifPath)
      }, threadID, () => {
        if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
      }, messageID);
    } catch (e) {
      return api.sendMessage(`🌐 System Prefix: ${prefix}`, threadID, messageID);
    }
  }
};

module.exports.run = async ({ event, api }) => {
  return api.sendMessage("💡 বটের প্রিফিক্স জানতে 'prefix' লিখে মেসেজ দিন।", event.threadID);
};
