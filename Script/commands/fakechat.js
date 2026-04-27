const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "fakechat",
  aliases: ["fchat", "fake"],
  version: "10.0.0",
  credits: "Belal x Gemini",
  countDown: 5,
  role: 0,
  shortDescription: "মেসেঞ্জার ডার্ক মোড ফেইক চ্যাট তৈরি করুন",
  category: "fun",
  guide: "{pn} @mention | msg1 | msg2"
};

// বাবল ড্রয়িং ফাংশন (উন্নত মানের)
function drawBubble(ctx, x, y, w, h, color, tailLeft = true) {
  const radius = 35;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();

  ctx.beginPath();
  if (tailLeft) {
    ctx.moveTo(x, y + 40);
    ctx.lineTo(x - 25, y + 60);
    ctx.lineTo(x, y + 80);
  } else {
    ctx.moveTo(x + w, y + 40);
    ctx.lineTo(x + w + 25, y + 60);
    ctx.lineTo(x + w, y + 80);
  }
  ctx.closePath();
  ctx.fill();
}

module.exports.run = async function ({ args, message, event, api, Users }) {
  const { senderID, mentions, threadID, messageID } = event;
  const sig = "\n┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্্ড়ৃঁ✿⃝🪬 ╾───┈";

  // ১. ইনপুট হ্যান্ডলিং (Pipe "|" ব্যবহার করা হয়েছে যাতে স্পেস থাকলেও সমস্যা না হয়)
  const content = args.join(" ").split("|").map(item => item.trim());
  if (content.length < 2) return message.reply("⚠️ সঠিক নিয়ম: fakechat @mention | হ্যালো | কি খবর?");

  let uid;
  if (Object.keys(mentions).length > 0) uid = Object.keys(mentions)[0];
  else if (/^\d{6,}$/.test(content[0])) uid = content[0];
  else return message.reply("❌ দয়া করে কাউকে মেনশন দিন অথবা সঠিক UID দিন।");

  const text1 = content[1] || "Hello!";
  const text2 = content[2] || "";

  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    const name = await Users.getNameUser(uid);
    
    // ২. ডিবি লোড (হাই রেজোলিউশন)
    const dpUrl = `https://graph.facebook.com/${uid}/picture?height=500&width=500&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    const dpImage = await loadImage(dpUrl).catch(() => loadImage("https://i.imgur.com/6veZ79p.png"));

    // ৩. ক্যানভাস সেটআপ
    const width = 1000, height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // ব্যাকগ্রাউন্ড
    ctx.fillStyle = "#18191A";
    ctx.fillRect(0, 0, width, height);

    // প্রোফাইল পিকচার (রাউন্ড)
    ctx.save();
    ctx.beginPath();
    ctx.arc(80, 100, 50, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(dpImage, 30, 50, 100, 100);
    ctx.restore();

    // নাম ও স্ট্যাটাস
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 35px Sans-serif";
    ctx.fillText(name, 150, 90);
    ctx.fillStyle = "#B0B3B8";
    ctx.font = "25px Sans-serif";
    ctx.fillText("Active now", 150, 130);

    // ৪. বাম পাশের বাবল (টার্গেট ইউজার)
    const b1_width = Math.min(ctx.measureText(text1).width + 80, 700);
    drawBubble(ctx, 50, 200, b1_width, 100, "#3A3B3C", true);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "35px Sans-serif";
    ctx.fillText(text1, 80, 260);

    // ৫. ডান পাশের বাবল (আপনি/বট ইউজার)
    if (text2) {
      const b2_width = Math.min(ctx.measureText(text2).width + 80, 700);
      const b2_x = width - b2_width - 50;
      drawBubble(ctx, b2_x, 350, b2_width, 100, "#0084FF", false);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "35px Sans-serif";
      ctx.fillText(text2, b2_x + 30, 410);
    }

    // ইমেজ সেভ ও সেন্ড
    const tempPath = path.join(__dirname, "cache", `fchat_${senderID}.png`);
    fs.ensureDirSync(path.join(__dirname, "cache"));
    fs.writeFileSync(tempPath, canvas.toBuffer());

    api.setMessageReaction("✅", messageID, () => {}, true);
    return message.reply({
      body: `✨ 𝗙𝗮𝗸𝗲𝗖𝗵𝗮𝘁 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 ✨${sig}`,
      attachment: fs.createReadStream(tempPath)
    }, () => fs.unlinkSync(tempPath));

  } catch (e) {
    console.error(e);
    return message.reply("❌ ইমেজ তৈরি করতে সমস্যা হয়েছে!");
  }
};
