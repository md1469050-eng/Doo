const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "antiProtect",
  version: "5.0.0",
  credits: "Belal x Gemini",
  description: "গ্রুপের নাম ও ছবি প্রটেকশন + বেয়াদব মেম্বার কিক (Ultra Premium)",
  eventType: ["log:thread-name", "log:thread-icon"],
  cooldowns: 3
};

module.exports.run = async function ({ api, event, Users, Threads }) {
  try {
    const { threadID, author, logMessageType } = event;
    const senderID = author || event.senderID;
    const botID = api.getCurrentUserID();
    
    // 👑 আপনার নতুন ওনার আইডি ও লিঙ্ক
    const ownerID = "61577502464880"; 
    const myFB = "https://www.facebook.com/profile.php?id=61577502464880";
    const sig = "\n┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬 ╾───┈";

    const dir = path.join(__dirname, "..", "..", "cache", "antiProtect");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const dataFile = path.join(dir, `${threadID}.json`);

    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = (threadInfo.adminIDs || []).map(i => i.id);
    const isAdmin = adminIDs.includes(senderID);
    const botAdmin = adminIDs.includes(botID);

    if (!botAdmin) return;

    // ব্যাকআপ ডাটা চেক
    if (!fs.existsSync(dataFile)) {
      const snap = { name: threadInfo.threadName || "", image: threadInfo.imageSrc || null };
      fs.writeFileSync(dataFile, JSON.stringify(snap, null, 2));
      return;
    }

    const oldData = JSON.parse(fs.readFileSync(dataFile));

    // ওনার বা অ্যাডমিন করলে পারমিশন এলাউ
    if (isAdmin || senderID == botID || senderID == ownerID) {
      const snap = { name: threadInfo.threadName, image: threadInfo.imageSrc };
      fs.writeFileSync(dataFile, JSON.stringify(snap, null, 2));
      return;
    }

    const name = await Users.getNameUser(senderID);
    const header = "╭┈──────────── 🛡️ ────────────┈╮";
    const footer = "╰┈──────────── ⚡ ────────────┈╯";

    if (logMessageType === "log:thread-name") {
      await api.setTitle(oldData.name, threadID);
      await api.removeUserFromGroup(senderID, threadID);
      
      const kickMsg = `${header}\n      🔥 𝗡𝗔𝗠𝗘 𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗘𝗗 🔥\n${footer}\n\n⚠️ কিরে [ ${name} ]! তোর এতো বড় সাহস যে তুই গ্রুপের নাম চেঞ্জ করিস? 😂 \n\n🚫 প্রটেকশন অন থাকায় নাম আবার আগের মতো করে দেওয়া হলো।\n👞 আর তোকে এই ধৃষ্টতার জন্য লাথি মেরে গ্রুপ থেকে বের করা হলো! ড্রেনে গিয়ে গোসল কর গে যা! 🐸${sig}`;
      api.sendMessage(kickMsg, threadID);

      // ওনারকে সিকিউরিটি রিপোর্ট পাঠানো
      const report = `╭┈─────── 🚨 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗔𝗟𝗘𝗥𝗧 ───────┈╮\n🏰 Group: ${threadInfo.threadName}\n👤 User: ${name}\n📝 Crime: গ্রুপের নাম পরিবর্তনের চেষ্টা\n❌ Action: Kick Out ✅\n\n👑 Owner: BELAL\n🌐 FB ID: ${myFB}`;
      api.sendMessage(report, ownerID);
    }

    if (logMessageType === "log:thread-icon") {
      try {
        if (oldData.image) {
          const res = await axios.get(oldData.image, { responseType: "stream" });
          await api.changeGroupImage(res.data, threadID);
        }
      } catch (err) {}

      await api.removeUserFromGroup(senderID, threadID);

      const kickMsg = `${header}\n      📸 𝗜𝗖𝗢𝗡 𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗘𝗗 📸\n${footer}\n\n⚠️ কিরে [ ${name} ]! তোর মুখ কি এতোই সুন্দর যে তুই গ্রুপের পিকচার পাল্টাইতে আসছস? 😂 \n\n✅ রাজপ্রাসাদের ছবি আবার আগের মতো সেট করা হয়েছে।\n👞 আর তোকে গ্রুপ থেকে নর্দমায় লাথি মারা হলো! ভাগ আবাল! 🐸${sig}`;
      api.sendMessage(kickMsg, threadID);

      const report = `╭┈─────── 🚨 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗔𝗟𝗘𝗥𝗧 ───────┈╮\n🏰 Group: ${threadInfo.threadName}\n👤 User: ${name}\n📝 Crime: গ্রুপের ছবি পরিবর্তনের চেষ্টা\n❌ Action: Kick Out ✅\n\n👑 Owner: BELAL\n🌐 FB ID: ${myFB}`;
      api.sendMessage(report, ownerID);
    }

  } catch (e) { console.error(e); }
};
        
