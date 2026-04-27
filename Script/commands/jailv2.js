const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const request = require("request");

module.exports.config = {
  name: "jailv2",
  version: "10.5",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "উন্নত গ্রাফিক্স সহ ইউজারকে জেলে ভরুন",
  commandCategory: "🤣Funny🤣",
  usages: "jail [@mention/reply/UID/link/name]",
  cooldowns: 5
};

// UID খুঁজে বের করার উন্নত লজিক
async function getUIDByFullName(api, threadID, body) {
  if (!body.includes("@")) return null;
  const match = body.match(/@(.+)/);
  if (!match) return null;
  const targetName = match[1].trim().toLowerCase().replace(/\s+/g, " ");
  const threadInfo = await api.getThreadInfo(threadID);
  const users = threadInfo.userInfo || [];
  const user = users.find(u => (u.name || "").trim().toLowerCase().replace(/\s+/g, " ") === targetName);
  return user ? user.id : null;
}

async function getTargetUser(api, event, args) {
  if (event.type === "message_reply") return event.messageReply.senderID;
  if (args[0]) {
    if (args[0].includes(".com/")) return await api.getUID(args[0]);
    if (args.join(" ").includes("@")) {
      let mentionID = Object.keys(event.mentions || {})[0];
      return mentionID || await getUIDByFullName(api, event.threadID, args.join(" "));
    }
    return args[0];
  }
  return event.senderID;
}

// জেলের হাই-কোয়ালিটি ইমেজ জেনারেটর
async function generateJailPoster(avatarPath, name, outPath) {
  const avatar = await loadImage(avatarPath);
  const width = 800;
  const height = 1000;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // ১. ব্যাকগ্রাউন্ড (অন্ধকার জেলের দেয়াল স্টাইল)
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, width, height);
  
  // জেলের টেক্সচার (হালকা গ্রিড)
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  for(let i=0; i<width; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }

  // ২. WANTED হেডার
  ctx.fillStyle = "#ff0000";
  ctx.font = "bold 120px Impact";
  ctx.textAlign = "center";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "red";
  ctx.fillText("WANTED", width / 2, 150);
  ctx.shadowBlur = 0;

  // ৩. ইউজারের ছবি (বর্ডার সহ)
  const imgSize = 450;
  const x = (width - imgSize) / 2;
  const y = 220;
  
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 10;
  ctx.strokeRect(x - 5, y - 5, imgSize + 10, imgSize + 10);
  ctx.drawImage(avatar, x, y, imgSize, imgSize);

  // ৪. জেলের শিকল (Real Bars)
  ctx.strokeStyle = "rgba(100, 100, 100, 0.9)";
  ctx.lineWidth = 25;
  ctx.lineCap = "round";
  const barCount = 7;
  const gap = width / (barCount + 1);
  
  for (let i = 1; i <= barCount; i++) {
    const bx = i * gap;
    // শিকলে শ্যাডো ইফেক্ট
    ctx.shadowBlur = 10;
    ctx.shadowColor = "black";
    ctx.beginPath();
    ctx.moveTo(bx, 180);
    ctx.lineTo(bx, 750);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // ৫. স্ট্যাটাস এবং নাম
  ctx.fillStyle = "#fff";
  ctx.font = "bold 50px Arial";
  ctx.fillText("PRISONER ID: #" + Math.floor(Math.random() * 900000 + 100000), width / 2, 820);
  
  ctx.fillStyle = "#ffcc00";
  ctx.font = "italic 60px Georgia";
  ctx.fillText(name, width / 2, 900);

  ctx.fillStyle = "#ef4444";
  ctx.font = "40px Arial";
  ctx.fillText("CRIME: EXCESSIVE CHATIING", width / 2, 960);

  fs.writeFileSync(outPath, canvas.toBuffer());
}

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;
  const targetID = await getTargetUser(api, event, args);
  
  if (!targetID) return api.sendMessage("❌ একজনকে মেনশন দে ভাই, একা একা জেলে যাবি নাকি? 🥴", threadID, messageID);

  const name = await Users.getNameUser(targetID);
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const avatarCache = path.join(cacheDir, `avt_${targetID}.jpg`);
  const jailPath = path.join(cacheDir, `jail_${Date.now()}.png`);

  try {
    const fbPicUrl = `https://graph.facebook.com/${targetID}/picture?height=1000&width=1000&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    
    const download = () => new Promise((res, rej) => {
      request(encodeURI(fbPicUrl)).pipe(fs.createWriteStream(avatarCache)).on("close", res).on("error", rej);
    });

    await download();
    await generateJailPoster(avatarCache, name, jailPath);

    const msg = targetID === senderID ? "বেলাল বসের নির্দেশে নিজেই নিজের পোদ মেরে জেলে ঢুকলো! 😹" : `@${name} অনেক পকপক করছস, এবার জেলের ভাত খা! 👮‍♂️⚖️`;

    api.sendMessage({
      body: msg,
      mentions: [{ tag: name, id: targetID }],
      attachment: fs.createReadStream(jailPath)
    }, threadID, () => {
      fs.unlinkSync(avatarCache);
      fs.unlinkSync(jailPath);
    }, messageID);

  } catch (err) {
    api.sendMessage("⚠️ জেলের তালা ভাঙা, কমান্ড কাজ করছে না!", threadID, messageID);
  }
};
