const fs = require("fs");
const moment = require("moment-timezone");

module.exports.config = {
  name: "adminUpdate",
  eventType: ["log:thread-admins", "log:thread-name", "log:user-nickname", "log:thread-icon", "log:thread-call", "log:thread-color"],
  version: "6.0.0",
  credits: "Belal x Gemini",
  description: "গ্রুপের যাবতীয় আপডেট ওনারের ইনবক্সে পাঠানো ও রাজকীয় নোটিফিকেশন",
  envConfig: {
    sendNoti: true,
  }
};

module.exports.run = async function ({ event, api, Threads, Users }) {
  const { threadID, logMessageType, logMessageData } = event;
  const { setData, getData } = Threads;

  // 👑 আপনার নতুন ওনার ডিটেইলস
  const ownerID = "61577502464880"; 
  const myFB = "https://www.facebook.com/profile.php?id=61577502464880";
  const sig = "\n┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬 ╾───┈";

  try {
    let dataThread = (await getData(threadID)).threadInfo || {};
    const threadName = dataThread.threadName || "Unknown Group";
    let reportMsg = ""; 

    const header = "╭┈──────────── 💠 ────────────┈╮";
    const footer = "╰┈──────────── ⚡ ────────────┈╯";

    switch (logMessageType) {
      case "log:thread-admins": {
        const targetName = await Users.getNameUser(logMessageData.TARGET_ID);
        if (logMessageData.ADMIN_EVENT == "add_admin") {
          reportMsg = `👑 [ ${targetName} ] এখন নতুন অ্যাডমিন!`;
          api.sendMessage(`${header}\n      ✨ 𝗔𝗗𝗠𝗜𝗡 𝗣𝗢𝗪𝗘𝗥 𝗨𝗣: ${targetName} ✨\n${footer}\n\n👑 অভিনন্দন! আজ থেকে তোর কপালে রাজতিলক পরানো হলো। তুই এখন চাঁদের পাহাড়ের অফিসিয়াল VIP অ্যাডমিন। এখন থেকে গ্রুপের জন্য জান দিয়ে কাম করবি, মোড়লি দেখাইলে কিন্তু খবর আছে! 😎🎩${sig}`, threadID);
        } else if (logMessageData.ADMIN_EVENT == "remove_admin") {
          reportMsg = `👞 [ ${targetName} ]-কে অ্যাডমিন থেকে লাথি মারা হয়েছে।`;
          api.sendMessage(`${header}\n      🔥 𝗔𝗗𝗠𝗜𝗡 𝗗𝗘𝗧𝗛𝗥𝗢𝗡𝗘𝗗 🔥\n${footer}\n\n⚠️ কিরে [ ${targetName} ]! অ্যাডমিন গিরি করার খুব শখ ছিল না? 😂 বেশি ভাব নেওয়ার কারণে তোকে রাজপ্রাসাদ থেকে ডাইরেক্ট লাথি মেরে নর্দমায় ফেলে দেওয়া হলো! এখন সাধারণ পাবলিকের পেছনে গিয়ে লাইনে দাঁড়া! 👞💥${sig}`, threadID);
        }
        break;
      }

      case "log:thread-call": {
        if (logMessageData.event === "group_call_started") {
          const name = await Users.getNameUser(logMessageData.caller_id);
          reportMsg = `📞 ${name} একটি কল শুরু করেছেন।`;
          api.sendMessage(`🤙 𝗜𝗡𝗖𝗢𝗠𝗜𝗡𝗚 𝗖𝗔𝗟𝗟 🤙\n━━━━━━━━━━━━━━━━━\n👤 ${name} কল দিয়ে আড্ডা জমাতে চাচ্ছে! জলদি সবাই জয়েন করুন! ⚡${sig}`, threadID);
        } else if (logMessageData.event === "group_call_ended") {
          const duration = logMessageData.call_duration;
          const h = Math.floor(duration / 3600);
          const m = Math.floor((duration % 3600) / 60);
          const s = duration % 60;
          reportMsg = `📵 কল শেষ হয়েছে। সময়কাল: ${h}h ${m}m ${s}s`;
          api.sendMessage(`📵 𝗖𝗔𝗟𝗟 𝗧𝗘𝗥𝗠𝗜𝗡𝗔𝗧𝗘𝗗 📵\n━━━━━━━━━━━━━━━━━\n⌛ আড্ডাবাজি শেষ! মোট সময়: ${h}h ${m}m ${s}s${sig}`, threadID);
        }
        break;
      }

      case "log:thread-icon": {
        reportMsg = `💠 গ্রুপের আইকন পরিবর্তন করা হয়েছে।`;
        api.sendMessage(`💠 𝗜𝗖𝗢𝗡 𝗨𝗣𝗗𝗔𝗧𝗘𝗗 💠\n━━━━━━━━━━━━━━━━━\n✨ গ্রুপের নতুন রূপ সেট করা হয়েছে!${sig}`, threadID);
        break;
      }

      case "log:thread-name": {
        const newName = logMessageData.name || "No Name";
        reportMsg = `🏰 গ্রুপের নাম রাখা হয়েছে: ${newName}`;
        api.sendMessage(`🏰 𝗚𝗥𝗢𝗨𝗣 𝗥𝗘𝗡𝗔𝗠𝗘𝗗 🏰\n━━━━━━━━━━━━━━━━━\n✅ নতুন পরিচয়: ${newName}${sig}`, threadID);
        break;
      }

      case "log:user-nickname": {
        const name = await Users.getNameUser(logMessageData.participant_id);
        const nick = logMessageData.nickname || "Original Name";
        reportMsg = `🏷️ ${name}-এর নিকনেম '${nick}' করা হয়েছে।`;
        api.sendMessage(`🏷️ 𝗡𝗔𝗠𝗘 𝗨𝗣𝗗𝗔𝗧𝗘 🏷️\n━━━━━━━━━━━━━━━━━\n👤 ${name}-এর নতুন নাম: ${nick}${sig}`, threadID);
        break;
      }

      case "log:thread-color": {
        reportMsg = `🎨 গ্রুপের থিম পরিবর্তন করা হয়েছে।`;
        api.sendMessage(`🎨 𝗧𝗛𝗘𝗠𝗘 𝗖𝗛𝗔𝗡𝗚𝗘𝗗 🎨\n━━━━━━━━━━━━━━━━━\n🌈 গ্রুপের রূপ এখন আরও লাক্সারি!${sig}`, threadID);
        break;
      }
    }

    // 🚀 সরাসরি আপনার ইনবক্সে রিপোর্ট পাঠানো
    if (reportMsg != "") {
      const inboxMsg = `╭┈─────── 🔔 𝗥𝗢𝗬𝗔𝗟 𝗔𝗟𝗘𝗥𝗧 ───────┈╮
       𝗦𝘆𝘀𝘁𝗲𝗺 𝗨𝗽𝗱𝗮𝘁𝗲 𝗗𝗲𝘁𝗲𝗰𝘁𝗲𝗱!
╰┈────────────────────────────┈╯

🏰 𝗚𝗿𝗼𝘂𝗽 : ${threadName}
📝 𝗨𝗽𝗱𝗮𝘁𝗲 : ${reportMsg}
⏰ 𝗧𝗶𝗺𝗲   : ${moment().tz("Asia/Dhaka").format("hh:mm A")}

┈─────── 💠 𝗢𝘄𝗻𝗲𝗿 𝗜𝗻𝗳𝗼 ───────┈
👑 Admin : 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
🌐 FB ID : ${myFB}

মাস্টার, আপনার অবগতির জন্য রিপোর্ট পাঠানো হলো। ✅`;
      
      api.sendMessage(inboxMsg, ownerID);
    }

  } catch (e) { console.log(e) }
};
