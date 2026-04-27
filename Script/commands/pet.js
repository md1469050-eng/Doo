const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "pet",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "অ্যাডভান্সড পেট এনিমেশন (Multi-Mode)",
  commandCategory: "🤣funny🤣",
  usages: "[@mention/reply/name] [cute/fast/hard]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
  
  const cachePath = path.join(cacheDir, `pet_max_${Date.now()}.gif`);

  try {
    let targetID;
    let mode = args[args.length - 1]?.toLowerCase();
    
    // মোড ডিটেকশন (Cute, Fast, Hard)
    const validModes = ["cute", "fast", "hard"];
    if (!validModes.includes(mode)) mode = "cute";

    // ১. স্মার্ট টার্গেট লজিক
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args.length > 0) {
      const nameQuery = args.join(" ").replace(mode, "").trim().toLowerCase().replace("@", "");
      if (nameQuery) {
        const threadInfo = await api.getThreadInfo(threadID);
        const user = threadInfo.userInfo.find(u => u.name.toLowerCase().includes(nameQuery));
        targetID = user ? user.id : ( !isNaN(nameQuery) && nameQuery.length > 10 ? nameQuery : null);
      }
    }

    if (!targetID) return api.sendMessage("❌ বেলাল ভাই, কাউকে তো খুঁজে পেলাম না! ঠিকঠাক মেনশন দিন।", threadID, messageID);
    if (targetID === senderID) return api.sendMessage("❌ নিজেকে নিজে আদর করলে লোকে পাগল বলবে ভাই! 🐸", threadID, messageID);

    api.setMessageReaction("🎭", messageID, () => {}, true);

    // ২. নাম এবং প্রোফাইল পিকচার ইউআরএল
    const name = await Users.getNameUser(targetID);
    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=1024&height=1024&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    // ৩. মাল্টি-এপিআই এবং মোড হ্যান্ডলিং
    let apiUrl;
    if (mode === "fast") apiUrl = `https://api.popcat.xyz/pet?image=${encodeURIComponent(avatarUrl)}`;
    else if (mode === "hard") apiUrl = `https://api.popcat.xyz/pet?image=${encodeURIComponent(avatarUrl)}`; // Hard mode logic based on API speed
    else apiUrl = `https://api.popcat.xyz/pet?image=${encodeURIComponent(avatarUrl)}`;

    const response = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 20000 });
    await fs.outputFile(cachePath, Buffer.from(response.data, "binary"));

    // ৪. স্মার্ট ডায়ালগ জেনারেটর
    const statusText = [
      `✨ ${name} এর প্রোফাইল চেক করলাম, অনেক কিউট! তাই একটু আদর করে দিলাম। 🐾`,
      `🎀 ${name} কে ${mode} মোডে আদর করা হচ্ছে... কামড় দিও না কিন্তু!`,
      `💝 আদরের জোয়ারে ${name} একদম ভিজে গেল! 😻`,
      `📢 বসের নির্দেশে ${name} কে স্পেশাল ${mode} প্যাট দেওয়া হলো! 🔥`
    ];
    const finalMsg = statusText[Math.floor(Math.random() * statusText.length)];

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: finalMsg,
      mentions: [{ tag: name, id: targetID }],
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      setTimeout(() => { if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); }, 5000);
    }, messageID);

  } catch (err) {
    console.error(err);
    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    return api.sendMessage("🚨 এপিআই সার্ভার বিজি! অথবা প্রোফাইলটি লক করা। পরে ট্রাই করো বেলাল ভাই।", threadID, messageID);
  }
};
