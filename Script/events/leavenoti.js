const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Canvas = require("canvas");
const moment = require("moment-timezone");

module.exports.config = {
  name: "leave",
  version: "16.0.0",
  credits: "Belal x Gemini",
  description: "ডার্ক লাক্সারি লিভ ডিজাইন - অটোমেটিক ইভেন্ট",
};

module.exports.handleEvent = async function({ api, event, Users }) {
  // শুধুমাত্র লিভ নেওয়া বা কিক খাওয়ার ইভেন্ট চেক করবে
  if (event.logMessageType !== "log:unsubscribe") return;
  
  // যদি বট নিজে লিভ নেয় তবে কাজ করবে না
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const { threadID } = event;
  const leftID = event.logMessageData.leftParticipantFbId;
  
  // ইউজার নেম বের করা
  let name = "Facebook User";
  try {
      name = global.data.userName.get(leftID) || await Users.getNameUser(leftID);
  } catch (e) { console.log(e) }

  const time = moment.tz("Asia/Dhaka").format("DD/MM/YYYY | hh:mm A");
  
  // প্রিমিয়াম ডার্ক থিম ব্যাকগ্রাউন্ডস
  const bgThemes = [
    "https://i.ibb.co/v4mK9R5/bg1.jpg", 
    "https://i.ibb.co/L8zB3Wp/bg2.jpg",
    "https://i.ibb.co/qyfD9wD/bg3.jpg", 
    "https://i.ibb.co/R0r0y2d/bg4.jpg"
  ];
  const randomBg = bgThemes[Math.floor(Math.random() * bgThemes.length)];

  // রোস্টিং মেসেজ লজিক
  const roastTxt = (event.author == leftID)
    ? `নিজে নিজেই পালালি? 😡 রাস্তা মাপ আবাল! যা ভাগ! 💩`
    : `থাকার যোগ্যতা নেই তোর! 😡 তোকে সজোরে একটা লাথি মেরে বের করে দেওয়া হলো! 👞💥`;

  const cachePath = path.join(__dirname, "cache", `leave_${leftID}.png`);
  
  try {
    if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

    const avatarUrl = `https://graph.facebook.com/${leftID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    
    const [avatarRes, bgRes] = await Promise.all([
      axios.get(avatarUrl, { responseType: "arraybuffer" }).catch(() => axios.get("https://i.imgur.com/6ve9YAs.png", { responseType: "arraybuffer" })),
      axios.get(randomBg, { responseType: "arraybuffer" })
    ]);

    const canvas = Canvas.createCanvas(1200, 700);
    const ctx = canvas.getContext("2d");

    // ব্যাকগ্রাউন্ড
    ctx.drawImage(await Canvas.loadImage(bgRes.data), 0, 0, 1200, 700);

    // নিওন বক্স
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(450, 200, 700, 420);
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 8;
    ctx.strokeRect(450, 200, 700, 420);

    // প্রোফাইল পিকচার ডিজাইন
    ctx.save();
    ctx.shadowColor = "#FF0000";
    ctx.shadowBlur = 50;
    ctx.beginPath();
    ctx.arc(240, 350, 170, 0, Math.PI * 2, true);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(240, 350, 160, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.drawImage(await Canvas.loadImage(avatarRes.data), 80, 190, 320, 320);
    ctx.restore();

    // টেক্সট ডিজাইন
    ctx.shadowBlur = 15;
    ctx.shadowColor = "black";
    
    ctx.font = "bold 90px Arial";
    ctx.fillStyle = "#FF0000";
    ctx.fillText("REST IN HELL", 480, 150);

    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText("━━━━━━━ INFO ━━━━━━━", 500, 280);

    ctx.font = "38px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`👤 Name    : ${name}`, 500, 360);
    ctx.fillText(`🆔 User ID : ${leftID}`, 500, 430);
    ctx.fillText(`⏰ Time    : ${time}`, 500, 500);
    ctx.font = "bold 38px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.fillText(`👑 Owner   : BELAL (Verified)`, 500, 570);

    fs.writeFileSync(cachePath, canvas.toBuffer());

    const finalMsg = `╭┈─────── 🛑 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 🛑 ───────┈╮
       𝗟𝗼𝘀𝗲𝗿 𝗗𝗲𝘁𝗲𝗰𝘁𝗲𝗱! 💥
╰┈───────────────────────────┈╯

আহারে ${name}! 🤧
${roastTxt}

📊 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻:
🆔 User ID: ${leftID}
⏰ Left Time: ${time}

┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬 ╾───┈`;

    return api.sendMessage({ body: finalMsg, attachment: fs.createReadStream(cachePath) }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    });

  } catch (e) {
    const failMsg = `⚠️ ${name} পালিয়ে গেছে!\n\n${roastTxt}\n\n┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬`;
    return api.sendMessage(failMsg, threadID);
  }
};
