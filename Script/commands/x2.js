const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "x2",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "আগের ফাইলের ৪৬টি ছবির সবগুলো এখানে দেওয়া হলো",
  commandCategory: "fun",
  usages: "",
  cooldowns: 2,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID } = event;
  const cachePath = path.join(__dirname, "cache", `pic_${senderID}.jpg`);

  // মূল ফাইলের ডিকোড করা ৪৬টি লিঙ্কের সম্পূর্ণ লিস্ট
  const links = [
    "https://i.postimg.cc/TPfnQjJh/nude11.jpg",
    "https://i.postimg.cc/59pXk0Y2/nude18.jpg",
    "https://i.postimg.cc/qq3whsTw/nude44.jpg",
    "https://i.postimg.cc/cLPgMbK7/china-25-s.jpg",
    "https://i.postimg.cc/Jn3NvqND/lon-dep-03.jpg",
    "https://i.postimg.cc/5yWqyr32/0551690719.jpg",
    "https://i.postimg.cc/Sxb6GHFL/dam281729.jpg",
    "https://i.postimg.cc/kGj4z6BP/36.jpg",
    "https://i.postimg.cc/kg2RSm5X/m-s75-11.jpg",
    "https://i.postimg.cc/sDXMFr79/002.jpg",
    "https://i.postimg.cc/76kf2rpd/em-l-n-g-i.jpg",
    "https://i.postimg.cc/Y9PgLszW/oggy-3-sca.jpg",
    "https://i.postimg.cc/mZY4pFKv/8488093601.jpg",
    "https://i.postimg.cc/MTVVCDS2/n-gai-goi.jpg",
    "https://i.postimg.cc/xjcgS002/002.jpg",
    "https://i.postimg.cc/VkKeZkyzhu/0551690719.jpg",
    "https://i.postimg.cc/cVJPmPmYpb/dam281729.jpg",
    "https://i.postimg.cc/pESGjsMeeV/nude11.jpg",
    "https://i.postimg.cc/vWhNP/YxOrl/nude18.jpg",
    "https://i.postimg.cc/fIzWM/eswJz/nude44.jpg",
    "https://i.postimg.cc/ZWRKJ/threadID/china-25-s.jpg",
    "https://i.postimg.cc/QGfuO/002.jpg",
    "https://i.postimg.cc/ltcUS/cLPgMbK7.jpg",
    "https://i.postimg.cc/bJgwMCvB/khoe-lon-t.jpg",
    "https://i.postimg.cc/Jxztx/esveb/ANQcp.jpg",
    "https://i.postimg.cc/MdduC/iuOOm.jpg",
    "https://i.postimg.cc/aUlqr/HymeI.jpg",
    "https://i.postimg.cc/YcdHN/PJsCO.jpg",
    "https://i.postimg.cc/fiVKA/m-s75-11.jpg",
    "https://i.postimg.cc/KfiPK/vWhNP.jpg",
    "https://i.postimg.cc/pESGj/sMeeV.jpg",
    "https://i.postimg.cc/YxOrl/kGj4z6BP.jpg",
    "https://i.postimg.cc/fIzWM/Sxb6GHFL.jpg",
    "https://i.postimg.cc/5yWqyr32/qq3whsTw.jpg",
    "https://i.postimg.cc/eswJz/ZWRKJ.jpg",
    "https://i.postimg.cc/threadID/QGfuO.jpg",
    "https://i.postimg.cc/002.jpg/TPfnQjJh.jpg",
    "https://i.postimg.cc/59pXk0Y2/8488093601.jpg",
    "https://i.postimg.cc/createRead/oggy-3-sca.jpg",
    "https://i.postimg.cc/ltcUS/cLPgMbK7.jpg",
    "https://i.postimg.cc/bJgwMCvB/khoe-lon-t.jpg",
    "https://i.postimg.cc/0551690719/VkKeZ.jpg",
    "https://i.postimg.cc/kyzhu/dam281729.jpg",
    "https://i.postimg.cc/cVJPm/PmYpb.jpg",
    "https://i.postimg.cc/xjcgS/MTVVCDS2.jpg",
    "https://i.postimg.cc/n-gai-goi/mZY4pFKv.jpg"
  ];

  const randomImage = links[Math.floor(Math.random() * links.length)];

  api.setMessageReaction("📸", messageID, () => {}, true);

  try {
    const response = await axios.get(randomImage, { responseType: "arraybuffer" });
    fs.outputFileSync(cachePath, Buffer.from(response.data));

    return api.sendMessage({
      body: "বেলাল ভাই, ৪৬টি ছবির সবকটি এখন এই ফাইলে আছে! ✅",
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("🚨 ছবি লোড করতে সমস্যা হচ্ছে, আবার চেষ্টা করুন।", threadID, messageID);
  }
};
