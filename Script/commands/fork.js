const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "fork",
    version: "5.0.0",
    hasPermssion: 0,
    credits: "Belal x Gemini",
    description: "Repo link with ultra-premium neon design & unlimited emojis",
    commandCategory: "Information",
    usages: "fork",
    cooldowns: 5
};

module.exports.handleEvent = async ({ event, api }) => {
    const { threadID, messageID, body } = event;
    if (!body) return;

    // ১. আপনার নতুন ডিটেইলস ও সিগনেচার
    const myFB = "https://www.facebook.com/profile.php?id=61577502464880";
    const sig = "┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬 ╾───┈";

    // ২. আনলিমিটেড ইউনিক ইমোজি পুল (রিপিট হবে না)
    const icons = ["🚀", "⚡", "🛸", "🛰️", "🔥", "💎", "☄️", "🛡️", "🧬", "🧪", "⚙️", "🔋", "📡", "💻", "🎮", "👾", "🤖", "👑", "🔮", "🧿", "🩹", "🪜", "⚖️", "🪚", "🪛", "⛓️", "🔭", "🔬", "🔋", "📻", "🎙️", "🎛️", "⏱️", "⌛", "🕰️", "🪙", "💳", "📜", "📂", "📊", "📈", "📉", "📁", "📅", "🗝️", "🔨", "🔫", "🗡️", "🏹", "💣", "🧨", "⚔️", "🔱", "⚜️"];
    
    let iconIdx = 0;
    const getIcon = () => icons[Math.floor(Math.random() * icons.length)];

    // ৩. ট্রিগার চেক
    if (body.toLowerCase().includes("fork")) {

        // ৪. প্রিমিয়াম হ্যাকার কোয়ালিটি ডিজাইন
        let forkMsg = `╭┈────────── ${getIcon()} ──────────┈╮\n`;
        forkMsg += `   ${getIcon()} 𝗠𝗔𝗦𝗧𝗘𝗥 𝗕𝗘𝗟𝗔𝗟 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 ${getIcon()}\n`;
        forkMsg += `╰┈────────── ${getIcon()} ──────────┈╯\n\n`;

        forkMsg += `┏━━━━ ${getIcon()}『 📜 𝗥𝗘𝗣𝗢 𝗦𝗧𝗔𝗧𝗨𝗦 』\n`;
        forkMsg += `┃ ${getIcon()} 𝗙𝗼𝗿𝗸 পাবলিশ করা হবে অনেক দেরি আছে!\n`;
        forkMsg += `┃ ${getIcon()} অপেক্ষায় থাকো, সবথেকে ভালো জিনিস \n`;
        forkMsg += `┃ ${getIcon()} তোমাদেরকে উপহার দেব ইনশাআল্লাহ। ${getIcon()}\n`;
        forkMsg += `┗━━━━━━━━━━━━━━━━━━━━┈ ${getIcon()}\n\n`;

        forkMsg += `┏━━━━ ${getIcon()}『 🌐 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 𝗠𝗘 』\n`;
        forkMsg += `┃ ${getIcon()} 🔗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 : ${myFB}\n`;
        forkMsg += `┃ ${getIcon()} 🛡️ 𝗦𝘁𝗮𝘁𝘂𝘀   : 𝗨𝗻𝗱𝗲𝗿 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗺𝗲𝗻𝘁\n`;
        forkMsg += `┗━━━━━━━━━━━━━━━━━━━━┈ ${getIcon()}\n\n`;

        forkMsg += `${sig}\n`;
        forkMsg += `${getIcon()} 💡 "সবুরে মেওয়া ফলে, সেরা কিছুর জন্য তৈরি থেকো।" ${getIcon()}`;

        // ৫. ইমেজ/ফটো (অপশনাল - আপনার ফাইলে ইমেজ না থাকলে টেক্সট যাবে)
        const helpImages = [
            "https://i.imgur.com/6b6DGcW.jpeg",
            "https://i.imgur.com/FQQq8WH.jpeg"
        ];
        const randomUrl = helpImages[Math.floor(Math.random() * helpImages.length)];
        const cachePath = path.join(__dirname, "cache", `fork_${Date.now()}.jpg`);

        try {
            const res = await axios.get(randomUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(cachePath, Buffer.from(res.data, "binary"));
            
            return api.sendMessage({ 
                body: forkMsg, 
                attachment: fs.createReadStream(cachePath) 
            }, threadID, () => {
                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
            }, messageID);
        } catch (e) {
            return api.sendMessage(forkMsg, threadID, messageID);
        }
    }
};

module.exports.run = async ({ event, api }) => {
    return api.sendMessage("🛠️ Repository সম্পর্কে জানতে 'fork' লিখে মেসেজ দিন।", event.threadID);
};
                   
