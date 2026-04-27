module.exports = {
  config: {
    name: "supportgc",
    aliases: ["supportbox", "sgc", "helpgroup"],
    version: "2.0.0",
    author: "BELAL ⊶ BOTX666 🪬",
    countDown: 10,
    role: 0,
    shortDescription: { en: "সাপোর্ট গ্রুপে যুক্ত হন" },
    longDescription: { en: "এই কমান্ডটি ব্যবহারকারীকে সরাসরি অ্যাডমিন সাপোর্ট গ্রুপে যুক্ত করে এবং অ্যাডমিনকে অ্যালার্ট পাঠায়।" },
    category: "support",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const supportGroupId = "2253018758534493"; // আপনার সাপোর্ট গ্রুপ আইডি
    const adminUID = "100078049308655"; // আপনার পার্সোনাল UID
    const { threadID, senderID, messageID } = event;
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

    try {
      // ইউজারের তথ্য সংগ্রহ
      const userInfo = await api.getUserInfo(senderID);
      const userName = userInfo[senderID].name;

      // ইউজার অলরেডি গ্রুপে আছে কি না চেক করা
      const threadInfo = await api.getThreadInfo(supportGroupId);
      const isMember = threadInfo.participantIDs.includes(senderID);

      if (isMember) {
        return api.sendMessage(
          `╭━━━━━━⊱⚠️⊰━━━━━━╮\n   𝐀𝐋𝐑𝐄𝐀𝐃𝐘 𝐌𝐄𝐌𝐁𝐄𝐑\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n📌 চাঁদের পাহাড়, ${userName} আপনি ইতিপূর্বেই আমাদের সাপোর্ট গ্রুপে যুক্ত আছেন।\n📩 দয়া করে আপনার মেসেজ রিকোয়েস্ট বা স্প্যাম বক্স চেক করুন।${sig}`,
          threadID, messageID
        );
      }

      // ইউজারকে গ্রুপে অ্যাড করা
      api.addUserToGroup(senderID, supportGroupId, (err) => {
        if (err) {
          return api.sendMessage(
            `╭━━━━━━⊱❌⊰━━━━━━╮\n   𝐀𝐃𝐃𝐈𝐍𝐆 𝐅𝐀𝐈𝐋𝐄𝐃\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n⚠️ চাঁদের পাহাড়, ${userName} কে গ্রুপে অ্যাড করা সম্ভব হয়নি।\n❗ সম্ভবত ইউজারের সেটিংস থেকে 'Add to group' অপশন বন্ধ করা আছে।${sig}`,
            threadID, messageID
          );
        } else {
          // সাকসেস মেসেজ (কমান্ড গ্রুপে)
          api.sendMessage(
            `╭━━━━━━⊱✅⊰━━━━━━╮\n   𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐀𝐃𝐃𝐄𝐃\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n🌟 চাঁদের পাহাড়, ${userName} কে সফলভাবে সাপোর্ট গ্রুপে যুক্ত করা হয়েছে।${sig}`,
            threadID, messageID
          );

          const alertMsg = `╭━━━━━━⊱🔔⊰━━━━━━╮\n   𝐍𝐄𝐖 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 𝐉𝐎𝐈𝐍\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n👤 𝐍𝐚𝐦𝐞: ${userName}\n🆔 𝐔𝐈𝐃: ${senderID}\n✅ এই ইউজারটি সাপোর্ট গ্রুপে যুক্ত হয়েছে।\n\n𖤍 𝐀𝐝𝐦𝐢𝐧: MD BELAL (BS Dealer)\n🏠 𝐇𝐨𝐦𝐞: KURIGRAM, BD`;

          // সাপোর্ট গ্রুপে নোটিফিকেশন পাঠানো
          api.sendMessage(alertMsg, supportGroupId);

          // আপনার ইনবক্সে নোটিফিকেশন পাঠানো
          api.sendMessage(alertMsg, adminUID);
        }
      });

    } catch (e) {
      console.error(e);
      api.sendMessage("❌ চাঁদের পাহাড়, সিস্টেম এরর! দয়া করে পরে চেষ্টা করুন।", threadID);
    }
  },
};
