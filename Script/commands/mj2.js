const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "mj2",
    aliases: ["midjourney2", "imagine2", "mjpro"],
    version: "2.1.0",
    author: "BOTX666 🪬",
    countDown: 20,
    role: 0,
    category: "ai-image",
    guide: {
      en: "{pn} <আপনার কল্পনা>\nউদাহরণ: {pn} a king sitting on a golden throne"
    }
  },

  onStart: async function({ api, message, args, event, commandName }) {
    const { threadID, messageID, senderID } = event;
    const prompt = args.join(" ");
    
    // রিয়েল-টাইম সময় ও তারিখ (Asia/Dhaka)
    const time = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
    const date = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
    const sig = `\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${time}\n📅 তারিখ: ${date}`;

    if (!prompt) return message.reply(`⚠️ চাঁদের পাহাড়, আপনি কী ধরনের ছবি চান তা লিখে দিন।${sig}`);

    api.setMessageReaction("⏳", messageID, () => {}, true);
    const cacheDir = path.join(__dirname, 'cache');
    await fs.ensureDir(cacheDir);

    const tempPaths = [];
    let gridPath = '';

    try {
      const API_ENDPOINT = "https://dev.oculux.xyz/api/mj-proxy-pub";
      
      // এপিআই কল (৫ মিনিট টাইমআউট কারণ মিডজার্নি সময় নেয়)
      const res = await axios.get(`${API_ENDPOINT}?prompt=${encodeURIComponent(prompt.trim())}&usepolling=false`, {
        timeout: 300000
      });

      if (!res.data.status || res.data.status !== "success" || !res.data.results || res.data.results.length < 4) {
        throw new Error("API Error: জেনারেট ব্যর্থ হয়েছে বা পর্যাপ্ত ছবি পাওয়া যায়নি।");
      }

      const imageUrls = res.data.results.slice(0, 4);

      // ১. ছবিগুলো ডাউনলোড করা
      for (let i = 0; i < imageUrls.length; i++) {
        const imgData = (await axios.get(imageUrls[i], { responseType: 'arraybuffer' })).data;
        const imgPath = path.join(cacheDir, `mj2_${Date.now()}_${i}.jpg`);
        await fs.writeFile(imgPath, imgData);
        tempPaths.push(imgPath);
      }

      // ২. প্রিমিয়াম ডার্ক-গোল্ড গ্রিড তৈরি (Canvas)
      gridPath = path.join(cacheDir, `mj2_grid_${Date.now()}.png`);
      await createRoyalGrid(tempPaths, gridPath);

      api.setMessageReaction("✅", messageID, () => {}, true);

      // ৩. আউটপুট মেসেজ এবং রিপ্লাই সেটআপ
      await message.reply({
        body: `👑 𝐌𝐈𝐃𝐉𝐎𝐔𝐑𝐍𝐄𝐘 𝐕𝟐 - 𝐑𝐎𝐘𝐀𝐋 𝐆𝐑𝐈𝐃 👑\n${"━".repeat(25)}\n💡 ১, ২, ৩, ৪ অথবা "all" লিখে রিপ্লাই দিন।${sig}`,
        attachment: fs.createReadStream(gridPath)
      }, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            author: senderID,
            imageUrls,
            tempPaths,
            gridPath
          });
        } else {
          // এরর হলে ক্লিনআপ
          tempPaths.forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
          if (fs.existsSync(gridPath)) fs.unlinkSync(gridPath);
        }
      });

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      console.error(error);
      return message.reply(`❌ ছবি জেনারেট করতে সমস্যা হয়েছে। সার্ভার অনেক বেশি ব্যস্ত থাকতে পারে।${sig}`);
    }
  },

  onReply: async function({ api, message, event, Reply }) {
    const { imageUrls, tempPaths, gridPath, author } = Reply;
    const { threadID, messageID, senderID, body } = event;

    if (senderID !== author) return;

    const input = body.trim().toLowerCase();
    const time = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
    const sig = `\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ ${time}`;

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);
      const cacheDir = path.join(__dirname, 'cache');

      if (input === 'all') {
        const streams = [];
        for (const url of imageUrls) {
          const res = await axios.get(url, { responseType: 'stream' });
          streams.push(res.data);
        }
        await message.reply({ body: `✨ আপনার সবগুলো রয়্যাল ছবি এখানে:${sig}`, attachment: streams });
      } else {
        const i = parseInt(input) - 1;
        if (i < 0 || i > 3) {
          api.setMessageReaction("❌", messageID, () => {}, true);
          return;
        }
        const res = await axios.get(imageUrls[i], { responseType: 'stream' });
        await message.reply({ body: `👑 ছবি নম্বর ${input} জেনারেট হয়েছে:${sig}`, attachment: res.data });
      }
      api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (e) {
      console.error(e);
      api.setMessageReaction("❌", messageID, () => {}, true);
    } finally {
      // কাজ শেষ হওয়ার পর ক্লিনআপ
      tempPaths.forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
      if (fs.existsSync(gridPath)) fs.unlinkSync(gridPath);
      global.GoatBot.onReply.delete(Reply.messageID);
    }
  }
};

async function createRoyalGrid(paths, output) {
  const images = await Promise.all(paths.map(p => loadImage(p)));
  const size = 640; // প্রতিটি ছবির সাইজ একটু বড় করা হয়েছে প্রিমিয়াম কোয়ালিটির জন্য
  
  // ডার্ক-গোল্ড ফ্রেমের জন্য ক্যানভাস (১ ডার্ক ব্যাকগ্রাউন্ড, গোল্ড বর্ডার)
  const canvas = createCanvas(size * 2 + 30, size * 2 + 30);
  const ctx = canvas.getContext('2d');

  // ব্যাকগ্রাউন্ড: গাঢ় কালো
  ctx.fillStyle = "#111111"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pos = [
    {x: 10, y: 10}, 
    {x: size + 20, y: 10}, 
    {x: 10, y: size + 20}, 
    {x: size + 20, y: size + 20}
  ];

  // গোল্ড বর্ডার স্টাইল
  ctx.strokeStyle = "#DAA520"; 
  ctx.lineWidth = 5;

  images.forEach((img, i) => {
    // ছবি ড্র করা
    ctx.drawImage(img, pos[i].x, pos[i].y, size, size);
    
    // গোল্ড বর্ডার ড্র করা
    ctx.strokeRect(pos[i].x, pos[i].y, size, size);

    // রয়্যাল নাম্বার ব্যাজ (ডার্ক সার্কেল, গোল্ড টেক্সট)
    ctx.fillStyle = "rgba(17, 17, 17, 0.8)";
    ctx.beginPath();
    ctx.arc(pos[i].x + 40, pos[i].y + 40, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 40px Arial";
    ctx.fillText(i + 1, pos[i].x + 28, pos[i].y + 53);
  });
  
  await fs.writeFile(output, canvas.toBuffer());
}
