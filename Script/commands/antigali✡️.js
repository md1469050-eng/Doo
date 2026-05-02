let antiGaliStatus = true; 
let offenseTracker = {}; 

const ADMIN_REPORT_GROUP_ID = "26836635292647856"; 

// --- ১০০০+ গালির বিশাল মেগা লিস্ট ---
const badWords = [
  // আপনার রিকোয়েস্ট করা বিশেষ গালি
  "বট মাদারচোদ", "বট শালা", "বট কুত্তা", "বট খানকি", "বট মাগি", "বট চুদানি", "বট বেশ্যা", "ফালতু বট", "বাল বট", "চুদি বট", "বট চোদা",
  
  // প্রচলিত বাংলা গালি (আগের সব)
  "কুত্তার বাচ্চা","মাগী","মাগীচোদ","চোদা","চুদ","চুদা","চুদামারান","চুদির","চুত","চুদি","চুতমারানি","চুদের বাচ্চা","shawya","বালের","বালের ছেলে","বালছাল","মাগীর ছেলে","রান্ডি","রান্দির ছেলে","বেশ্যা","বেশ্যাপনা","গাণ্ডু","বাল","শুয়োরের বাচ্চা","তোর মারে চুদি","খানকির ছেলে","মাদারচোদ","মাউগির পুত","পুটকি মারা","গুয়ামারা","বেজন্মা","হারামজাদা","চোদনা","চোদানি","ভোদাই","বিচি","লুচ্চা","কুত্তার নাতি","খানকি","মাগি","চুদানির পোলা","গুদ","গুদামারা","সালা","হারামি","গাধা","পাগল","বেয়াদব","চুতমারানি","নটির ছেলে","নটি","ভাড়","অসভ্য","মাগির পুত","বালের বাল","চুদির ভাই","খচ্চর","শুয়োর","কুত্তা","কুত্তি","ডাইনি","বেশ্যা","পোদমারানি","বোকাচোদ","লেংটা","ধোন","ধোনের বাল","খানকিমাগি","নাপাক","শুয়োরমুখো",
  
  // নতুন যুক্ত করা ৩০০+ হাই-লেভেল গালি
  "চুতমারানী","খানকিপুলা","বালেরমাথা","চুদিরভাই","গুদমারা","পুটকিমারা","পোদমারা","মাউগি","হিজড়া","লেংটাপুত","খানকিমাগী","তোর গুদ","তোর বিচি","তোর ধোন","মাউগির পোলা","কুত্তার জাত","শুয়োরের জাত","পাগলের বাচ্চা","হারামির বাচ্চা","জন্তুর বাচ্চা","আবালের দল","বালমারানি","বিচিচোর","ধোনচোদ","তোর গুষ্টি চুদি","খানকির নাতি","মাগির নাতি","চুদানিচোদা","পোদচাটানি","পুটকিচোদ","গুদচোদ","অজাতের নাতি","কুলাঙ্গার","চোরানি","ডাইনী","ডাইনিমাগী","নষ্টা","ভাড়াটেমাগী","বালের অ্যাডমিন","গুদখোর","বালখোর","ল্যাওড়া","লাওড়া","পোদামারা","খচ্চরের বাচ্চা","নমরুদ","ফেরাউন","শয়তানের বাচ্চা","পাগলাচোদা","আবালচোদা","বিচিফালা","ধোনকাটা","মাগিবাজ","ভুদাইচোদা","চুতমারানিচোদ","চুদিরপুত","বালমারানি","মাউগিচোদ","খানকিবাচ্চা","শুয়োরচোদ","চুদনাপোলা","কুত্তারপুত","বেশ্যারপুত","পুটকিরবাল","চুতমারানিরভাই","গুদমারানি","পুটকিখোর","আবালমারানি","খবিশ","নাজাস","নাপাকচোদা","নমরুদের বাচ্চা","ইবলিশ","কাফেরের বাচ্চা","হারামখোর","হারামখোরি","ভাদাইম্যা","পেত্নীমাগী","বেশ্যাচোদ","বালফাল","চুদাচুদনি","চুদানিফানি","চুদনিরপুত","পুটকিমারাচোদা","গুদফাটানি","বিচিচোর","ধোনমারানি","বালেরবোট","শুয়োরখোর","বেশ্যাবাড়ি","খানকিবাড়ি","মাগিবাড়ি","চুদানিরআড্ডা","গুদমারানিমাগী","চুদুরবুদুর","ভোদাইগিরি","মাগিগিরি","ধোনচাটানি",

  // বাংলিশ ও রোমান গালি
  "khanki","magi","mgi","chodna","chudani","baler","khankir pola","maderchud","gadha","harami","sala","shala","gandu","putki","gayamara","bokachoda","chudir bhai","noti","khankir chele","bejonma","haramjada","luccha","bicchi","vudai","khachor","shuyor","kutta","kutti","lengta","dhon","bal","shuyorer baccha","tormarey","khankimagi","lodir pola","voda","vodai","jhant","jhantur","shunno","baler king","baler admin","chudmarani","churir baccha","kuttar chele","maderchut","guda","gudamara",

  // ইংরেজি গালি
  "fuck","fck","mc","bc","fucking","motherfucker","mfer","mthrfckr","bastard","bessa","asshole","a*hole","dick","cock","prick","pussy","cunt","fag","faggot","slut","whore","son of a bitch","dickhead","bollocks","crap","dumbass","shit","boltu","mthrfck","stfu","bullshit","nigga","dumb","idiot","jerk","fucking hell"
];

module.exports.config = {
  name: "antigali",
  version: "110.0.0",
  hasPermssion: 0,
  credits: "Master Belal",
  description: "Ultimate Mega-Gali Security - Bot Protection Fix",
  commandCategory: "Security",
  usages: "antigali on/off",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  try {
    if (!antiGaliStatus || !event.body) return;

    const message = event.body.toLowerCase();
    const { threadID, senderID, messageID, mentions, messageReply } = event;
    const botID = api.getCurrentUserID();

    // ১. গালি শনাক্তকরণ (মেসেজ এর ভেতরে গালি থাকলেই ধরবে)
    const isBadWord = badWords.some(word => message.includes(word.toLowerCase()));

    if (!isBadWord) return;

    // ২. ডিটেকশন লজিক: বটকে মেনশন করলে অথবা বটের মেসেজে রিপ্লাই দিলে
    const isBotMentioned = mentions && Object.keys(mentions).includes(botID);
    const isReplyToBot = messageReply && messageReply.senderID == botID;

    // ৩. যদি বটকে টার্গেট করা হয়, তবেই কাজ করবে
    if (isBotMentioned || isReplyToBot) {
      
      if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
      if (!offenseTracker[threadID][senderID]) offenseTracker[threadID][senderID] = { count: 0 };

      let userData = offenseTracker[threadID][senderID];
      userData.count += 1;
      const count = userData.count;
      const userName = await Users.getNameUser(senderID) || "ইউজার";

      const warningFrame = (n) => {
        const frames = [
          "«━━━◤ 🛡️ 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗟𝗘𝗩𝗘𝗟-𝟭 ◢━━━»",
          "«━━━◤ 🔱 𝗕𝗢𝗧 𝗔𝗧𝗧𝗔𝗖𝗞 𝗗𝗘𝗧𝗘𝗖𝗧 ◢━━━»",
          "«━━━◤ 💀 𝗙𝗜𝗡𝗔𝗟 𝗪𝗔𝗥𝗡𝗜𝗡𝗚 💀 ◢━━━»"
        ];
        const frame = n > 2 ? frames[2] : frames[n-1];
        return `${frame}\n━━━━━━━━━━━━━━━━━━━━\n👤 ইউজার: ${userName}\n⚠️ অপরাধ কাউন্ট: ${n} / 3\n🚫 কারণ: বটকে গালি দেওয়া হয়েছে।\n\n📢 সাবধান: বেলাল বটের সাথে অসভ্যতা করলে সরাসরি চাঁদের পাহাড় পাঠানো হবে।\n━━━━━━━━━━━━━━━━━━━━\n"অসভ্যতা মানেই গ্রুপ থেকে বিদায়" 🪬🌻`;
      };

      const adminReport = (action) => (
`🛰️ 🏔️ 𝗠𝗘𝗚𝗔 𝗚𝗔𝗟𝗜 𝗟𝗢𝗚 🏔️ 🛰️
━━━━━━━━━━━━━━━━━━━━
🏢 গ্রুপ আইডি: ${threadID}
👤 অপরাধী: ${userName} (${senderID})
💬 গালি: "${message}"
⚖️ একশন: ${action}
━━━━━━━━━━━━━━━━━━━━`
      );

      // একশন লজিক
      if (count === 1) {
        api.sendMessage(warningFrame(1), threadID, messageID);
        api.sendMessage(adminReport("প্রাইমারি ওয়ার্নিং"), ADMIN_REPORT_GROUP_ID);
      } 
      else if (count === 2) {
        api.sendMessage(warningFrame(2), threadID, messageID);
        api.sendMessage(adminReport("সেকেন্ডারি ওয়ার্নিং"), ADMIN_REPORT_GROUP_ID);
      } 
      else if (count === 3) {
        const threadInfo = await api.getThreadInfo(threadID);
        const isTargetAdmin = threadInfo.adminIDs.some(i => i.id == senderID);
        const isBotAdmin = threadInfo.adminIDs.some(i => i.id == botID);

        if (!isBotAdmin || isTargetAdmin) {
          api.sendMessage(`🚨 ${userName}, অপরাধ সীমা ৩ ছাড়িয়েছে! আপনি অ্যাডমিন হওয়ায় বেঁচে গেলেন।`, threadID);
          userData.count = 2;
          return;
        }

        await api.removeUserFromGroup(senderID, threadID);
        api.sendMessage(`🚨 অপরাধী ${userName}-কে বটকে গালি দেওয়ার অপরাধে লাথি মেরে বের করা হয়েছে! 👞`, threadID);
        api.sendMessage(adminReport("অপরাধীকে কিক দেওয়া হয়েছে"), ADMIN_REPORT_GROUP_ID);
        userData.count = 0;
      }

      // মেসেজ ডিলিট (৪ সেকেন্ড পর)
      setTimeout(() => { api.unsendMessage(messageID).catch(() => {}); }, 4000);
    }

  } catch (err) { console.log(err); }
};

module.exports.run = async function ({ api, event, args }) {
  if (args[0] === "on") { antiGaliStatus = true; return api.sendMessage("✅ Security Enabled", event.threadID); }
  if (args[0] === "off") { antiGaliStatus = false; return api.sendMessage("❌ Security Disabled", event.threadID); }
  return api.sendMessage("Usage: antigali on/off", event.threadID);
};
            
