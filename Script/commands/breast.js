const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "breast",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "কাউকে ট্যাগ দিয়ে একটু মজা করা (১৮+)",
  commandCategory: "fun",
  usages: "[tag]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions } = event;
  const cachePath = path.join(__dirname, "cache", `bopvu_${senderID}.gif`);

  // ১. মেনশন চেক করা
  const mentionKeys = Object.keys(mentions);
  if (mentionKeys.length == 0) return api.sendMessage("⚠️ বেলাল ভাই, কাকে ট্যাগ করবেন? একজনকে ট্যাগ দিন! 🍼", threadID, messageID);

  const targetID = mentionKeys[0];
  const targetName = mentions[targetID].replace("@", "");

  // ২. জিআইএফ কালেকশন (সবগুলো চেক করা এবং হাই কোয়ালিটি)
  const links = [
    "https://i.postimg.cc/tC2BTrmF/3.gif",
    "https://i.postimg.cc/pLrqnDg4/78d07b6be53bea612b6891724c1a23660102a7c4.gif",
    "https://i.postimg.cc/gJFD51nb/detail.gif",
    "https://i.postimg.cc/xjPRxxQB/GiC86RK.gif",
    "https://i.postimg.cc/L8J3smPM/tumblr-myzq44-Hv7-G1rat3p6o1-500.gif"
  ];

  const randomGif = links[Math.floor(Math.random() * links.length)];

  // ৩. ফানি এবং রোমান্টিক ক্যাপশন
  const captions = [
    `এই ${targetName}, চাঁদের পাহাড় থেকে আসলাম তোর দুধ টিপতে! 👅🍼`,
    `${targetName}, তোরটা তো দেখি বেশ বড় হইছে! উফফ... 🥵🤤`,
    `আহ ${targetName}, কী নরম রে! মন ভরে গেল! 😋🍼`,
    `কিরে ${targetName}, কচি বয়সেই এত বড় বানায় ফেললি কেমনে? 🍼😏`,
    `${targetName}, তোর এই রসে ভরা ডাব দুইটা চাঁদের পাহাড়-এর সম্পত্তি! 🥥💦`
  ];
  const finalCaption = captions[Math.floor(Math.random() * captions.length)];

  api.setMessageReaction("🤤", messageID, () => {}, true);

  try {
    // ৪. দ্রুত ফাইল ডাউনলোড (Axios Stream)
    const response = await axios.get(randomGif, { responseType: "arraybuffer" });
    fs.outputFileSync(cachePath, Buffer.from(response.data));

    return api.sendMessage({
      body: finalCaption,
      mentions: [{ tag: targetName, id: targetID }],
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("🚨 লিঙ্ক কাজ করছে না অথবা ইন্টারনেট স্লো!", threadID, messageID);
  }
};
