const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "self",
    version: "6.0.0",
    hasPermssion: 2,
    credits: "Belal x Gemini",
    description: "অ্যাডমিন ম্যানেজমেন্ট ও কন্ট্রোল সিস্টেম",
    commandCategory: "System",
    usages: "[add/remove/list/clean] [reply/mention/ID] [time]",
    cooldowns: 2
};

const TEMP_PATH = path.join(__dirname, "cache", "timed_admin.json");

module.exports.run = async function ({ api, event, args, Users, permssion }) {
    const { threadID, messageID, mentions, messageReply, senderID } = event;
    const GOD_ID = "61582708907708"; // আপনার ফিক্সড আইডি
    const { configPath } = global.client;
    
    // কনফিগ এবং টেম্প ডাটা লোড
    let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!fs.existsSync(TEMP_PATH)) fs.outputJsonSync(TEMP_PATH, {});
    let timedData = fs.readJsonSync(TEMP_PATH);

    const saveAll = () => {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        global.config.ADMINBOT = config.ADMINBOT;
        fs.outputJsonSync(TEMP_PATH, timedData);
    };

    const action = args[0]?.toLowerCase();
    let targetID = event.type === "message_reply" ? messageReply.senderID : Object.keys(mentions)[0] || args[1];

    // ১. স্টাইলিশ অ্যাডমিন লিস্ট
    if (action === "list" || action === "all") {
        let msg = "⭐ 𝐀𝐃𝐌𝐈𝐍 𝐈𝐍𝐓𝐄𝐋𝐋𝐈𝐆𝐄𝐍𝐂𝐄 𝐋𝐈𝐒𝐓 ⭐\n━━━━━━━━━━━━━━━━━━\n";
        for (let [index, id] of config.ADMINBOT.entries()) {
            let name = await Users.getNameUser(id);
            let type = (id === GOD_ID) ? "👑 [GOD]" : "🛡️ [ADMIN]";
            msg += `${index + 1}. ${type} ${name}\n🆔 ${id}\n\n`;
        }
        return api.sendMessage(msg + "━━━━━━━━━━━━━━━━━━", threadID, messageID);
    }

    // শুধুমাত্র বেলাল ভাই (GOD) এবং বর্তমান অ্যাডমিনরা এই কমান্ড চালাতে পারবে
    if (senderID !== GOD_ID && !config.ADMINBOT.includes(senderID)) {
        return api.sendMessage("⛔ অ্যাক্সেস ডিনাইড! এই কমান্ড শুধু বসের জন্য সংরক্ষিত।", threadID, messageID);
    }

    // ২. অ্যাডমিন যোগ করা (টাইমড সাপোর্টসহ)
    if (action === "add" && targetID) {
        if (config.ADMINBOT.includes(targetID)) return api.sendMessage("⚠️ এই ইউজার অলরেডি অ্যাডমিন লিস্টে আছেন।", threadID, messageID);

        let timeStr = args[args.length - 1];
        let ms = 0;
        if (timeStr.match(/(\d+)(m|h|d)/)) {
            let num = parseInt(timeStr);
            let unit = timeStr.slice(-1);
            ms = unit === 'm' ? num * 60000 : unit === 'h' ? num * 3600000 : num * 86400000;
        }

        config.ADMINBOT.push(targetID);
        if (ms > 0) timedData[targetID] = { expire: Date.now() + ms, tid: threadID };
        
        saveAll();
        let name = await Users.getNameUser(targetID);
        return api.sendMessage(`✅ সফলভাবে '${name}' কে অ্যাডমিন করা হয়েছে${ms > 0 ? ` (${timeStr} এর জন্য)` : ""}।`, threadID, messageID);
    }

    // ৩. অ্যাডমিন রিমুভ (গড প্রোটেকশনসহ)
    if ((action === "remove" || action === "rm") && targetID) {
        if (targetID === GOD_ID) return api.sendMessage("❌ এরর: মেইন গড আইডি সিস্টেম থেকে রিমুভ করা সম্ভব নয়!", threadID, messageID);
        
        config.ADMINBOT = config.ADMINBOT.filter(id => id !== targetID);
        delete timedData[targetID];
        saveAll();
        return api.sendMessage(`🗑️ আইডি [${targetID}] কে অ্যাডমিন লিস্ট থেকে রিমুভ করা হয়েছে।`, threadID, messageID);
    }

    // ৪. ক্লিনআপ সিস্টেম (সবাইকে রিমুভ করে শুধু আপনাকে রাখবে)
    if (action === "clean" && senderID === GOD_ID) {
        config.ADMINBOT = [GOD_ID];
        timedData = {};
        saveAll();
        return api.sendMessage("🧹 সিস্টেম ক্লিন করা হয়েছে। এখন শুধু আপনিই অ্যাডমিন।", threadID, messageID);
    }

    return api.sendMessage("🛡️ 𝐒𝐄𝐋𝐅 𝐌𝐀𝐍𝐀𝐆𝐄𝐑\n━━━━━━━━━━━━━\n• list - সব অ্যাডমিন দেখুন\n• add [reply/ID] [time] - অ্যাডমিন বানান\n• remove [reply/ID] - রিমুভ করুন\n• clean - সব পরিষ্কার করুন (BOSS ONLY)", threadID, messageID);
};

// ৫. অটো-এক্সপায়ারি চেক (প্রতি মিনিটে একবার চলবে)
setInterval(() => {
    try {
        const configPath = global.client.configPath;
        const tempPath = path.join(__dirname, "cache", "timed_admin.json");
        if (!fs.existsSync(tempPath)) return;
        
        let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        let timedData = fs.readJsonSync(tempPath);
        let changed = false;

        for (let id in timedData) {
            if (Date.now() >= timedData[id].expire) {
                config.ADMINBOT = config.ADMINBOT.filter(i => i !== id);
                delete timedData[id];
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            global.config.ADMINBOT = config.ADMINBOT;
            fs.outputJsonSync(tempPath, timedData);
        }
    } catch (e) {}
}, 60000);
