const request = require("request");
const fs = require("fs-extra");
const moment = require("moment-timezone");
const path = require("path");

module.exports.config = {
  name: "owner",
  version: "20.0.0",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "রাজকীয় সাইবার-গ্যালাক্সি ওনার ড্যাশবোর্ড (আনলিমিটেড ইমোজি)",
  commandCategory: "Information",
  usages: "",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, senderID } = event;
  const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY | hh:mm A");
  const myFB = "https://www.facebook.com/profile.php?id=61577502464880";
  const sig = "┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬 ╾───┈";
  
  // আনলিমিটেড ইউনিক ইমোজি পুল (রিপিট হবে না)
  const icons = ["🚀", "⚡", "🛸", "🛰️", "🛸", "🔥", "💎", "☄️", "🛡️", "🧬", "🧪", "⚙️", "🔋", "📡", "💻", "🎮", "👾", "🤖", "👔", "🎒", "👒", "🎩", "🎒", "🥽", "🎒", "🧳", "🧣", "🎩", "👑", "🔮", "🧿", "🩹", "🩺", "🧪", "🧬", "🪜", "⚖️", "⚙️", "🪚", "🪛", "⛓️‍💥", "⛓️", "🔭", "🔬", "🔋", "📻", "🎙️", "🎛️", "⏱️", "⌛", "🕰️", "🪙", "💳", "📜", "📂", "📊", "📈", "📉", "📁", "📅", "📍", "🗝️", "🔨", "⚒️", "🔫", "🗡️", "🏹", "🚬", "💣", "🧨", "🩺", "🪓", "⚔️", "🔱", "⚜️", "💸", "⚖️", "🛡️", "🔗", "💾", "📡", "🛸", "🔭", "🔬"];
  
  let iconIdx = 0;
  const getIcon = () => icons[iconIdx++ % icons.length];

  // ১. ফিউচারিস্টিক ড্যাশবোর্ড ডিজাইন শুরু (আনলিমিটেড ইমোজি ও ডিজাইন)
  let ownerInfo = `╭┈────────── ${getIcon()} ──────────┈╮
   ${getIcon()} 𝗠𝗔𝗦𝗧𝗘𝗥 𝗕𝗘𝗟𝗔𝗟 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 ${getIcon()}
╰┈────────── ${getIcon()} ──────────┈╯\n\n`;

  ownerInfo += `┏━━━━ ${getIcon()}『 👑 𝗩𝗜𝗣 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 👑 』\n`;
  ownerInfo += `┃ ${getIcon()} 𝗡𝗮𝗺𝗲      : 𝗕𝗘𝗟𝗔𝗟 𝗬𝗧 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱) ${getIcon()}\n`;
  ownerInfo += `┃ ${getIcon()} 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲  : চাঁদের পাহাড় ${getIcon()}\n`;
  ownerInfo += `┃ ${getIcon()} 𝗚𝗲𝗻𝗱𝗲𝐫    : 𝗠𝗮𝗹𝗲 (👑) ${getIcon()}\n`;
  ownerInfo += `┃ ${getIcon()} 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻  : 𝗦𝗶𝗻𝗴լ𝗲 𝗕𝘂𝘁 𝗥𝗼𝘆𝗮𝗹 💎 ${getIcon()}\n`;
  ownerInfo += `┃ ${getIcon()} 𝗔𝗴𝗲       : 𝟭𝟴+ ${getIcon()}\n`;
  ownerInfo += `┃ ${getIcon()} 𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝗻  : 𝗜𝘀𝗹𝗮𝗺 (🕋) ${getIcon()}\n`;
  ownerInfo += `┃ ${getIcon()} 𝗣𝗿𝗼𝗳𝗲𝘀𝘀𝗶𝗼𝗻 : 𝗦𝘁𝘂𝗱𝗲𝗻𝘁 (𝗛𝗦𝗖) ${getIcon()}\n`;
  ownerInfo += `┃ ${getIcon()} 𝗔𝗱𝗱𝗿𝗲𝘀𝘀  : 𝗞𝘂𝗿𝗶𝗴𝗿𝗮𝗺, 𝗕𝗮𝗻𝗴𝗹𝗮𝗱𝗲𝘀𝗵 🇧🇩 ${getIcon()}\n`;
  ownerInfo += `┗━━━━━━━━━━━━━━━━━━━━┈ ${getIcon()}\n\n`;

  ownerInfo += `┈───────── ${getIcon()} 𝗖𝗢𝗡𝗡𝗘𝗖𝗧 𝗠𝗘 ${getIcon()} ─────────┈\n`;
  ownerInfo += `  ${getIcon()} 🔗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 : ${myFB}\n`;
  ownerInfo += `  ${getIcon()} 📞 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 : 𝟬𝟭𝟵𝟭𝟯𝟮𝟰𝟲𝟱𝟱𝟰\n`;
  ownerInfo += `  ${getIcon()} ✈️ 𝗧𝗶𝗸𝗧𝗼𝗸   : চাঁদের পাহাড় ${getIcon()}\n`;
  ownerInfo += `  ${getIcon()} 🛡️ 𝗦𝘁𝗮𝘁𝘂𝘀   : 𝗢𝗻𝗹𝗶𝗻𝗲 & 𝗦𝗲𝗰𝘂𝗿𝗲𝗱 ${getIcon()}\n`;
  
  ownerInfo += `\n🕒 𝗨𝗽𝗱𝗮𝘁𝗲𝗱: ${time}\n`;
  ownerInfo += `💡 " যোগ্যতায় অর্জন করুন, কপাল এমনিতেই বদলে যাবে। "\n`;
  ownerInfo += `  ${getIcon()} 💔 Gf: আমার কপালে যে গার্লফ্রেন্ড নাই ${getIcon()}\n`;
  ownerInfo += `${sig}`;

  // ২. আপনার প্রিমিয়াম সাইবার-পঙ্ক ইমেজ লিঙ্ক
  const images = [
    "https://i.imgur.com/CY5sgsk.jpeg",
    "https://i.imgur.com/mkYGNNk.jpeg",
    "https://i.imgur.com/gF5wIwg.jpeg",
    "https://i.imgur.com/UAmIDz2.jpeg",
    "https://i.imgur.com/6b6DGcW.jpeg",
    "https://i.imgur.com/FQQq8WH.jpeg"
  ];

  const randomImg = images[Math.floor(Math.random() * images.length)];
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  const cachePath = path.join(cacheDir, `owner_${Date.now()}.jpg`);

  const callback = () => api.sendMessage(
    {
      body: ownerInfo,
      attachment: fs.createReadStream(cachePath)
    },
    threadID,
    () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    },
    event.messageID
  );

  return request(encodeURI(randomImg))
    .pipe(fs.createWriteStream(cachePath))
    .on("close", callback);
};
