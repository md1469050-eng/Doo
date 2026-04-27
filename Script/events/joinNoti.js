const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "5.0.0",
  credits: "Belal x Gemini",
  description: "আল্ট্রা-লাক্সারি ফিউচারিস্টিক ডিজাইন উইথ ডায়নামিক ইমোজি",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

module.exports.onLoad = function () {
  const { existsSync, mkdirSync } = fs;
  const paths = [
    path.join(__dirname, "cache", "joinGif"),
    path.join(__dirname, "cache", "randomgif")
  ];
  for (const p of paths) {
    if (!existsSync(p)) mkdirSync(p, { recursive: true });
  }
};

module.exports.run = async function({ api, event }) {
  const { threadID } = event;
  const botPrefix = global.config.PREFIX || "/";
  const botName = "𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧-𝗫𝟲𝟲𝟲";

  // ৪০+ প্রিমিয়াম ও ইউনিক ইমোজি কালেকশন
  const emojiMax = ["🔱", "💎", "🛡️", "🛸", "🌀", "🛰️", "🦾", "🧿", "💫", "🎐", "🐉", "🔥", "👑", "🌠", "🌌", "🏙️", "🏮", "🎭", "🎮", "🍾", "🥃", "✨", "🌟", "🎇", "🔮", "🧪", "⚙️", "🔋", "📡", "🛸", "🧊", "💠", "🏆", "🦾", "🎖️", "⚡", "🌈", "🎋", "🍃", "🌹"];
  
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 🚀 ১. বটের রাজকীয় প্রবেশ (Bot Entry)
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    await api.changeNickname(`[ ${botPrefix} ] • ${botName}`, threadID, api.getCurrentUserID());

    const randomGifPath = path.join(__dirname, "cache", "randomgif");
    const allFiles = fs.readdirSync(randomGifPath).filter(file =>
      [".mp4", ".jpg", ".png", ".jpeg", ".gif", ".mp3"].some(ext => file.endsWith(ext))
    );

    const selected = allFiles.length > 0 
      ? fs.createReadStream(path.join(randomGifPath, allFiles[Math.floor(Math.random() * allFiles.length)])) 
      : null;

    const botEntryMsg = `╭━━━━━━━⊱ ${rand(emojiMax)} ⊰━━━━━━━╮
    🛰️ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗢𝗡𝗟𝗜𝗡𝗘 🚀
╰━━━━━━━⊱ ${rand(emojiMax)} ⊰━━━━━━━╯

👋 আসসালামু আলাইকুম! ${botName} এখন আপনার সেবায় নিয়োজিত। 

📡 𝗠𝗘𝗡𝗨 𝗖𝗢𝗡𝗧𝗥𝗢𝗟:
━━━━━━━━━━━━━━━━━━━━
⌬ [ ${botPrefix} ] Help  ➔ কমান্ড লিস্ট
⌬ [ ${botPrefix} ] Info  ➔ বট ডিটেইলস
━━━━━━━━━━━━━━━━━━━━

👑 𝗢𝘄𝗻𝗲𝗿 : 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
📞 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 : 01913246554

┈──╼ ${rand(emojiMax)}⃝🅰🅳🅼🅸🇳─͢͢চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ${rand(emojiMax)}`;

    return api.sendMessage({ body: botEntryMsg, attachment: selected }, threadID);
  }

  // 🎊 ২. নতুন মেম্বারদের জন্য ড্রিম স্বাগতম (New Generation Design)
  try {
    let { threadName, participantIDs } = await api.getThreadInfo(threadID);
    let mentions = [], nameArray = [], memCount = participantIDs.length;

    for (let id in event.logMessageData.addedParticipants) {
      const userName = event.logMessageData.addedParticipants[id].fullName;
      nameArray.push(userName);
      mentions.push({ tag: userName, id: event.logMessageData.addedParticipants[id].userFbId });
    }

    const memberMsg = `┏━━━━━━━  ${rand(emojiMax)}  ━━━━━━━┓
   🎊 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗩𝗜𝗣 𝗖𝗟𝗔𝗡 🎊
┗━━━━━━━  ${rand(emojiMax)}  ━━━━━━━┛

✨ প্রিয় ${nameArray.join(', ')}! ${rand(emojiMax)}
আমাদের এই প্রিমিয়াম পরিবারে আপনাকে উষ্ণ অভ্যর্থনা। 🥰
আশা করি আমাদের সাথে আপনার কাটানো সময়টি স্মরণীয় হবে। 🌸

📊 𝗨𝗦𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗗𝗔𝗧𝗔:
━━━━━━━━━━━━━━━━━━━━
💠 𝗡𝗮𝗺𝗲    : ${nameArray.join(', ')}
💠 𝗠𝗲𝗺𝗯𝗲𝗿  : #${memCount} (Verified)
💠 𝗚𝗿𝗼𝘂𝗽   : ${threadName}
━━━━━━━━━━━━━━━━━━━━

📜 𝗚𝗨𝗜𝗗𝗘𝗟𝗜𝗡𝗘𝗦:
◈ সম্মান বজায় রেখে কথা বলুন ${rand(emojiMax)}
◈ কোনো সমস্যা হলে এডমিনকে মেনশন দিন।

👑 𝗔𝗱𝗺𝗶𝗻: 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
┈──╼ ┄┉❈${rand(emojiMax)}⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ${rand(emojiMax)}`;

    const joinGifPath = path.join(__dirname, "cache", "joinGif");
    const files = fs.readdirSync(joinGifPath).filter(file =>
      [".mp4", ".jpg", ".png", ".jpeg", ".gif", ".mp3"].some(ext => file.endsWith(ext))
    );
    const randomFile = files.length > 0 
      ? fs.createReadStream(path.join(joinGifPath, files[Math.floor(Math.random() * files.length)])) 
      : null;

    return api.sendMessage(
      { body: memberMsg, attachment: randomFile, mentions },
      threadID
    );
  } catch (e) {
    console.error(e);
  }
};
                                                  
