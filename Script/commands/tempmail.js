const axios = require('axios');

module.exports = {
  config: {
    name: "tempmail",
    aliases: ["tm", "mail"],
    version: "4.5.0",
    author: "BELAL ⊶ BOTX666 🪬",
    countDown: 5,
    role: 0,
    shortDescription: { en: "টোকেন-ফ্রি টেম্প মেইল এবং ইনবক্স ভিউয়ার" },
    category: "tools",
    guide: { en: "{pn} অথবা {pn} inbox <email>" }
  },

  onStart: async function ({ api, event, args }) {
    const API = "https://api.mail.tm";
    const { threadID, messageID } = event;
    const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

    try {
      // --------- ইনবক্স চেক করার পার্ট ---------
      if (args[0] && args[0].toLowerCase() === "inbox") {
        const email = args[1];
        if (!email) return api.sendMessage(`❌ চাঁদের পাহাড়, ইমেইল এড্রেসটি দিন।\n${sig}`, threadID, messageID);

        // পাসওয়ার্ড জেনারেশন লজিক (ইমেইলের প্রথম অংশই পাসওয়ার্ড হিসেবে ব্যবহৃত হয়)
        const password = email.split('@')[0] + "123";

        // টোকেন সংগ্রহ
        const tokenRes = await axios.post(`${API}/token`, { address: email, password });
        const token = tokenRes.data.token;

        // মেসেজ সংগ্রহ
        const inbox = await axios.get(`${API}/messages?page=1`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const messages = inbox.data["hydra:member"];
        if (!messages || messages.length === 0) {
          return api.sendMessage(`📭 চাঁদের পাহাড়, ইনবক্সে কোনো মেসেজ নেই!`, threadID, messageID);
        }

        let out = `╭━━━━━━⊱📬⊰━━━━━━╮\n   𝐈𝐍𝐁𝐎𝐗 𝐌𝐄𝐒𝐒𝐀𝐆𝐄𝐒\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n`;
        messages.slice(0, 5).forEach((msg, i) => {
          out += `📩 [${i + 1}] 𝐅𝐫𝐨𝐦: ${msg.from.address}\n`;
          out += `📌 𝐒𝐮𝐛𝐣𝐞𝐜𝐭: ${msg.subject || "No Subject"}\n`;
          out += `✉️ 𝐂𝐨𝐧𝐭𝐞𝐧𝐭: ${(msg.intro || "No preview").replace(/<[^>]+>/g, "")}\n`;
          out += `──────────────────\n`;
        });
        out += `\n𖤍 𝐀𝐝𝐦𝐢𝐧: MD BELAL\n🏠 𝐇𝐨𝐦𝐞: KURIGRAM, BD${sig}`;

        return api.sendMessage(out, threadID, messageID);
      }

      // --------- নতুন ইমেইল জেনারেট করার পার্ট ---------
      else {
        const domainRes = await axios.get(`${API}/domains`);
        const domain = domainRes.data["hydra:member"][0].domain;

        const randomName = Math.random().toString(36).substring(2, 10);
        const email = `${randomName}@${domain}`;
        const password = randomName + "123";

        // অ্যাকাউন্ট ক্রিয়েট
        await axios.post(`${API}/accounts`, { address: email, password });

        const resultBody = `╭━━━━━━⊱📩⊰━━━━━━╮\n   𝐓𝐄𝐌𝐏 𝐌𝐀𝐈𝐋 𝐆𝐄𝐍\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n` +
          `📧 𝐄𝐦𝐚𝐢𝐥: ${email}\n` +
          `🔑 𝐏𝐚𝐬𝐬𝐰𝐨𝐫𝐝: ${password}\n\n` +
          `📥 𝐈𝐧𝐛𝐨𝐱 𝐂𝐡𝐞𝐜𝐤:\n.tm inbox ${email}\n\n` +
          `𖤍 𝐀𝐝𝐦𝐢𝐧: MD BELAL (BS Dealer)\n` +
          `🏠 𝐇𝐨𝐦𝐞: KURIGRAM, BD${sig}`;

        return api.sendMessage(resultBody, threadID, messageID);
      }
    } catch (err) {
      console.log(err);
      return api.sendMessage("❌ চাঁদের পাহাড়, টেম্প মেইল সার্ভারে সমস্যা হচ্ছে। আবার চেষ্টা করুন।", threadID, messageID);
    }
  },
};
