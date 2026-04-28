const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
    config: {
        name: "marry",
        aliases: ["বিবাহ", "marryv4"],
        version: "2.5.0",
        author: "BOTX666 🪬",
        countDown: 5,
        role: 0,
        shortDescription: { en: "Get married to someone!" },
        category: "love",
        guide: { en: "{pn} @mention" }
    },

    onStart: async function ({ api, message, event, args }) {
        const { threadID, messageID, senderID, mentions } = event;
        
        // সময় এবং তারিখ সেটআপ
        const time = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
        const date = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
        const sig = `\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${time}\n📅 তারিখ: ${date}`;

        const mention = Object.keys(mentions);
        let one, two;

        if (mention.length == 0) {
            return message.reply(`⚠️ চাঁদের পাহাড়, আপনি কাকে বিয়ে করতে চান তাকে মেনশন করুন!${sig}`);
        } else if (mention.length == 1) {
            one = senderID;
            two = mention[0];
        } else {
            one = mention[1];
            two = mention[0];
        }

        api.setMessageReaction("⏳", messageID, () => {}, true);

        try {
            const pth = await makeMarry(one, two);
            
            api.setMessageReaction("✅", messageID, () => {}, true);
            
            await message.reply({
                body: `💍 আলহামদুলিল্লাহ্‌, আপনাদের বিবাহ সম্পন্ন হলো! 😍${sig}`,
                attachment: fs.createReadStream(pth)
            }, () => {
                if (fs.existsSync(pth)) fs.unlinkSync(pth);
            });

        } catch (e) {
            console.error(e);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return message.reply(`❌ বিবাহ সম্পন্ন করতে সমস্যা হয়েছে!${sig}`);
        }
    }
};

async function makeMarry(one, two) {
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const pth = path.join(cacheDir, `marry_${Date.now()}.png`);

    // প্রোফাইল পিকচার সংগ্রহ ও প্রসেসিং
    let avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avone.circle();
    
    let avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avtwo.circle();
    
    // ব্যাকগ্রাউন্ড ইমেজ
    let img = await jimp.read("https://i.postimg.cc/XN1TcH3L/tumblr-mm9nfpt7w-H1s490t5o1-1280.jpg");

    // ইমেজ কম্পোজিট
    img.resize(1024, 684)
       .composite(avone.resize(85, 85), 204, 160)
       .composite(avtwo.resize(80, 80), 315, 105);

    await img.writeAsync(pth);
    return pth;
}
