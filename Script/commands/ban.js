const axios = require("axios");

module.exports.config = {
    name: "ban",
    version: "9.5.0",
    hasPermssion: 2,
    credits: "Chander Pahar x Gemini",
    description: "অ্যাডভান্স গ্লোবাল এবং ম্যানুয়াল ব্যান সিস্টেম (Elite UI)",
    commandCategory: "System",
    usages: "ban on/off | ban [@mention/reply/UID/link] | ban list",
    cooldowns: 2
};

// নিখুঁত ইউআইডি ডিটেকশন লজিক
async function getTargetID(api, event, args) {
    if (event.type === "message_reply") return event.messageReply.senderID;
    if (args.join().includes("@")) return Object.keys(event.mentions)[0];
    if (args[0] && args[0].includes("facebook.com")) return await api.getUID(args[0]);
    if (args[0] && !isNaN(args[0])) return args[0];
    return null;
}

module.exports.run = async ({ event, api, Users, args }) => {
    const { threadID, messageID } = event;
    const botID = api.getCurrentUserID();

    // ১. গ্লোবাল ব্যান অন
    if (args[0] === "on") {
        global.data.globalBan = true;
        return api.sendMessage("🛡️ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗟𝗢𝗖𝗞𝗘𝗗\n━━━━━━━━━━━━━\nগ্লোবাল ব্যান সক্রিয় করা হয়েছে। এখন থেকে কোনো ব্যান হওয়া ইউজার বট ব্যবহার করতে পারবে না।", threadID, messageID);
    }

    // ২. গ্লোবাল ব্যান অফ
    if (args[0] === "off" && !args[1]) {
        global.data.globalBan = false;
        return api.sendMessage("🔓 𝗦𝗬𝗦𝗧𝗘𝗠 𝗨𝗡𝗟𝗢𝗖𝗞𝗘𝗗\n━━━━━━━━━━━━━\nগ্লোবাল ব্যান নিষ্ক্রিয় করা হয়েছে।", threadID, messageID);
    }

    // ৩. ব্যান লিস্ট দেখা
    if (args[0] === "list") {
        const bannedList = Array.from(global.data.userBanned.entries());
        if (bannedList.length === 0) return api.sendMessage("✅ কোনো ইউজার বর্তমানে ব্যান নেই।", threadID, messageID);

        let msg = "🚫 𝗕𝗔𝗡𝗡𝗘𝗗 𝗨𝗦𝗘𝗥𝗦 𝗟𝗜𝗦𝗧\n━━━━━━━━━━━━━\n";
        for (let i = 0; i < bannedList.length; i++) {
            const uid = bannedList[i][0];
            const name = await Users.getNameUser(uid);
            msg += `${i + 1}. 👤 ${name}\n🆔 ${uid}\n────────────────\n`;
        }
        msg += "💡 আনব্যান করতে এই মেসেজে সিরিয়াল নম্বর লিখে রিপ্লাই দিন।";
        
        return api.sendMessage(msg, threadID, (err, info) => {
            global.client.handleReply.push({
                name: "ban",
                messageID: info.messageID,
                author: event.senderID,
                bannedList
            });
        }, messageID);
    }

    // ৪. ম্যানুয়াল ব্যান এবং আনব্যান প্রসেস
    const targetID = await getTargetID(api, event, args[0] === "off" ? [args[1]] : args);
    
    if (!targetID) {
        return api.sendMessage("⚠️ দয়া করে সঠিক ইউজার মেনশন করুন অথবা প্রোফাইল লিঙ্ক দিন।", threadID, messageID);
    }

    if (targetID == botID) return api.sendMessage("🚫 আপনি বটকে ব্যান করতে পারবেন না!", threadID, messageID);

    let userData = (await Users.getData(targetID)).data || {};

    // আনব্যান লজিক (ban off <target>)
    if (args[0] === "off") {
        userData.banned = 0;
        await Users.setData(targetID, { data: userData });
        global.data.userBanned.delete(targetID);
        const name = await Users.getNameUser(targetID);
        return api.sendMessage(`🔓 𝗨𝗦𝗘𝗥 𝗥𝗘𝗦𝗧𝗢𝗥𝗘𝗗\n━━━━━━━━━━━━━\nনাম: ${name}\nআইডি: ${targetID}\n\nইউজারকে পুনরায় বট ব্যবহারের অনুমতি দেওয়া হয়েছে।`, threadID, messageID);
    }

    // ব্যান লজিক
    if (global.data.userBanned.has(targetID)) return api.sendMessage("⚠️ এই ইউজার অলরেডি ব্যান লিস্টে আছে।", threadID, messageID);

    userData.banned = 1;
    userData.reason = "Manual System Ban";
    userData.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    await Users.setData(targetID, { data: userData });
    global.data.userBanned.set(targetID, { reason: userData.reason, date: userData.date });

    const name = await Users.getNameUser(targetID);
    const msg = 
`🚫 𝗨𝗦𝗘𝗥 𝗕𝗔𝗡𝗡𝗘𝗗 
━━━━━━━━━━━━━
👤 নাম: ${name}
🆔 আইডি: ${targetID}
📝 কারণ: সিস্টেম ভায়োলেশন
📅 তারিখ: ${userData.date}
━━━━━━━━━━━━━
"অপ্রয়োজনীয় গালি বা স্প্যামিং করলে ব্যান অনিবার্য।" 🏔️`;

    return api.sendMessage(msg, threadID, messageID);
};

// ৫. হ্যান্ডেল রিপ্লাই (লিস্ট থেকে আনব্যান)
module.exports.handleReply = async ({ event, api, Users, handleReply }) => {
    if (event.senderID != handleReply.author) return;

    const index = parseInt(event.body) - 1;
    if (isNaN(index) || index < 0 || index >= handleReply.bannedList.length) {
        return api.sendMessage("❌ ভুল নম্বর! দয়া করে লিস্ট অনুযায়ী নম্বর দিন।", event.threadID);
    }

    const uid = handleReply.bannedList[index][0];
    let data = (await Users.getData(uid)).data || {};
    data.banned = 0;

    await Users.setData(uid, { data });
    global.data.userBanned.delete(uid);

    const name = await Users.getNameUser(uid);
    return api.sendMessage(`🔓 ইউজার ${name} (${uid}) সফলভাবে আনব্যান হয়েছে।`, event.threadID);
};
