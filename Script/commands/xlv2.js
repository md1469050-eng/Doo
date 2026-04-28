const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "xlv2",
    aliases: ["sdxl", "gen", "imagine"],
    version: "2.0.0",
    author: "BOTX666 🪬",
    countDown: 15,
    role: 0,
    category: "image",
    description: {
      en: "Generate high-quality AI images using SDXL Model"
    },
    guide: {
      en: "{pn} prompt [--ar 2:3]"
    }
  },

  onStart: async function ({ api, event, message, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const cost = 50;

    // সময় ও তারিখ (Asia/Dhaka)
    const timeFull = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
    const dateFull = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
    const sig = `\n━━━━━━━━━━━━━━━━━━━━\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${timeFull}\n📅 তারিখ: ${dateFull}`;

    if (!args[0]) {
      return message.reply(`😡 একটি প্রম্পট দিন।\n📌 উদাহরণ: xlv2 a beautiful girl --ar 2:3${sig}`);
    }

    try {
      // কয়েন চেক ও ব্যালেন্স আপডেট
      const userData = await usersData.get(senderID);
      const balance = userData.money || 0;

      if (balance < cost) {
        return message.reply(`❌ আপনার পর্যাপ্ত কয়েন নেই।\n💰 খরচ: ${cost} কয়েন\n🏦 আপনার ব্যালেন্স: ${balance}${sig}`);
      }

      await usersData.set(senderID, { money: balance - cost });
      api.setMessageReaction("🎨", messageID, () => {}, true);
      
      message.reply(`💸 খরচ হয়েছে ${cost} কয়েন\n⏳ আপনার কল্পনার ছবিটি তৈরি হচ্ছে...`);

      // রেশিও হ্যান্ডলিং
      let ratio = "1:1";
      const ratioIndex = args.findIndex(arg => arg.startsWith("--ar="));
      if (ratioIndex !== -1) {
        ratio = args[ratioIndex].split("=")[1];
        args.splice(ratioIndex, 1);
      } else {
        const flagIndex = args.findIndex(arg => arg === "--ar");
        if (flagIndex !== -1 && args[flagIndex + 1]) {
          ratio = args[flagIndex + 1];
          args.splice(flagIndex, 2);
        }
      }

      const prompt = args.join(" ");
      const imageURL = `https://smfahim.xyz/xl31?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}`;
      const startTime = Date.now();

      // ইমেজ জেনারেট ও ডাউনলোড
      const res = await axios.get(imageURL, { responseType: "arraybuffer" });

      const cacheDir = path.join(process.cwd(), "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `xl_${Date.now()}.png`);
      
      await fs.writeFile(filePath, Buffer.from(res.data));

      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

      await message.reply({
        body: `🖼️ 𝐒𝐃𝐗𝐋 𝐀𝐈 𝐈𝐌𝐀𝐆𝐄 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃\n━━━━━━━━━━━━━━━━━━━━\n📝 𝐏𝐫𝐨𝐦𝐩𝐭: ${prompt}\n📐 𝐑𝐚𝐭𝐢𝐨: ${ratio}\n⏱️ 𝐓𝐢𝐦𝐞: ${timeTaken} 𝐬𝐞𝐜${sig}`,
        attachment: fs.createReadStream(filePath)
      });

      api.setMessageReaction("✅", messageID, () => {}, true);
      if (fs.existsSync(filePath)) await fs.unlink(filePath);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      message.reply(`❌ ইমেজ তৈরি করতে ব্যর্থ হয়েছে। সার্ভার ডাউন থাকতে পারে।${sig}`);
    }
  }
};
