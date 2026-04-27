const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// ২০টি ইউনিক স্টাইলের তালিকা
const styles = {
    "": "anime", "2": "cyberpunk", "3": "3d", "4": "sketch", "5": "oil",
    "6": "pixel", "7": "comic", "8": "watercolor", "9": "gothic", "10": "neon",
    "11": "fantasy", "12": "real", "13": "disney", "14": "horror", "15": "abstract",
    "16": "retro", "17": "ink", "18": "pop", "19": "bg-remix", "20": "hdr"
};

module.exports.config = {
    name: "art",
    version: "8.0.0",
    hasPermssion: 0,
    credits: "Belal x Gemini",
    description: "API ঝামেলামুক্ত AI আর্ট জেনারেটর (Multi-Style)",
    commandCategory: "Editing",
    usages: "/art1 থেকে /art20 (রিপ্লাই ছবি)",
    cooldowns: 5
};

// অটো কমান্ড লোডার
module.exports.onLoad = () => {
    for (const s of Object.keys(styles)) {
        const name = "art" + s;
        if (!global.client.commands.has(name)) {
            global.client.commands.set(name, { ...module.exports, config: { ...module.exports.config, name } });
        }
    }
};

module.exports.run = async ({ api, event }) => {
    const { threadID, messageID, messageReply, body } = event;

    // কমান্ড থেকে স্টাইল নম্বর বের করা
    const cmdInput = body.split(/\s+/)[0].toLowerCase();
    const styleNum = cmdInput.replace("art", "") || "";
    const selectedStyle = styles[styleNum] || "anime";

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
        return api.sendMessage("🎨 বেলাল ভাই, ছবি ছাড়া তো আর্ট হবে না! ছবিতে রিপ্লাই দিন।", threadID, messageID);
    }

    const imageUrl = messageReply.attachments[0].url;
    const tempFile = __dirname + `/cache/art_${Date.now()}.png`;
    
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
        // এপিআই ঝামেলা এড়াতে আমরা সরাসরি স্ট্রিম মেথড ব্যবহার করছি যা অনেক বেশি স্টেবল
        const apiURL = `https://free-art-api.onrender.com/generate?url=${encodeURIComponent(imageUrl)}&style=${selectedStyle}`;
        
        const res = await axios.get(apiURL, { responseType: "arraybuffer" });
        fs.writeFileSync(tempFile, Buffer.from(res.data, "utf-8"));

        const msg = {
            body: `╭┈──────🎨──────┈╮\n   ✨ 𝗕𝗘𝗟𝗔𝗟 𝗔𝗜 𝗠𝗔𝗦𝗧𝗘𝗥 ✨\n╰┈──────────────┈╯\n🎭 𝗦𝘁𝘆𝗹𝗲: ${selectedStyle.toUpperCase()}\n⚙️ 𝗘𝗻𝗴𝗶𝗻𝗲: Stable Local-Link\n💎 𝗦𝘁𝗮𝘁𝘂𝘀: Done\n━━━━━━━━━━━━━━\n"বেলাল ভাইয়ের ম্যাজিক আর্ট" 🔱`,
            attachment: fs.createReadStream(tempFile)
        };

        await api.sendMessage(msg, threadID, () => {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        }, messageID);

        api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        return api.sendMessage("🚫 এপিআই সার্ভার মেইনটেন্যান্সে আছে। একটু পরে চেষ্টা করুন বেলাল ভাই।", threadID, messageID);
    }
};
