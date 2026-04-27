const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "uid",
    version: "2.0.0",
    author: "BELAL ⊶ BOTX666 🪬",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get Stylist Cyber UID Banner" },
    category: "info",
    guide: { en: "{pn} [mention | reply | id]" }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;
    const cachePath = path.join(__dirname, "cache", `uid_${senderID}.png`);
    const sig = "┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

    // ১. টার্গেট ইউজার আইডি নির্ধারণ
    let targetID = senderID;
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args.length > 0 && !isNaN(args[0])) {
      targetID = args[0];
    }

    const processMsg = await api.sendMessage("⚡ Identity scanning in progress...", threadID);

    try {
      // ২. ইউজার ডেটা সংগ্রহ
      const userData = await usersData.get(targetID);
      const name = userData.name || "Unknown User";
      const username = name.toUpperCase();

      // ৩. ক্যানভাস সেটআপ (1200x500 Cyberpunk Layout)
      const width = 1200;
      const height = 550;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // --- ব্যাকগ্রাউন্ড ডিজাইন ---
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#020205");
      bgGrad.addColorStop(1, "#0a0a1a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // সাইবার গ্রিড ইফেক্ট
      ctx.strokeStyle = "rgba(0, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let i = 0; i < height; i += 50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }

      // ৪. প্রোফাইল পিকচার হ্যান্ডলিং (HD Fix)
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      const avatarImg = await loadImage(response.data);

      // হেক্সাগন প্রোফাইল ফ্রেম
      const cx = 280, cy = 275, r = 180;
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        ctx.lineTo(cx + r * Math.cos(i * 2 * Math.PI / 6), cy + r * Math.sin(i * 2 * Math.PI / 6));
      }
      ctx.closePath();
      ctx.lineWidth = 15;
      ctx.strokeStyle = "#00f2fe";
      ctx.shadowColor = "#00f2fe";
      ctx.shadowBlur = 25;
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(avatarImg, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
      ctx.shadowBlur = 0;

      // ৫. টেক্সট এবং ইনফরমেশন
      ctx.textAlign = "left";
      
      // নাম (Cyber Gradient)
      ctx.font = "bold 75px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(username.slice(0, 20), 520, 200);

      // UID Label
      ctx.font = "bold 45px Courier New";
      ctx.fillStyle = "#ea00ff";
      ctx.shadowColor = "#ea00ff";
      ctx.shadowBlur = 15;
      ctx.fillText(`ID: ${targetID}`, 520, 280);
      ctx.shadowBlur = 0;

      // স্ট্যাটাস বার
      ctx.fillStyle = "rgba(0, 242, 254, 0.2)";
      ctx.fillRect(520, 310, 500, 50);
      ctx.font = "bold 25px Courier New";
      ctx.fillStyle = "#00f2fe";
      ctx.fillText("> STATUS: VERIFIED BY BOTX666 SYSTEM", 540, 345);

      // বেলল ব্র্যান্ডিং (আপনার পরিচয়)
      ctx.font = "italic 30px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText("𖤍 OWNER: MD BELAL (BS DEALER)", 520, 420);
      ctx.fillText("📍 ORIGIN: KURIGRAM, BANGLADESH", 520, 465);

      // ৬. সেভ এবং সেন্ড
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(cachePath, buffer);

      api.unsendMessage(processMsg.messageID);

      return api.sendMessage({
        body: `╭━━━━━━⊱✨⊰━━━━━━╮\n   𝐈𝐃𝐄𝐍𝐓𝐈𝐓𝐘 𝐂𝐀𝐑𝐃\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n👤 𝐍𝐚𝐦𝐞: ${name}\n🆔 𝐔𝐈𝐃: ${targetID}\n\n${sig}`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (error) {
      console.error(error);
      api.unsendMessage(processMsg.messageID);
      return api.sendMessage("❌ কার্ড তৈরি করতে সমস্যা হয়েছে।", threadID, messageID);
    }
  }
};
