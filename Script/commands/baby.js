const axios = require('axios');
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

// গ্লোবাল এপিআই ক্যাশ (Speed Optimization)
let cachedApiUrl = "";
const getBaseUrl = async () => {
  if (cachedApiUrl) return cachedApiUrl;
  const res = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
  cachedApiUrl = res.data.api;
  return cachedApiUrl;
};

module.exports.config = {
  name: "baby",
  version: "25.0.0",
  credits: "Belal x Gemini",
  cooldowns: 0,
  hasPermssion: 0,
  description: "Advanced Elite AI - Multi-Trigger & User Recognition",
  commandCategory: "chat",
  usePrefix: true,
  prefix: true,
  usages: "baby [message] | teach | list"
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;
  const name = await Users.getNameUser(senderID);
  const time = moment().tz("Asia/Dhaka").format("hh:mm A");
  const myFB = "https://www.facebook.com/profile.php?id=61577502464880";
  const sig = "┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬 ╾───┈";
  
  const icons = ["💎", "🚀", "⚡", "🛸", "🔥", "☄️", "🛡️", "🧬", "⚙️", "📡", "💻", "👾", "🤖", "👑", "🔮", "🧿", "🩹", "⚖️", "🔭", "🔬", "🔋", "⏱️", "🪙", "💳", "📜", "📊", "🗝️", "🔫", "💣", "⚔️", "🔱", "⚜️"];
  const getIcon = () => icons[Math.floor(Math.random() * icons.length)];

  try {
    const link = `${await getBaseUrl()}/baby`;
    const input = args.join(" ").toLowerCase();

    // ১. হেল্প মেনু বা শুধু কমান্ড দিলে
    if (!args[0]) {
      const intro = `╭┈───────── ${getIcon()} ─────────┈╮
   ${getIcon()} 𝗠𝗔𝗦𝗧𝗘𝗥 𝗕𝗘𝗟𝗔𝗟 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 ${getIcon()}
╰┈───────── ${getIcon()} ─────────┈╯

👋 আসসালামু আলাইকুম, ${name}!
আমি আপনার পার্সোনাল জানু বট। 💖

🌟 আমাকে ডাকুন: [বেবি, জানু, জান, bot]
🛠️ কমান্ড: teach, list, edit, remove

🕒 সময়: ${time}
${sig}`;
      return api.sendMessage(intro, threadID, messageID);
    }

    // ২. উন্নত টিচিং সিস্টেম
    if (args[0] === 'teach') {
      const [q, a] = input.replace("teach ", "").split(' - ');
      if (!q || !a) return api.sendMessage(`❌ ${getIcon()} ফরম্যাট: teach শব্দ - উত্তর`, threadID, messageID);
      const res = await axios.get(`${link}?teach=${encodeURIComponent(q)}&reply=${encodeURIComponent(a)}&senderID=${senderID}`);
      return api.sendMessage(`✅ ${getIcon()} ঠিক আছে ${name}! আমি শিখে নিলাম।\n━━━━━━━━━━━━━\n📝 প্রশ্ন: ${q}\n🎭 উত্তর: ${a}\n${sig}`, threadID, messageID);
    }

    // ৩. ডাইনামিক চ্যাট
    const response = (await axios.get(`${link}?text=${encodeURIComponent(input)}&senderID=${senderID}&font=1`)).data.reply;
    return api.sendMessage(response, threadID, (error, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: senderID,
        lnk: response,
        apiUrl: link
      });
    }, messageID);

  } catch (e) {
    return api.sendMessage(`⚠️ ${getIcon()} ওহ না ${name}! আমার ব্রেইন একটু জ্যাম হয়েছে। আবার চেষ্টা করো।`, threadID, messageID);
  }
};

// 🌟 হাই-লেভেল সেন্টিমেন্ট ইভেন্ট হ্যান্ডলার
module.exports.handleEvent = async function ({ api, event, Users }) {
  const { threadID, messageID, body, senderID } = event;
  if (!body || senderID == api.getCurrentUserID()) return;
  const input = body.toLowerCase();
  const name = await Users.getNameUser(senderID);

  // স্মার্ট মাল্টি-ট্রিগার লিস্ট (Advanced Sentiments)
  const triggers = ["baby", "janu", "bby", "bot", "bay", "বেবি", "জানু", "জান", "বট", "i love you", "ki koro", "কেমন আছো"];
  
  if (triggers.some(t => input.includes(t))) {
    try {
      const link = `${await getBaseUrl()}/baby`;
      const cleanBody = input.replace(/baby|janu|bby|bot|bay|বেবি|জানু|জান|বট/g, "").trim();
      
      if (!cleanBody) {
        const reacts = [`জি ${name} জানু বলো? 🥰`, `হুম বেবি শুনছি, কিছু বলবে? 💖`, `আই লাভ ইউ টু ${name}! ✨`, `আমি আপনার সেবায় নিয়োজিত! 🤖`];
        return api.sendMessage(reacts[Math.floor(Math.random() * reacts.length)], threadID, messageID);
      }

      const res = (await axios.get(`${link}?text=${encodeURIComponent(cleanBody)}&senderID=${senderID}&font=1`)).data.reply;
      return api.sendMessage(res, threadID, messageID);
    } catch (e) { console.log(e); }
  }
};

// স্মার্ট কন্টিনিউ চ্যাট (Reply Handler)
module.exports.handleReply = async function ({ api, event, handleReply }) {
  if (event.type !== "message_reply") return;
  try {
    const link = `${await getBaseUrl()}/baby`;
    const res = (await axios.get(`${link}?text=${encodeURIComponent(event.body)}&senderID=${event.senderID}&font=1`)).data.reply;
    return api.sendMessage(res, event.threadID, event.messageID);
  } catch (e) { console.log(e); }
};
