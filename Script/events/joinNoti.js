const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "4.0.0",
  credits: "Belal x Gemini",
  description: "চাঁদের পাহাড় ফিউচারিস্টিক ওয়েলকাম ডিজাইন উইথ ক্লিকেবল আইডি",
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
  const myFB = "https://www.facebook.com/profile.php?id=61577502464880";

  // 🚀 ১. বটের নিজের রাজকীয় প্রবেশ (Bot Entry)
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    await api.changeNickname(`[ ${botPrefix} ] • ${botName}`, threadID, api.getCurrentUserID());

    const randomGifPath = path.join(__dirname, "cache", "randomgif");
    const allFiles = fs.readdirSync(randomGifPath).filter(file =>
      [".mp4", ".jpg", ".png", ".jpeg", ".gif", ".mp3"].some(ext => file.endsWith(ext))
    );

    const selected = allFiles.length > 0 
      ? fs.createReadStream(path.join(randomGifPath, allFiles[Math.floor(Math.random() * allFiles.length)])) 
      : null;

    const botEntryMsg = `╭┈────────────── 💠 ──────────────┈╮
      ✨ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗦𝗧𝗔𝗟𝗟𝗘𝗗: ${botName} ✨
╰┈────────────── 🛰️ ──────────────┈╯

  👋 আসসালামু আলাইকুম! আমাকে এই চমৎকার গ্রুপে 
  যুক্ত করার জন্য অসংখ্য ধন্যবাদ। আমি প্রস্তুত! 🚀

  🛠️ 𝗤𝘂𝗶𝗰𝗸 𝗠𝗲𝗻𝘂:
  🔹 [ ${botPrefix} ] Help  - সব কমান্ড দেখতে।
  🔹 [ ${botPrefix} ] Info  - বট সম্পর্কে জানতে।

  💎 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 𝗖𝗼𝗻𝘁𝗮𝗰𝘁:
  👤 Owner: 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
  🌐 FB ID: ${myFB}
  📞 WhatsApp: 01913246554

  ┈───────── 💠 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗔𝗰𝘁𝗶𝘃𝗲 ─────────┈
      ✡️⃝🅰🅳🅼🅸🇳─͢͢চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✡️`;

    return api.sendMessage({ body: botEntryMsg, attachment: selected }, threadID);
  }

  // 🎊 ২. নতুন মেম্বারদের জন্য ড্রিম ওয়েলকাম (Member Entry)
  try {
    let { threadName, participantIDs } = await api.getThreadInfo(threadID);
    const threadData = global.data.threadData.get(parseInt(threadID)) || {};
    let mentions = [], nameArray = [], memCount = participantIDs.length;

    for (let id in event.logMessageData.addedParticipants) {
      const userName = event.logMessageData.addedParticipants[id].fullName;
      nameArray.push(userName);
      mentions.push({ tag: userName, id: event.logMessageData.addedParticipants[id].userFbId });
    }

    const memberMsg = `╭┈─────── 🎊 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 🎊 ───────┈╮
       𝗦𝗼𝗳𝘁 & 𝗘𝗹𝗶𝘁𝗲 𝗚𝗿𝗲𝗲𝘁𝗶𝗻𝗴𝘀! 🌸
╰┈────────────────────────────┈╯

  ✨ স্বাগতম {name}! 
  আমাদের এই রাজকীয় পরিবারে আপনাকে পেয়ে আমরা আনন্দিত। 💝
  আশা করি আপনার সময়টি এখানে দারুণ কাটবে। 🥰

  📜 𝗖𝗼𝗺𝗺𝘂𝗻𝗶𝘁𝘆 𝗥𝘂𝗹𝗲𝘀:
  💠 একে অপরকে সম্মান করুন (Respect All)
  💠 গালিগালাজ সম্পূর্ণ নিষিদ্ধ (No Bad Words)
  💠 এডমিনের কথা মেনে চলুন (Follow Admin)

  📊 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻:
  👤 Name: {name}
  🔢 Member No: ${memCount}
  🏘️ Group: {threadName}

  ┈──────── 💠 𝗢𝘄𝗻𝗲𝗿 𝗜𝗻𝗳𝗼 ────────┈
  👑 Admin: 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
  🌐 FB ID: ${myFB}
  
  ┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬 ╾───┈`;

    const finalMsg = memberMsg
      .replace(/\{name}/g, nameArray.join(', '))
      .replace(/\{threadName}/g, threadName);

    const joinGifPath = path.join(__dirname, "cache", "joinGif");
    const files = fs.readdirSync(joinGifPath).filter(file =>
      [".mp4", ".jpg", ".png", ".jpeg", ".gif", ".mp3"].some(ext => file.endsWith(ext))
    );
    const randomFile = files.length > 0 
      ? fs.createReadStream(path.join(joinGifPath, files[Math.floor(Math.random() * files.length)])) 
      : null;

    return api.sendMessage(
      { body: finalMsg, attachment: randomFile, mentions },
      threadID
    );
  } catch (e) {
    console.error(e);
  }
};
        
