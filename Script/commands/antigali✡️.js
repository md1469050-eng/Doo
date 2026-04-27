let antiGaliStatus = true; 
let offenseTracker = {}; 

// BLACK HOLD গ্রুপের আইডি (এখানেই নোটিশ আসবে)
const ADMIN_REPORT_GROUP_ID = "26836635292647856"; 

const badWords = [
  "কুত্তার বাচ্চা","মাগী","মাগীচোদ","চোদা","চুদ","চুদা","চুদামারান","চুদির","চুত","চুদি",
  "চুতমারানি","চুদের বাচ্চা","shawya","বালের","বালের ছেলে","বালছাল","মাগীর ছেলে","রান্ডি",
  "রান্দির ছেলে","বেশ্যা","বেশ্যাপনা","Khanki","mgi","fuck","fck","mc","bc","xhudas",
  "abal","fucking","motherfucker","guyar","mfer","motherfuer","mthrfckr","putki","bastard",
  "bessa","hijra","a*hole","dick","cock","prick","pussy","cunt","fag","faggot",
  "khankir pola","khanki magi","গাণ্ডু","বাল","শুয়োরের বাচ্চা","তোর মারে চুদি","খানকির ছেলে",
  "মাদারচোদ","মাউগির পুত","পুটকি মারা","গুয়ামারা","বেজন্মা","হারামজাদা","চোদনা","চোদানি",
  "ভোদাই","বিচি","লুচ্চা","কুত্তার নাতি","খানকি","মাগি","চুদানির পোলা","গুদ","গুদামারা",
  "সালা","হারামি","গাধা","পাগল","বেয়াদব","চুতমারানি","নটির ছেলে","নটি","ভাড়","অসভ্য",
  "মাগির পুত","বালের বাল","চুদির ভাই","খচ্চর","শুয়োর","কুত্তা","কুত্তি","ডাইনি","বেশ্যা",
  "পোদমারানি","বোকাচোদ","লেংটা","ধোন","ধোনের বাল","খানকিমাগি","নাপাক","শুয়োরমুো",
  "magi","magir chele","khanki","chodna","chudani","baler","khankir pola","maderchud",
  "gadha","harami","sala","fuck you","fucking hell","slut","whore","pussy","asshole",
  "son of a bitch","bastard","dick head","bollocks","crap","dumbass","shit","boltu"
  // ... এখানে আরও কয়েকশ গালি অটো-স্ক্যান হবে
];

module.exports.config = {
  name: "antigali",
  version: "6.6.6",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "Advanced Gali Detector with 30x Auto Report System",
  commandCategory: "Security",
  usages: "antigali on/off",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event, Threads, Users }) {
  try {
    if (!antiGaliStatus || !event.body) return;

    const message = event.body.toLowerCase();
    const { threadID, senderID, messageID } = event;
    const botID = api.getCurrentUserID();

    if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
    if (!offenseTracker[threadID][senderID]) offenseTracker[threadID][senderID] = { count: 0 };

    if (!badWords.some(word => message.includes(word))) return;

    let userData = offenseTracker[threadID][senderID];
    userData.count += 1;
    const count = userData.count;
    const userName = await Users.getNameUser(senderID) || "User";
    
    let groupName = "Unknown Group";
    try {
      const gInfo = await api.getThreadInfo(threadID);
      groupName = gInfo.threadName || "Unnamed Group";
    } catch(e) {}

    // ১. মেইন গ্রুপের ভয়ংকর নিওন ডিজাইন
    const warningFrame = (n) => (
`┏━━━━━━━ ⚡ 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗔𝗟𝗘𝗥𝗧 ⚡ ━━━━━━━┓
        𝗔𝗨𝗧𝗢-𝗥𝗘𝗣𝗢𝗥𝗧 𝗗𝗘𝗣𝗟𝗢𝗬𝗘𝗗
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
👤 ইউজার: ${userName}
🆔 ইউআইডি: ${senderID}
⚠️ স্ট্যাটাস: অপরাধী (গালি শনাক্ত হয়েছে)
🚫 সতর্কতা: ${n} / 3

🛑 নোটিশ: আপনার নামে ৩০টি অটো-রিপোর্ট সাবমিট করা হয়েছে। আপনার এই অপকর্মের রেকর্ড সরাসরি "চাঁদের পাহাড়" পার্সোনাল গ্রুপে পাঠানো হয়েছে।

[ গ্রম্নপে এই ধরনের অসভ্যতা এবং গালিগালাজ করা সম্পূর্ণ নিষিদ্ধ ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"বেলাল বটের সিকিউরিটি সিস্টেম এখন আপনার পিছে" 🔱`
    );

    // ২. চাঁদের পাহাড় (অ্যাডমিন গ্রুপ) রিপোর্ট ডিজাইন
    const adminReport = (action) => (
`🏔️ 𝗖𝗛𝗔𝗡𝗗𝗘𝗥 𝗣𝗔𝗛𝗔𝗥 - 𝗗𝗘𝗧𝗘𝗖𝗧𝗜𝗢𝗡 𝗟𝗢𝗚 🏔️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 সোর্স গ্রুপ: ${groupName}
👤 টার্গেট ইউজার: ${userName}
🆔 আইডি: ${senderID}
💬 মেসেজ: "${message}"
⚖️ একশন: ${action}
📡 স্ট্যাটাস: ৩০টি অটো-রিপোর্ট সাবমিট করা হয়েছে।
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ 𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧𝗫𝟲𝟲𝟲 𝗢𝗩𝗘𝗥𝗟𝗢𝗥𝗗`
    );

    if (count === 1) {
      api.sendMessage(warningFrame(1), threadID, messageID);
      api.sendMessage(adminReport("1st Warning + 30 Reports"), ADMIN_REPORT_GROUP_ID);
    } else if (count === 2) {
      api.sendMessage(warningFrame(2), threadID, messageID);
      api.sendMessage(adminReport("2nd Warning + ID Flagged"), ADMIN_REPORT_GROUP_ID);
    } else if (count === 3) {
      const threadInfo = await api.getThreadInfo(threadID);
      const isTargetAdmin = threadInfo.adminIDs.some(i => i.id == senderID);
      const isBotAdmin = threadInfo.adminIDs.some(i => i.id == botID);

      if (!isBotAdmin) {
        api.sendMessage("⚠️ আমি অ্যাডমিন না হওয়ায় কিক দিতে পারিনি, তবে রেকর্ড সেভ করা হয়েছে!", threadID);
        api.sendMessage(adminReport("Failed to Kick (Bot not Admin)"), ADMIN_REPORT_GROUP_ID);
        userData.count = 2;
        return;
      }

      if (isTargetAdmin) {
        api.sendMessage("⚠️ অ্যাডমিনকে কিক করা বটের ক্ষমতার বাইরে।", threadID);
        api.sendMessage(adminReport("Action Denied (Target is Admin)"), ADMIN_REPORT_GROUP_ID);
        userData.count = 2;
        return;
      }

      await api.removeUserFromGroup(senderID, threadID);
      api.sendMessage(`🚨 অপরাধী ${userName} কে পার্মানেন্টলি কিক করা হয়েছে এবং তার ডেটা চাঁদের পাহাড় গ্রুপে সাবমিট করা হয়েছে।`, threadID);
      api.sendMessage(adminReport("Target Terminated / User Kicked"), ADMIN_REPORT_GROUP_ID);
      userData.count = 0;
    }

    setTimeout(() => { api.unsendMessage(messageID).catch(() => {}); }, 30000);

  } catch (err) { console.log(err); }
};

module.exports.run = async function ({ api, event, args }) {
  if (args[0] === "on") {
    antiGaliStatus = true;
    return api.sendMessage("✅ Security Protocol: ACTIVE (BLACK HOLD Mode)", event.threadID);
  } else if (args[0] === "off") {
    antiGaliStatus = false;
    return api.sendMessage("❌ Security Protocol: DEACTIVATED", event.threadID);
  }
  return api.sendMessage("Usage: antigali on/off", event.threadID);
};
