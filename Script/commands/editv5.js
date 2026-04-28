const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

const noobcore = "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json";

async function getRenzApi() {
  try {
    const res = await axios.get(noobcore, { timeout: 10000 });
    if (!res.data?.renz) throw new Error("Renz API not found");
    return res.data.renz;
  } catch (e) {
    return "https://api.renz.com"; // Fallback URL (if any)
  }
}

module.exports = {
  config: {
    name: "editv5",
    aliases: ["edit", "imgedit", "generate"],
    version: "4.0.0",
    author: "BOTX666 🪬",
    countDown: 10,
    role: 0,
    category: "Image",
    shortDescription: { en: "AI Image Generation & Editing" },
    guide: { en: "{pn} <prompt> | Reply to image with prompt" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    const prompt = args.join(" ").trim();
    
    // সময় ও তারিখ (Asia/Dhaka)
    const bdTime = moment.tz("Asia/Dhaka").format("hh:mm A");
    const bdDate = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
    const header = "🎨 ━━━『 𝐈𝐌𝐀𝐆𝐄 𝐄𝐃𝐈𝐓𝐎𝐑 𝐕𝟒 』━━━ 🎨";
    const sig = `\n━━━━━━━━━━━━━━━━━━━━\n🏔️ 𝖲𝗂𝗀𝗇: 𝖢𝗁𝖺𝗇𝖽𝖾𝗋 𝖯𝖺𝗁𝖺𝗋\n⏰ 𝖳𝗂𝗆𝖾: ${bdTime} | ${bdDate}`;

    if (!prompt) {
      return api.sendMessage(`${header}\n\n⚠️ প্রম্পট দিতে ভুলে গেছেন!\n📌 উদাহরণ: {pn} a futuristic forest\n🖼️ ছবির রিপ্লাই দিয়ে বলুন: {pn} make it anime${sig}`, threadID, messageID);
    }

    const loadingMsg = await api.sendMessage("⏳ মহাজাগতিক ক্যানভাসে কাজ চলছে, একটু অপেক্ষা করুন...", threadID);
    const cacheDir = path.join(process.cwd(), "cache");
    const imgPath = path.join(cacheDir, `editv4_${Date.now()}.png`);

    try {
      await fs.ensureDir(cacheDir);
      const BASE_URL = await getRenzApi();
      let apiURL = `${BASE_URL}/api/gptimage?prompt=${encodeURIComponent(prompt)}`;

      // ইমেজ এডিটিং লজিক (Reply check)
      if (messageReply?.attachments?.[0]?.type === "photo") {
        const repliedImage = messageReply.attachments[0];
        apiURL += `&ref=${encodeURIComponent(repliedImage.url)}`;
        if (repliedImage.width && repliedImage.height) {
          apiURL += `&width=${repliedImage.width}&height=${repliedImage.height}`;
        }
      } else {
        apiURL += `&width=512&height=512`;
      }

      const res = await axios.get(apiURL, {
        responseType: "arraybuffer",
        timeout: 180000 // ৩ মিনিট সময় বরাদ্দ রাখা হয়েছে
      });

      await fs.writeFile(imgPath, Buffer.from(res.data));
      await api.unsendMessage(loadingMsg.messageID).catch(() => {});

      const isEdit = messageReply?.attachments?.[0] ? "𝐄𝐃𝐈𝐓𝐄𝐃" : "𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃";
      
      await api.sendMessage(
        {
          body: `${header}\n\n✨ 𝐈𝐦𝐚𝐠𝐞 ${isEdit} 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!\n📝 𝐏𝐫𝐨𝐦𝐩𝐭: ${prompt}${sig}`,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); },
        messageID
      );

      api.setMessageReaction("🎨", messageID, () => {}, true);

    } catch (err) {
      console.error(err);
      await api.unsendMessage(loadingMsg.messageID).catch(() => {});
      api.sendMessage(`❌ দুঃখিত চাঁদের পাহাড়, ইমেজ প্রসেস করতে সমস্যা হয়েছে। সার্ভার ব্যস্ত থাকতে পারে।${sig}`, threadID, messageID);
      api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};
