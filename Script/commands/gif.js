const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "gif",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "Tenor থেকে সরাসরি GIF সার্চ বা ট্রেন্ডিং GIF দেখুন",
  commandCategory: "Media",
  usages: "[কিওয়ার্ড] [-সংখ্যা]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const CACHE_DIR = path.join(__dirname, "cache", `gif_${senderID}`);
  
  // ১. এপিআই কনফিগ
  const API_KEY = "LIVDSRZULELA"; // একটি পাবলিক কিউরেটেড কী (বেশি স্টেবল)
  const query = args.filter(a => !a.startsWith("-")).join(" ");
  const limitArg = args.find(a => a.startsWith("-"));
  const limit = limitArg ? Math.min(parseInt(limitArg.replace("-", "")), 10) : 5; // সর্বোচ্চ ১০টি

  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

  const isTrending = !query;
  api.setMessageReaction("⌛", messageID, () => {}, true);

  try {
    const url = isTrending 
      ? `https://g.tenor.com/v1/trending?key=${API_KEY}&limit=${limit}&media_filter=minimal`
      : `https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=${API_KEY}&limit=${limit}&media_filter=minimal`;

    const res = await axios.get(url);
    const results = res.data.results;

    if (!results || results.length === 0) {
      return api.sendMessage("😢 বেলাল ভাই, কোনো GIF খুঁজে পাওয়া যায়নি!", threadID, messageID);
    }

    const attachments = [];
    const downloadPromises = results.map(async (item, i) => {
      const gifUrl = item.media[0].tinygif.url; // দ্রুত লোড হওয়ার জন্য tinygif
      const filePath = path.join(CACHE_DIR, `gif_${i}.gif`);
      
      const response = await axios.get(gifUrl, { responseType: "arraybuffer" });
      await fs.outputFile(filePath, Buffer.from(response.data));
      attachments.push(fs.createReadStream(filePath));
    });

    // সব ডাউনলোড একসাথে শেষ হওয়া পর্যন্ত অপেক্ষা
    await Promise.all(downloadPromises);

    api.setMessageReaction("✅", messageID, () => {}, true);
    
    return api.sendMessage({
      body: isTrending 
        ? `🔥 Tenor-এর ট্রেন্ডিং ${attachments.length}টি GIF:` 
        : `🎬 “${query}” লিখে সার্চ করা সেরা ${attachments.length}টি রেজাল্ট:`,
      attachment: attachments
    }, threadID, () => {
      // ৫. সেফ ক্লিনআপ
      fs.removeSync(CACHE_DIR);
    }, messageID);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("❌ সার্ভার থেকে ডাটা আনতে সমস্যা হয়েছে!", threadID, messageID);
  }
};
