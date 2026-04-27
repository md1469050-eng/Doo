const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "punch",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "কাউকে ফানিভাবে ঘুষি মারুন (অ্যানিমেটেড)",
  commandCategory: "🤣funny🤣",
  usages: "[@mention/reply/name]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;
  const cachePath = path.join(__dirname, "cache", `punch_${Date.now()}.gif`);

  try {
    let targetID;
    
    // ১. স্মার্ট টার্গেট সিলেকশন (রিপ্লাই, মেনশন বা নাম)
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args.length > 0) {
      const threadInfo = await api.getThreadInfo(threadID);
      const nameQuery = args.join(" ").toLowerCase().replace("@", "");
      const user = threadInfo.userInfo.find(u => u.name.toLowerCase().includes(nameQuery));
      targetID = user ? user.id : null;
    }

    if (!targetID) return api.sendMessage("👊 বেলাল ভাই, ঘুষিটা কাকে মারবো? একজনকে মেনশন দিন বা তার নাম লিখুন!", threadID, messageID);
    
    if (targetID === senderID) return api.sendMessage("👊 নিজেকে ঘুষি মেরে কী লাভ ভাই? অন্যের ওপর ঝাল মেটান! 😹", threadID, messageID);

    api.setMessageReaction("💢", messageID, () => {}, true);

    // ২. নাম সংগ্রহ
    const victimName = await Users.getNameUser(targetID);
    const puncherName = await Users.getNameUser(senderID);

    // ৩. নতুন ও হাই-কোয়ালিটি পাঞ্চ গিফ কালেকশন
    const punchGifs = [
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHYwdWd6ZzRycXN6ZzRycXN6ZzRycXN6ZzRycXN6ZzRycXN6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/Z5zuypqEEYd6E/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXV6ZzRycXN6ZzRycXN6ZzRycXN6ZzRycXN6ZzRycXN6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/alsM9Y0xL255O/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXV6ZzRycXN6ZzRycXN6ZzRycXN6ZzRycXN6ZzRycXN6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/VXJWNeIIBrgx1I6asL/giphy.gif",
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXV6ZzRycXN6ZzRycXN6ZzRycXN6ZzRycXN6ZzRycXN6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/11HeubYHIZkmMM/giphy.gif"
    ];
    const randomGif = punchGifs[Math.floor(Math.random() * punchGifs.length)];

    // ৪. ইমেজ ডাউনলোড
    const res = await axios.get(randomGif, { responseType: "arraybuffer" });
    await fs.outputFile(cachePath, Buffer.from(res.data, "binary"));

    // ৫. ডাইনামিক ঘুষি মেসেজ
    const messages = [
      `👊 ${puncherName} এর এক ঘুষিতে ${victimName} এর দাঁত নড়ে গেছে!`,
      `💢 অনেক শয়তানি করছিস ${victimName}, এই নে বসের স্পেশাল ঘুষি!`,
      `🚀 ${puncherName} এমন ঘুষি মারলো যে ${victimName} চাঁদে গিয়ে পড়লো!`,
      `💀 ওরে বাবা! ${victimName} তো এক ঘুষিতেই কুপোকাত!`
    ];
    const finalMsg = messages[Math.floor(Math.random() * messages.length)];

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: finalMsg,
      mentions: [{ tag: victimName, id: targetID }, { tag: puncherName, id: senderID }],
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (err) {
    console.error(err);
    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    return api.sendMessage("🚨 ঘুষি মারতে গিয়ে হাত ভেঙে গেছে! (সার্ভার এরর)। পরে ট্রাই করুন।", threadID, messageID);
  }
};
