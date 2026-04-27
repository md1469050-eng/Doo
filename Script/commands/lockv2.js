const lockedThreads = {};
const pageID = "61573366160918"; // আপনার পেজ আইডি

module.exports = {
  config: {
    name: "lockv2",
    aliases: ["group_lock", "block_chat"],
    version: "4.0.0",
    author: "Belal YT",
    countDown: 5,
    role: 1, // শুধুমাত্র গ্রুপ এডমিন ও বট এডমিন
    shortDescription: "গ্রুপ লক বা আনলক করুন",
    longDescription: "গ্রুপ লক করে সাধারণ মেম্বারদের মেসেজ দেওয়া বন্ধ করুন। শুধুমাত্র এডমিনরা মেসেজ দিতে পারবে।",
    category: "box chat"
  },

  // ===================== কমান্ড হ্যান্ডলার =====================
  onStart: async function({ api, event, args }) {
    const { threadID, senderID, messageID } = event;
    const sig = "\n┈───╼ ┄┉❈✡️ Chander Pahar ✿⃝🪬 ╾───┈";

    try {
      // ১. থ্রেড ইনফো ও এডমিন চেক
      const info = await api.getThreadInfo(threadID);
      const adminIDs = info.adminIDs.map(i => i.id);

      if (!adminIDs.includes(senderID)) {
        return api.sendMessage("⚠️ দুঃখিত বস! এই কমান্ডটি ব্যবহার করার ক্ষমতা শুধু গ্রুপ এডমিনদের আছে।", threadID, messageID);
      }

      const action = args[0]?.toLowerCase();

      // 🔒 LOCK ON
      if (action === "on" || action === "lock") {
        if (lockedThreads[threadID]) {
          return api.sendMessage("✅ বস, গ্রুপটি অলরেডি **চাঁদের পাহাড়** গার্ডে লক করা আছে!", threadID, messageID);
        }

        try {
          await api.addUserToGroup(pageID, threadID);
        } catch (e) {}

        lockedThreads[threadID] = true;
        api.setMessageReaction("🔒", messageID, () => {}, true);
        
        const lockMsg = `╭━━━━━━━⊱ 🔒 ⊰━━━━━━━╮\n   ✨ 𝗚𝗥𝗢𝗨𝗣 𝗟𝗢𝗖𝗞𝗘𝗗 ✨\n╰━━━━━━━⊱ 🔒 ⊰━━━━━━━╯\n\n` +
          `🔒 গ্রুপটি এখন লক করা হলো!\n` +
          `🚫 এডমিন ছাড়া কেউ মেসেজ দিতে পারবে না।\n\n` +
          `🏔️ 𝗕𝗿𝗮𝗻𝗱 : চাঁদের পাহাড়\n` +
          `👑 𝗔𝗱𝗺𝗶𝗻 : BELAL YT${sig}`;
        
        return api.sendMessage(lockMsg, threadID);
      }

      // 🔓 LOCK OFF
      if (action === "off" || action === "unlock") {
        if (!lockedThreads[threadID]) {
          return api.sendMessage("✅ বস, গ্রুপটি তো আনলকই আছে!", threadID, messageID);
        }

        delete lockedThreads[threadID];

        try {
          await api.removeUserFromGroup(pageID, threadID);
        } catch (e) {}

        api.setMessageReaction("🔓", messageID, () => {}, true);

        const unlockMsg = `╭━━━━━━━⊱ 🔓 ⊰━━━━━━━╮\n   ✨ 𝗚𝗥𝗢𝗨𝗣 𝗢𝗣𝗘𝗡𝗘𝗗 ✨\n╰━━━━━━━⊱ 🔓 ⊰━━━━━━━╯\n\n` +
          `🔓 গ্রুপটি আনলক করা হয়েছে!\n` +
          `✅ এখন সবাই মেসেজ দিতে পারবে।\n\n` +
          `🏔️ 𝗕𝗿𝗮𝗻𝗱 : চাঁদের পাহাড়\n` +
          `👑 𝗔𝗱𝗺𝗶𝗻 : BELAL YT${sig}`;

        return api.sendMessage(unlockMsg, threadID);
      }

      // ভুল ইনপুট দিলে সাহায্য
      return api.sendMessage("📝 ব্যবহারের নিয়ম:\n1. /lock on (গ্রুপ লক করতে)\n2. /lock off (গ্রুপ খুলতে)", threadID, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ কমান্ডটি কার্যকর করতে সমস্যা হয়েছে। নিশ্চিত করুন বট গ্রুপ এডমিন কিনা।", threadID, messageID);
    }
  },

  // ===================== ইভেন্ট হ্যান্ডলার (মেসেজ ডিলিট সিস্টেম) =====================
  handleEvent: async function({ api, event }) {
    const { threadID, senderID, messageID, body } = event;

    // যদি গ্রুপ লক না থাকে অথবা কোনো মেসেজ বডি না থাকে
    if (!lockedThreads[threadID] || !body) return;

    try {
      const info = await api.getThreadInfo(threadID);
      const adminIDs = info.adminIDs.map(i => i.id);

      // এডমিনদের মেসেজ ডিলিট হবে না
      if (adminIDs.includes(senderID)) return;

      // সাধারণ কেউ মেসেজ দিলে সেটি ডিলিট করে দেওয়া হবে
      await api.unsendMessage(messageID);
      
    } catch (e) {
      // মেসেজ ডিলিট করতে না পারলে (হয়তো বট এডমিন না)
      console.error("Lock Error:", e.message);
    }
  }
};
