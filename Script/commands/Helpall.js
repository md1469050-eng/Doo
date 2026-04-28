const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const moment = require("moment-timezone");

module.exports.config = {
    name: "helpall",
    version: "12.0.0",
    hasPermssion: 0,
    credits: "Belal x Gemini",
    description: "Ultra VIP Interactive Dashboard with Dynamic Emoji Engine",
    commandCategory: "system",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;
    const time = moment.tz("Asia/Dhaka").format("hh:mm A");
    const myFB = "https://www.facebook.com/profile.php?id=61577502464880";
    const sig = "┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্্ড়ৃঁ✿⃝🪬 ╾───┈";

    // কিবোর্ডের সব ধরণের ইউনিক ইমোজি পুল (৫০০+ ইমোজি মিক্স)
    const emojiPool = [
        "🪬", "👑", "💎", "🔱", "⚜️", "⚡", "🌌", "🦾", "🧬", "🚀", "🛰️", "🛸", "📡", "🧿", "🔮", "⚔️", "🔥", "💎", "☄️", "🛡️", "🧬", "🧪", "⚙️", "🔋", "💻", "🎮", "👾", "🤖", "👔", "👒", "🎩", "🥽", "🎒", "🧳", "🧣", "🩹", "🩺", "🧪", "🧬", "🪜", "⚖️", "⚙️", "🪚", "🪛", "⛓️", "🔭", "🔬", "🔋", "📻", "🎙️", "🎛️", "⏱️", "⌛", "🕰️", "🪙", "💳", "📜", "📂", "📊", "📈", "📉", "📁", "📅", "📍", "🗝️", "🔨", "⚒️", "🔫", "🗡️", "🏹", "🚬", "💣", "🧨", "🩺", "🪓", "⚔️", "🔱", "⚜️", "🚩", "🏴", "🏳️", "⚧", "🌀", "💠", "☯️", "🛐", "☢️", "☣️", "⚛️", "🕉️", "✡️", "☸️", "☯️", "✝️", "☦️", "☪️", "☮️", "🕎", "🔯"
    ];

    const getRandEmoji = () => emojiPool[Math.floor(Math.random() * emojiPool.length)];

    const categories = {};
    for (let [name, value] of commands) {
        const cat = value.config.commandCategory || "GENERAL";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
    }

    let helpMsg = `🌐 ━━━『 𝐕𝐈𝐏 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘 𝐍𝐄𝐓𝐖𝐎𝐑𝐊 』━━━ 🌐\n━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (const category in categories) {
        const headEmoji = getRandEmoji();
        helpMsg += `┏━━━━ 『 ${headEmoji} ${category.toUpperCase()} ${headEmoji} 』\n`;
        
        // প্রতিটি কমান্ড আলাদা লাইনে এবং আলাদা আলাদা ইউনিক ইমোজি দিয়ে সাজানো
        const sortedCmds = categories[category].sort();
        sortedCmds.forEach(cmd => {
            helpMsg += `┃ ${getRandEmoji()} ❯ ${cmd}\n`;
        });
        
        helpMsg += `┗━━━━━━━━━━━━━━━━━━━━┈ ✨\n\n`;
    }

    helpMsg += `📊 ━━━『 𝐕𝐈𝐏 𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐓𝐀𝐓𝐒 』━━━ 📊
  
  🛰️ 𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 : ${commands.size} 
  🛡️ 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆 𝗟𝗲𝘃𝗲𝗹 : 𝐈𝐧𝐟𝐢𝐧𝐢𝐭𝐲 (𝐕𝐈𝐏)
  ⏰ 𝗨𝗽𝗱𝗮𝘁𝗲դ 𝗔𝘁    : ${time}
  
  👑 𝐎𝐰𝐧𝐞𝐫 : 𝐁𝐄𝐋𝐀𝐋 (𝐕𝐞𝐫𝐢𝐟𝐢𝐞𝐝)
  🔗 𝐅𝐁 𝐈𝐃 : ${myFB}

  ${sig}
  ✨ "Infinity is not a limit, it's a Status." ✨`;

    // হাই-কোয়ালিটি ডার্ক ভিআইপি ইমেজ পুল
    const vipImages = [
        "https://i.imgur.com/YmKByaI.jpeg",
        "https://i.imgur.com/uN2tK9Q.jpeg",
        "https://i.imgur.com/vHq0L9j.jpeg",
        "https://i.imgur.com/6b6DGcW.jpeg"
    ];
    
    const selectedImg = vipImages[Math.floor(Math.random() * vipImages.length)];
    const cacheDir = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const imgPath = path.join(cacheDir, `ultra_vip_help_${Date.now()}.jpg`);

    try {
        const res = await axios.get(selectedImg, { responseType: "arraybuffer" });
        await fs.writeFile(imgPath, Buffer.from(res.data));

        return api.sendMessage({ 
            body: helpMsg, 
            attachment: fs.createReadStream(imgPath) 
        }, threadID, () => {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }, messageID);
    } catch (e) {
        // যদি ইমেজ সার্ভারে সমস্যা থাকে তবে শুধু টেক্সট পাঠাবে যাতে কমান্ড ফেইল না হয়
        return api.sendMessage(helpMsg, threadID, messageID);
    }
};
