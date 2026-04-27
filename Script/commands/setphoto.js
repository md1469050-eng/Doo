const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "setphoto",
    version: "2.5.0",
    hasPermssion: 2,
    credits: "Belal x Gemini",
    description: "বটের প্রোফাইল পিকচার পরিবর্তন করুন",
    commandCategory: "System",
    usages: "[ছবির রিপ্লাই দিয়ে লিখুন !setphoto]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, messageReply, attachments, senderID } = event;
    const GOD_ID = "61582708907708"; // আপনার আইডি

    // ১. পারমিশন চেক (শুধুমাত্র আপনি পারবেন)
    if (senderID !== GOD_ID) {
        return api.sendMessage("⛔ এই ক্ষমতা শুধু বেলাল বসের আছে!", threadID, messageID);
    }

    try {
        let photoUrl = "";

        // ২. ছবি খুঁজে বের করার স্মার্ট লজিক
        if (attachments && attachments.length > 0 && attachments[0].type === "photo") {
            photoUrl = attachments[0].url;
        } else if (messageReply && messageReply.attachments && messageReply.attachments.length > 0 && messageReply.attachments[0].type === "photo") {
            photoUrl = messageReply.attachments[0].url;
        } else {
            return api.sendMessage("📸 কোনো ছবির রিপ্লাই দিন অথবা সাথে ছবি আপলোড করে লিখুন 'setphoto'!", threadID, messageID);
        }

        api.setMessageReaction("⌛", messageID, () => {}, true);
        api.sendMessage("🔄 প্রোফাইল ছবি প্রসেস করা হচ্ছে, কিছুক্ষণ অপেক্ষা করুন...", threadID, messageID);

        // ৩. ইমেজ ডাউনলোড এবং টেম্প ফাইল তৈরি
        const tempPath = path.join(__dirname, "cache", `avatar_${Date.now()}.png`);
        const response = await axios.get(photoUrl, { responseType: "arraybuffer" });
        await fs.outputFile(tempPath, Buffer.from(response.data));

        // ৪. এপিআই এর মাধ্যমে প্রোফাইল পিকচার সেট করা
        api.changeAvatar(fs.createReadStream(tempPath), (err) => {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); // কাজ শেষে ফাইল ডিলিট

            if (err) {
                console.error(err);
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("❌ প্রোফাইল ছবি পরিবর্তন ব্যর্থ হয়েছে! ফেসবুক সিকিউরিটি ইস্যু হতে পারে।", threadID, messageID);
            }

            api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage("✅ 𝐎𝐤 𝐝𝐨𝐧𝐞 𝐛𝐚𝐛𝐲! বটের প্রোফাইল পিকচার সফলভাবে পরিবর্তন করা হয়েছে।", threadID, messageID);
        });

    } catch (error) {
        console.error(error);
        return api.sendMessage("🚨 সার্ভার এরর! ছবিটি ডাউনলোড করা যাচ্ছে না।", threadID, messageID);
    }
};
