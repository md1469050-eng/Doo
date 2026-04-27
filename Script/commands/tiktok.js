const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API = "https://lyric-search-neon.vercel.app/kshitiz?keyword=";
const CACHE = path.join(__dirname, "cache", "tiktok_cache");

async function stream(url) {
  const res = await axios({
    url,
    responseType: "stream",
    timeout: 180000
  });
  return res.data;
}

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt", "tik"],
    version: "1.2.0",
    author: "BELAL ⊶ BOTX666 🪬",
    role: 0,
    countDown: 5,
    category: "media",
    description: { en: "TikTok ভিডিও সার্চ এবং ডাউনলোড করুন" },
    guide: { en: "{pn} <keyword>" }
  },

  onStart: async function ({ api, event, args, commandName }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

    if (!query) {
      return api.sendMessage(`❌ চাঁদের পাহাড়, কি লিখে সার্চ করবেন তা দিন!\n💡 উদাহরণ: {pn} funny video${sig}`, threadID, messageID);
    }

    api.sendMessage(`╭━━━━━━⊱🔎⊰━━━━━━╮\n   𝐒𝐄𝐀𝐑𝐂𝐇𝐈𝐍𝐆 𝐓𝐈𝐊𝐓𝐎𝐊\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n🔍 𝐊𝐞𝐲𝐰𝐨𝐫𝐝: ❝ ${query} ❞\n🪬 দয়া করে একটু অপেক্ষা করুন...`, threadID, messageID);

    try {
      const res = await axios.get(API + encodeURIComponent(query));
      const results = res.data.slice(0, 6);

      if (!results.length) {
        return api.sendMessage("❌ দুঃখিত চাঁদের পাহাড়, কোনো ভিডিও পাওয়া যায়নি!", threadID, messageID);
      }

      let body = "╭━━━━━━⊱✨⊰━━━━━━╮\n   𝐓𝐈𝐊𝐓𝐎𝐊 𝐑𝐄𝐒𝐔𝐋𝐓𝐒\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n";
      const imgs = [];

      for (let i = 0; i < results.length; i++) {
        const v = results[i];
        body += `${i + 1}️⃣ ${v.title.slice(0, 45)}...\n`;
        body += `👤 @${v.author.unique_id} | ⏱️ ${v.duration}s\n\n`;
        if (v.cover) imgs.push(await stream(v.cover));
      }

      body += `📥 ডাউনলোড করতে ১ থেকে ${results.length} এর মধ্যে রিপ্লাই দিন।${sig}`;

      api.sendMessage(
        { body, attachment: imgs },
        threadID,
        (err, info) => {
          if (err) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            author: senderID,
            messageID: info.messageID,
            results
          });
        }
      );
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ TikTok API এরর! পরে চেষ্টা করুন।", threadID, messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, body, senderID } = event;
    const { results, author, messageID: replyMsgID } = Reply;
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

    if (senderID !== author) return;

    const choose = parseInt(body);
    if (isNaN(choose) || choose < 1 || choose > results.length) return;

    try {
      if (replyMsgID) await api.unsendMessage(replyMsgID);
    } catch (_) {}

    const video = results[choose - 1];
    await fs.ensureDir(CACHE);

    const name = video.title.slice(0, 20).replace(/[^a-z0-9]/gi, "_");
    const file = path.join(CACHE, `${Date.now()}_${name}.mp4`);

    const waitMsg = await api.sendMessage(`⏳ চাঁদের পাহাড়, ভিডিওটি ডাউনলোড হচ্ছে...\n🎬 ${video.title}`, threadID);

    try {
      const res = await axios({
        url: video.videoUrl,
        responseType: "stream",
        timeout: 300000
      });

      const w = fs.createWriteStream(file);
      res.data.pipe(w);

      await new Promise((r, e) => {
        w.on("finish", r);
        w.on("error", e);
      });

      await api.unsendMessage(waitMsg.messageID);

      api.sendMessage(
        {
          body: `╭━━━━━━⊱✅⊰━━━━━━╮\n   𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n🎥 ${video.title}\n👤 @${video.author.unique_id}\n\n𖤍 𝐀𝐝𝐦𝐢𝐧: MD BELAL (BS Dealer)\n🏠 𝐇𝐨𝐦𝐞: KURIGRAM, BD${sig}`,
          attachment: fs.createReadStream(file)
        },
        threadID,
        () => fs.unlinkSync(file),
        messageID
      );
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ ডাউনলোড ব্যর্থ হয়েছে!", threadID, messageID);
    }
  }
};
