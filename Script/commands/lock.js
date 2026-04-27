const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

const cacheDir = path.join(__dirname, "cache", "lockData");
const protectPath = path.join(cacheDir, "protect.json");

// ফোল্ডার এবং ফাইল নিশ্চিত করা
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
let protectData = fs.existsSync(protectPath) ? JSON.parse(fs.readFileSync(protectPath)) : {};

module.exports.config = {
  name: "lock",
  version: "2.0.0",
  hasPermssion: 1, // শুধুমাত্র গ্রুপ অ্যাডমিন বা বসের জন্য
  credits: "Belal x Gemini",
  description: "গ্রুপের নাম, ইমোজি এবং ফটো লক করে রাখা (চাঁদের পাহাড় স্পেশাল)",
  commandCategory: "Box",
  usages: "[on/off/name/emoji/image]",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const subCommand = args[0]?.toLowerCase();

  if (!subCommand) return api.sendMessage("❌ চাঁদের পাহাড় নির্দেশ: দয়া করে অন/অফ বা নির্দিষ্ট সাব-কমান্ড দিন (on, off, name, emoji, image)।", threadID, messageID);

  // ------------------ প্রোটেকশন অন করা ------------------
  if (subCommand === "on") {
    try {
      const info = await api.getThreadInfo(threadID);
      const imgPath = path.join(cacheDir, `avatar_${threadID}.png`);
      
      if (info.imageSrc) {
        const res = await axios.get(info.imageSrc, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(res.data, "binary"));
      }

      protectData[threadID] = {
        name: info.threadName || "",
        emoji: info.emoji || "",
        image: info.imageSrc ? imgPath : null,
        status: true
      };
      
      fs.writeFileSync(protectPath, JSON.stringify(protectData, null, 2));
      return api.sendMessage("✅ চাঁদের পাহাড় প্রোটেকশন চালু! এখন থেকে গ্রুপ লক করা হলো।", threadID, messageID);
    } catch (e) {
      return api.sendMessage("⚠️ ডাটা সেভ করতে সমস্যা হয়েছে।", threadID, messageID);
    }
  }

  // ------------------ প্রোটেকশন অফ করা ------------------
  if (subCommand === "off") {
    if (protectData[threadID]) {
      protectData[threadID].status = false;
      fs.writeFileSync(protectPath, JSON.stringify(protectData, null, 2));
      return api.sendMessage("🔓 গ্রুপ প্রোটেকশন বন্ধ করা হয়েছে।", threadID, messageID);
    }
    return api.sendMessage("❌ এই গ্রুপে প্রোটেকশন আগে থেকেই বন্ধ।", threadID, messageID);
  }

  // ------------------ নাম পরিবর্তন ------------------
  if (subCommand === "name") {
    const newName = args.slice(1).join(" ");
    if (!newName) return api.sendMessage("❌ নাম লিখুন।", threadID, messageID);
    return api.setTitle(newName, threadID, () => {
      if (protectData[threadID]?.status) {
        protectData[threadID].name = newName;
        fs.writeFileSync(protectPath, JSON.stringify(protectData, null, 2));
      }
      api.sendMessage(`🔨 গ্রুপের নাম পরিবর্তন করে রাখা হলো: ${newName}`, threadID);
    });
  }

  // ------------------ ইমোজি পরিবর্তন ------------------
  if (subCommand === "emoji") {
    const newEmoji = args[1];
    if (!newEmoji) return api.sendMessage("❌ ইমোজি দিন।", threadID, messageID);
    return api.changeThreadEmoji(newEmoji, threadID, () => {
      if (protectData[threadID]?.status) {
        protectData[threadID].emoji = newEmoji;
        fs.writeFileSync(protectPath, JSON.stringify(protectData, null, 2));
      }
    });
  }

  // ------------------ ইমেজ পরিবর্তন ------------------
  if (subCommand === "image") {
    if (event.type !== "message_reply") return api.sendMessage("❌ একটি ছবিতে রিপ্লাই দিয়ে !lock image লিখুন।", threadID, messageID);
    const url = event.messageReply.attachments[0]?.url;
    if (!url) return api.sendMessage("❌ ছবি খুঁজে পাওয়া যায়নি।", threadID, messageID);

    const tempImg = path.join(cacheDir, `temp_${threadID}.png`);
    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(tempImg, Buffer.from(res.data, "binary"));

    return api.changeGroupImage(fs.createReadStream(tempImg), threadID, () => {
      if (protectData[threadID]?.status) {
        const savedImg = path.join(cacheDir, `avatar_${threadID}.png`);
        fs.copySync(tempImg, savedImg);
        protectData[threadID].image = savedImg;
        fs.writeFileSync(protectPath, JSON.stringify(protectData, null, 2));
      }
      fs.unlinkSync(tempImg);
    });
  }
};

// ------------------ অটো-রিস্টোর ইভেন্ট লিসেনার ------------------
module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, logMessageType, author } = event;
  const data = protectData[threadID];

  if (!data || !data.status || author === api.getCurrentUserID()) return;

  // অ্যাডমিন পরিবর্তন করলে বাধা দেবে না
  const info = await api.getThreadInfo(threadID);
  if (info.adminIDs.some(ad => ad.id === author)) return;

  // নাম রিস্টোর
  if (logMessageType === "log:thread-name" && event.logMessageData.name !== data.name) {
    api.setTitle(data.name, threadID);
  }
  // ইমোজি রিস্টোর
  if (logMessageType === "log:thread-emoji" && event.logMessageData.emoji !== data.emoji) {
    api.changeThreadEmoji(data.emoji, threadID);
  }
  // ইমেজ রিস্টোর
  if (logMessageType === "log:thread-icon" && data.image && fs.existsSync(data.image)) {
    api.changeGroupImage(fs.createReadStream(data.image), threadID);
  }
};
