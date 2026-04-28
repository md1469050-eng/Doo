const DIG = require("discord-image-generation");
const axios = require('axios');
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "gay",
        aliases: ["rainbow", "pride"],
        version: "2.0.0",
        author: "BOTX666 🪬",
        countDown: 5,
        role: 0,
        shortDescription: { en: "Add rainbow effect to avatar" },
        category: "fun",
        guide: {
            en: "{pn} [@mention/reply]"
        }
    },

    onStart: async function ({ message, event, api }) {
        const { threadID, messageID, senderID, mentions, type, messageReply } = event;
        const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

        // ১. টার্গেট আইডি নির্ধারণ
        let targetID;
        if (type === "message_reply") {
            targetID = messageReply.senderID;
        } else if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
        } else {
            targetID = senderID;
        }

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // ২. ইমেজ প্রসেসিং
            const pth = await makeGay(targetID);

            api.setMessageReaction("✅", messageID, () => {}, true);

            // ৩. আউটপুট মেসেজ (ইউনিক ডিজাইন)
            await message.reply({
                body: `🌈 𝐏𝐫𝐢𝐝𝐞 𝐄𝐟𝐟𝐞𝐜𝐭 𝐀𝐩𝐩𝐥𝐢𝐞𝐝! 🏳️‍🌈${sig}`,
                attachment: fs.createReadStream(pth)
            }, () => {
                if (fs.existsSync(pth)) fs.unlinkSync(pth);
            });

        } catch (e) {
            console.error(e);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return message.reply("❌ চাঁদের পাহাড়, ছবি তৈরি করতে সমস্যা হয়েছে!");
        }
    }
};

async function getAvatarBuffer(uid) {
    // ফেইসবুক গ্রাফ এপিআই ব্যবহার করে প্রোফাইল পিকচার সংগ্রহ
    const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
}

async function makeGay(uid) {
    const avatar = await getAvatarBuffer(uid);
    const img = await new DIG.Gay().getImage(avatar);
    
    // ক্যাশ ফোল্ডার ম্যানেজমেন্ট
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    
    const pth = path.join(cacheDir, `gay_${Date.now()}.png`);
    fs.writeFileSync(pth, img);
    return pth;
}
