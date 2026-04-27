const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  try {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
  } catch (e) {
    return "https://api.mahmud.xyz"; // Fallback API
  }
};

module.exports = { 
  config: { 
    name: "lll", 
    version: "2.0.0", 
    author: "BELAL ⊶ BOTX666 🪬", 
    role: 0, 
    countDown: 5,
    category: "media", 
    guide: { 
      en: "{p}lll [page] - View categories\n{p}lll add [category] [reply to video] - Add video\n{p}lll list - View counts",
    }, 
  },

  onStart: async function ({ api, event, args }) {     
    const { threadID, messageID, senderID } = event;
    const apiUrl = await baseApiUrl();
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

    // ১. ভিডিও অ্যাড করার লজিক
    if (args[0] === "add") {
      if (!args[1]) return api.sendMessage(`❌ চাঁদের পাহাড়, একটি ক্যাটাগরি উল্লেখ করুন।${sig}`, threadID, messageID);
      const category = args[1].toLowerCase();
      let videoUrl = args[2];

      if (event.type === "message_reply" && event.messageReply.attachments[0]?.type === "video") {
        const attachment = event.messageReply.attachments[0];
        try {
          // Imgur Upload
          const imgurRes = await axios.post("https://api.imgur.com/3/image", 
            { image: attachment.url, type: "url" },
            { headers: { Authorization: "Client-ID 546c11547900b71" } }
          );
          videoUrl = imgurRes.data?.data?.link;
        } catch (e) { return api.sendMessage("❌ Imgur আপলোড ব্যর্থ হয়েছে!", threadID, messageID); }
      }

      if (!videoUrl) return api.sendMessage("❌ ভিডিও লিঙ্ক দিন বা ভিডিওতে রিপ্লাই দিন!", threadID, messageID);

      try {
        const res = await axios.post(`${apiUrl}/api/add`, { category, videoUrl });
        return api.sendMessage(`✅ ${res.data.message}${sig}`, threadID, messageID);
      } catch (e) { return api.sendMessage(`❌ এরর: ${e.message}`, threadID, messageID); }
    }

    // ২. লিস্ট দেখানোর লজিক
    if (args[0] === "list") {
      try {
        const res = await axios.get(`${apiUrl}/api/album/mahmud/list`);
        return api.sendMessage(`📊 ক্যাটাগরি লিস্ট:\n${res.data.message}${sig}`, threadID, messageID);
      } catch (e) { return api.sendMessage(`❌ এরর: ${e.message}`, threadID, messageID); }
    }

    // ৩. মেইন অ্যালবাম মেনু
    const displayNames = [
      "𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨 🎀",
      "𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐂𝐨𝐮𝐩𝐥𝐞 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐂𝐚𝐫 𝐄𝐝𝐢𝐭 𝐕𝐢𝐝𝐞𝐨🎀", "𝐁𝐢𝐤𝐞 𝐄𝐝𝐢𝐭 𝐕𝐢𝐝𝐞𝐨 🎀",
      "𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐋𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨 🎀", "𝟏𝟖+ 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐌𝐞𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 🎀",
      "𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐕𝐢𝐝𝐞𝐨 🎀", "𝐌𝐨𝐧𝐞𝐲 𝐯𝐢𝐝𝐞𝐨 🎀", "𝐅𝐥𝐨𝐰𝐞𝐫 𝐕𝐢𝐝𝐞𝐨🎀"
    ];

    const itemsPerPage = 10;
    const page = parseInt(args[0]) || 1;
    const totalPages = Math.ceil(displayNames.length / itemsPerPage);

    if (page < 1 || page > totalPages) return api.sendMessage(`❌ পেজ নম্বর ১ থেকে ${totalPages} এর মধ্যে দিন।`, threadID, messageID);

    const startIndex = (page - 1) * itemsPerPage;
    const displayedCategories = displayNames.slice(startIndex, startIndex + itemsPerPage);

    const menuMsg = `╭━━━━━━⊱✨⊰━━━━━━╮\n   𝐀𝐋𝐁𝐔𝐌 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐄𝐒\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n` +
      displayedCategories.map((name, i) => `${startIndex + i + 1}. ${name}`).join("\n") +
      `\n\n📖 Page: [${page}/${totalPages}]\n💡 রিপ্লাই দিয়ে ভিডিও সিলেক্ট করুন।${sig}`;

    api.sendMessage(menuMsg, threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: senderID,
        realCategories: ["funny", "islamic", "sad", "anime", "lofi", "attitude", "horny", "couple", "car", "bike", "love", "lyrics", "cat", "18+", "meme", "football", "baby", "friend", "money", "flower"],
        captions: ["Funny", "Islamic", "Sad", "Anime", "Lofi", "Attitude", "Horny", "Couple", "Car", "Bike", "Love", "Lyrics", "Cat", "18+", "Meme", "Football", "Baby", "Friend", "Money", "Flower"]
      });
    }, messageID);
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID != Reply.author) return;
    
    api.unsendMessage(Reply.messageID);
    const index = parseInt(body) - 1;
    if (isNaN(index) || index < 0 || !Reply.realCategories[index]) return api.sendMessage("❌ সঠিক নম্বর সিলেক্ট করুন।", threadID, messageID);

    const category = Reply.realCategories[index];
    const caption = Reply.captions[index];

    try {
      const apiUrl = await baseApiUrl();
      const res = await axios.get(`${apiUrl}/api/album/mahmud/videos/${category}?userID=${senderID}`);
      const videoUrls = res.data.videos;
      if (!videoUrls?.length) return api.sendMessage("❌ এই ক্যাটাগরিতে কোনো ভিডিও নেই!", threadID, messageID);

      const randomUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];
      const filePath = path.join(__dirname, "cache", `video_${Date.now()}.mp4`);
      await fs.ensureDir(path.dirname(filePath));

      const videoRes = await axios({ url: randomUrl, method: "GET", responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      videoRes.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `🎬 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐲𝐨𝐮𝐫 ${caption} 𝐕𝐢𝐝𝐞𝐨\n\n𖤍 𝐀𝐝𝐦𝐢𝐧: MD BELAL (BS Dealer)\n🏠 𝐇𝐨𝐦𝐞: KURIGRAM, BD\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
      });
    } catch (e) { api.sendMessage("❌ ভিডিও লোড করতে সমস্যা হয়েছে!", threadID, messageID); }
  }
};
