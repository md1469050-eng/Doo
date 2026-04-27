module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "10.0.0",
  credits: "Belal x Gemini",
  description: "ইউজার ডিটেইলস সহ ক্লিন এন্টি-আউট সিস্টেম"
};

module.exports.run = async ({ event, api, Threads, Users }) => {
  let data = (await Threads.getData(event.threadID)).data || {};
  
  if (data.antiout == false) return;
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const leftID = event.logMessageData.leftParticipantFbId;
  const name = await Users.getNameUser(leftID);
  const threadInfo = await api.getThreadInfo(event.threadID);
  const threadName = threadInfo.threadName || "Unknown Group";
  
  const adminGroupID = "26836635292647856"; 
  const ownerID = "61577502464880"; 
  const sig = "\n┈──╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬 ╾──┈";

  const emojiMax = ["🔱", "💎", "🛡️", "🛸", "🌀", "🛰️", "🦾", "🧿", "💫", "✨", "🌟", "🎇", "🔮", "⚙️", "📡", "💠", "🏆", "⚡", "⛓️", "🔒", "🚨", "🚫"];
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (event.author == leftID) {
    api.addUserToGroup(leftID, event.threadID, async (error) => {
      
      if (error) {
        // ❌ এড করতে ব্যর্থ হলে (বট ব্লকড)
        const failMsg = `╭━━━━━━━⊱ ${rand(emojiMax)} ⊰━━━━━━━╮
    💀 𝗘𝗦𝗖𝗔𝗣𝗘 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗗 💀
╰━━━━━━━⊱ ${rand(emojiMax)} ⊰━━━━━━━╯

👤 𝗡𝗮𝗺𝗲: ${name}
🆔 𝗨𝗜𝗗  : ${leftID}
🏘️ 𝗚𝗿𝗼𝘂𝗽: ${threadName}
❌ 𝗦𝘁𝗮𝘁𝘂𝘀: Failed (Bot Blocked)

⚠️ চাঁদের পাহাড় এর অনুমতি ছাড়া এখান থেকে বের হওয়া অসম্ভব। তবে তুই বটকে ব্লক করে পালানোর চেষ্টা করেছিস।

👑 𝗔𝗱𝗺𝗶𝗻: 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
${sig}`;
        
        api.sendMessage(failMsg, event.threadID);
        
        const alertReport = `🆘 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗔𝗟𝗘𝗥𝗧 🆘\n━━━━━━━━━━━━━━━━━━━━\n🏰 𝗚𝗿𝗼𝘂𝗽 : ${threadName}\n👤 𝗨𝘀𝗲𝗿  : ${name}\n🆔 𝗨𝗜𝗗   : ${leftID}\n❌ 𝗦𝘁𝗮𝘁𝘂𝘀 : পালানোর চেষ্টা (বট ব্লকড)\n━━━━━━━━━━━━━━━━━━━━${sig}`;
        
        api.sendMessage(alertReport, ownerID);
        api.sendMessage(alertReport, adminGroupID);

      } else {
        // ✅ সফলভাবে ফিরিয়ে আনলে
        const successMsg = `┏━━━━━━━  ${rand(emojiMax)}  ━━━━━━━┓
   ⛓️ 𝗥𝗘-𝗖𝗔𝗣𝗧𝗨𝗥𝗘𝗗 ⛓️
┗━━━━━━━  ${rand(emojiMax)}  ━━━━━━━┛

👤 𝗡𝗮𝗺𝗲: ${name}
🆔 𝗨𝗜𝗗  : ${leftID}
🏘️ 𝗚𝗿𝗼𝘂𝗽: ${threadName}
✅ 𝗦𝘁𝗮𝘁𝘂𝘀: Success (Re-Added)

অনুমতি ছাড়া পালানোর চেষ্টা করার জন্য তোকে আবার ঘাড় ধরে ফিরিয়ে আনা হলো। এখন চুপচাপ থাক! 👞💥

👑 𝗔𝗱𝗺𝗶𝗻: 𝗕𝗘𝗟𝗔𝗟 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
${sig}`;
        
        api.sendMessage(successMsg, event.threadID);
        
        const successReport = `📢 𝗔𝗡𝗧𝗜-𝗢𝗨𝗧 𝗔𝗟𝗘𝗥𝗧 ✅\n━━━━━━━━━━━━━━━━━━━━\n🏰 𝗚𝗿𝗼ুপ : ${threadName}\n👤 𝗨𝘀𝗲𝗿  : ${name}\n🆔 𝗨𝗜𝗗   : ${leftID}\n✅ 𝗦𝘁𝗮𝘁𝘂𝘀 : ঘাড় ধরে ফিরিয়ে আনা হয়েছে।\n━━━━━━━━━━━━━━━━━━━━${sig}`;
        
        api.sendMessage(successReport, ownerID);
        api.sendMessage(successReport, adminGroupID);
      }
    });
  }
};
