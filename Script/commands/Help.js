const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
    name: "help",
    version: "9.0.0",
    hasPermssion: 0,
    credits: "Belal x Gemini",
    description: "প্রিমিয়াম সাইবার-নিওন হেল্প ড্যাশবোর্ড",
    commandCategory: "system",
    usages: "[Command Name]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;
    const prefix = global.config.PREFIX;
    const myFB = "https://www.facebook.com/profile.php?id=61577502464880";
    const sig = "┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬 ╾───┈";
    
    // হাই-কোয়ালিটি সাইবার-পঙ্ক হেল্প ইমেজ
    const helpImages = [
        "https://i.imgur.com/6b6DGcW.jpeg",
        "https://i.imgur.com/FQQq8WH.jpeg"
    ];

    const randomUrl = helpImages[Math.floor(Math.random() * helpImages.length)];
    const cacheDir = path.join(__dirname, "cache");
    const cachePath = path.join(cacheDir, `help_cyber_${Date.now()}.jpg`);

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    // ১. স্পেসিফিক কমান্ড ডিটেইলস (Elite Look)
    if (args[0] && commands.has(args[0].toLowerCase())) {
        const cmd = commands.get(args[0].toLowerCase()).config;
        const detailMsg = `╭┈──────────── 💠 ────────────┈╮
      🛰️ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 🛰️
╰┈──────────── ⚡ ────────────┈╯

  🔹 𝗡𝗮𝗺𝗲        : ${cmd.name}
  🔹 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆    : ${cmd.commandCategory}
  🔹 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻 : ${cmd.description}
  🔹 𝗨𝘀𝗮𝗴𝗲       : ${prefix}${cmd.name} ${cmd.usages}
  🔹 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻    : ${cmd.cooldowns}s
  🔹 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻  : ${cmd.hasPermssion == 0 ? "Everyone" : "Admin Only"}

  ┈─────── 🌐 𝗖𝗼𝗻𝗻𝗲𝗰𝘁 𝗠𝗲 ───────┈
  👑 Admin : 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
  🔗 FB ID : ${myFB}
  
  ${sig}`;

        try {
            const res = await axios.get(randomUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(cachePath, Buffer.from(res.data, "utf-8"));
            return api.sendMessage({ body: detailMsg, attachment: fs.createReadStream(cachePath) }, threadID, () => {
                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
            }, messageID);
        } catch (e) { return api.sendMessage(detailMsg, threadID, messageID); }
    }

    // ২. মেইন হেল্প মেনু (Premium Cyber-List)
    const categories = {};
    for (let [name, value] of commands) {
        const cat = value.config.commandCategory || "General";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
    }

    let helpMsg = `╭┈──────────── 💠 ────────────┈╮
      🌟 𝗠𝗔𝗦𝗧𝗘𝗥 𝗕𝗘𝗟𝗔𝗟 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 🌟
╰┈──────────── ⚡ ────────────┈╯\n\n`;

    for (const category in categories) {
        helpMsg += `┌─── 『 ${category.toUpperCase()} 』\n`;
        helpMsg += `│ 💠 ${categories[category].sort().join(", ")}\n└───────────────┈ ✨\n\n`;
    }

    helpMsg += `┈────────── 📊 𝗦𝗧𝗔𝗧𝗦 ──────────┈
  🚀 𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 : ${commands.size}
  🛠️ 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗣𝗿𝗲𝗳𝗶𝗫  : [ ${prefix} ]
  👑 𝗢𝘄𝗻𝗲𝗿         : 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
  🌐 𝗙𝗕 𝗟𝗶𝗻𝗸      : ${myFB}

  💡 ব্যবহার: ${prefix}help [কমান্ডের নাম]
  ${sig}`;

    try {
        const res = await axios.get(randomUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(cachePath, Buffer.from(res.data, "utf-8"));
        api.sendMessage({ 
            body: helpMsg, 
            attachment: fs.createReadStream(cachePath) 
        }, threadID, () => {
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        }, messageID);
    } catch (e) {
        api.sendMessage(helpMsg, threadID, messageID);
    }
};
