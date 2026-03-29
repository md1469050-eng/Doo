const axios = require("axios");
const fs = require("fs-extra");
const moment = require("moment-timezone");
const path = require("path");

module.exports.config = {
  name: "info",
  version: "22.0.0",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "বটের সম্পূর্ণ তথ্য ড্যাশবোর্ড (ইউনিক ডিজাইন)",
  commandCategory: "For users",
  usages: "info",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Threads }) {
  const { threadID, messageID } = event;
  const time = moment().tz("Asia/Dhaka").format("hh:mm:ss A");
  const myFB = "https://www.facebook.com/profile.php?id=61577502464880";
  const sig = "┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬 ╾───┈";

  // ১. ইউনিক ইমোজি পুল (আনলিমিটেড ও রেন্ডম)
  const icons = ["🛰️", "🚀", "⚡", "🛸", "🛡️", "🧬", "⚙️", "📡", "💻", "👾", "🤖", "👑", "🔮", "🧿", "🩹", "⚖️", "🔭", "🔬", "🔋", "⏱️", "⌛", "🪙", "💳", "📜", "📂", "📊", "📈", "📉", "📁", "📅", "🗝️", "🔨", "🔫", "🗡️", "🏹", "💣", "🧨", "⚔️", "🔱", "⚜️", "💵", "🛡️", "🔗", "💾"];
  const getIcon = () => icons[Math.floor(Math.random() * icons.length)];

  // ২. সিস্টেম স্ট্যাটাস ক্যালকুলেশন
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const threadSetting = (await Threads.getData(String(threadID))).data || {};
  const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : global.config.PREFIX;

  // ৩. একদম নতুন এবং আলাদা "Cyber-Layer" ডিজাইন
  let infoMsg = `╭┈──────── ${getIcon()} ────────┈╮
   ${getIcon()} 𝗠𝗔𝗦𝗧𝗘𝗥 𝗕𝗘𝗟𝗔𝗟 𝗜𝗡𝗙𝗢 ${getIcon()}
╰┈──────── ${getIcon()} ────────┈╯\n\n`;

  infoMsg += `┌──『 ${getIcon()} 𝗕𝗢𝗧 𝗠𝗔𝗜𝗡𝗙𝗥𝗔𝗠𝗘 』\n`;
  infoMsg += `│ ${getIcon()} 𝗡𝗮𝗺𝗲   : 𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧 𝗫𝟲𝟲𝟲\n`;
  infoMsg += `│ ${getIcon()} 𝗣𝗿𝗲𝗳𝗶𝘅  : [ ${global.config.PREFIX} ]\n`;
  infoMsg += `│ ${getIcon()} 𝗠𝗼𝗱𝘂𝗹𝗲𝘀: ${global.client.commands.size} Units\n`;
  infoMsg += `│ ${getIcon()} 𝗣𝗶𝗻𝗴   : ${Date.now() - event.timestamp}ms\n`;
  infoMsg += `└───────────────┈ ${getIcon()}\n\n`;

  infoMsg += `┌──『 ${getIcon()} 𝗢𝗪𝗡𝗘𝗥 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 』\n`;
  infoMsg += `│ ${getIcon()} 𝗔𝗱𝗺𝗶𝗻  : চাঁদের পাহাড় ✡️\n`;
  infoMsg += `│ ${getIcon()} 𝗙𝗕     : ${myFB}\n`;
  infoMsg += `│ ${getIcon()} 𝗪𝗛𝗔    : wa.me/8801913246554\n`;
  infoMsg += `│ ${getIcon()} 𝗦𝘁𝗮𝘁𝘂𝘀 : 𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱 𝗗𝗲𝘃\n`;
  infoMsg += `└───────────────┈ ${getIcon()}\n\n`;

  infoMsg += `┌──『 ${getIcon()} 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗦 』\n`;
  infoMsg += `│ ${getIcon()} 𝗨𝗽𝘁𝗶𝗺𝗲 : ${hours}h ${minutes}m ${seconds}s\n`;
  infoMsg += `│ ${getIcon()} 𝗚𝗿𝗼𝘂𝗽𝘀 : ${global.data.allThreadID.length}\n`;
  infoMsg += `│ ${getIcon()} 𝗨𝘀𝗲𝗿𝘀  : ${global.data.allUserID.length}\n`;
  infoMsg += `│ ${getIcon()} 𝗧𝗶𝗺𝗲   : ${time}\n`;
  infoMsg += `└───────────────┈ ${getIcon()}\n\n`;

  infoMsg += `${sig}\n${getIcon()} 𝗦𝘆𝘀𝘁𝗲𝗺: 𝗔𝗰𝘁𝗶𝘃𝗲 & 𝗦𝗲𝗰𝘂𝗿𝗲𝗱 ${getIcon()}`;

  // ৪. রেন্ডম ফটো হ্যান্ডলিং
  const imgLinks = [
    "https://i.imgur.com/CY5sgsk.jpeg", "https://i.imgur.com/mkYGNNk.jpeg",
    "https://i.imgur.com/gF5wIwg.jpeg", "https://i.imgur.com/UAmIDz2.jpeg",
    "https://i.imgur.com/6b6DGcW.jpeg", "https://i.imgur.com/FQQq8WH.jpeg"
  ];
  const imgUrl = imgLinks[Math.floor(Math.random() * imgLinks.length)];
  const cachePath = path.join(__dirname, "cache", `info_${Date.now()}.jpg`);

  try {
    const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    fs.outputFileSync(cachePath, Buffer.from(response.data, 'utf-8'));

    return api.sendMessage({
      body: infoMsg,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
  } catch (err) {
    return api.sendMessage(infoMsg, threadID, messageID);
  }
};
 
