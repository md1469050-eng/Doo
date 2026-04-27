const axios = require('axios');

module.exports = {
    config: {
        name: "fflike",
        version: "2.0.0",
        author: "Belal YT",
        countDown: 10,
        role: 0,
        shortDescription: "ফ্রি ফায়ার আইডিতে লাইক পাঠান",
        longDescription: "Send instant likes to any Free Fire account using international API servers",
        category: "game",
        guide: "{pn} <uid> <server_code>"
    },

    onStart: async function ({ api, event, args, message }) {
        const { threadID, messageID } = event;
        const uid = args[0];
        const server = args[1]?.toLowerCase();
        const sig = "\n┈───╼ ┄┉❈✡️ 𝗖𝗵𝗮𝗻𝗱𝗲𝗿 𝗣𝗮𝗵𝗮𝗿 ✿⃝🪬 ╾───┈";
        
        // ভ্যালিড সার্ভার লিস্ট
        const validServers = ['bd', 'ind', 'id', 'sg', 'th', 'vn', 'br', 'ru'];
        
        if (!uid || !server) {
            const usage = `╭━━━━━━━⊱ 💠 ⊰━━━━━━━╮\n   ✨ 𝗙𝗙 𝗟𝗜𝗞𝗘 𝗦𝗘𝗧𝗨𝗣 ✨\n╰━━━━━━━⊱ 💠 ⊰━━━━━━━╯\n\n` +
                `❌ ভুল ফরম্যাট! সঠিক নিয়ম দেখুন:\n` +
                `📝 নিয়ম: fflike <uid> <server_code>\n\n` +
                `🌍 সার্ভার কোডসমূহ:\n` +
                `• bd (Bangladesh)  • ind (India)\n` +
                `• sg (Singapore)   • id (Indonesia)\n` +
                `• th (Thailand)    • br (Brazil)\n\n` +
                `💡 উদাহরণ: fflike 6967621174 bd\n${sig}`;
            return message.reply(usage);
        }
        
        if (!validServers.includes(server)) {
            return message.reply("❌ সার্ভার কোড ভুল! সঠিক কোড দিন (bd, ind, sg ইত্যাদি)।");
        }

        // রিঅ্যাকশন ও লোডিং মেসেজ
        api.setMessageReaction("⏳", messageID, () => {}, true);
        const loadingMsg = await message.reply(`🔄 𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚: ইউআইডি ${uid}-এ লাইক পাঠানোর চেষ্টা করছি, দয়া করে অপেক্ষা করুন...`);

        try {
            // Free Fire Like API Call
            const response = await axios.get(
                `https://akashx404-ff-liker-api.onrender.com/like`,
                {
                    params: { uid: uid, server_name: server },
                    timeout: 20000 // ২০ সেকেন্ড টাইমআউট (সার্ভার স্লো থাকতে পারে)
                }
            );

            const data = response.data;
            
            if (data.success) {
                const playerData = data.data;
                
                // স্ট্যাটাস মেসেজ কাস্টমাইজেশন
                const statusMap = {
                    0: "✅ সফলভাবে লাইক পাঠানো হয়েছে!",
                    1: "⚠️ আজ অলরেডি লাইক নেওয়া হয়েছে!",
                    2: "⏳ কুলডাউন পিরিয়ড (অপেক্ষা করুন)",
                    3: "❌ ভুল ইউআইডি বা সার্ভার কোড!"
                };
                
                const statusText = statusMap[playerData.status] || "Unknown status";
                
                let resultBody = 
                    `╭━━━━━━━⊱ 💠 ⊰━━━━━━━╮\n   🏆 𝗙𝗙 𝗟𝗜𝗞𝗘 𝗥𝗘𝗣𝗢𝗥𝗧 🏆\n╰━━━━━━━⊱ 💠 ⊰━━━━━━━╯\n\n` +
                    `👤 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲 : ${playerData.PlayerNickname || 'Unknown'}\n` +
                    `🆔 𝗨𝗜𝗗      : ${playerData.UID || uid}\n` +
                    `🌍 𝗦𝗲𝗿𝘃𝗲𝗿   : ${server.toUpperCase()}\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `❤️ 𝗕𝗲𝗳𝗼𝗿𝗲   : ${playerData.LikesbeforeCommand || 0}\n` +
                    `❤️ 𝗔𝗳𝘁𝗲𝗿    : ${playerData.LikesafterCommand || 0}\n` +
                    `✨ 𝗚𝗶𝘃𝗲𝗻    : ${playerData.LikesGivenByAPI || 0}\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `📊 𝗦𝘁𝗮𝘁𝘂𝘀   : ${statusText}\n\n` +
                    `👑 Admin    : BELAL YT\n` +
                    `💎 Brand    : চাঁদের পাহাড়${sig}`;
                
                api.setMessageReaction("✅", messageID, () => {}, true);
                api.editMessage(resultBody, loadingMsg.messageID);
            } else {
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.editMessage("❌ এপিআই সার্ভার থেকে ভুল রেসপন্স এসেছে। পরে চেষ্টা করুন।", loadingMsg.messageID);
            }
            
        } catch (error) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            let errorMsg = "❌ এপিআই সার্ভারের সাথে কানেক্ট হতে ব্যর্থ হয়েছে।";
            
            if (error.code === 'ECONNABORTED') {
                errorMsg = "❌ সার্ভার অনেক বেশি সময় নিচ্ছে। দয়া করে একটু পর আবার ট্রাই করুন।";
            }
            
            api.editMessage(errorMsg, loadingMsg.messageID);
        }
    }
};
