const axios = require("axios");
const qs = require("qs");

// ⛔ আপনার দেওয়া Pastebin API Key
const PASTEBIN_DEV_KEY = "03gWQYd8t0cpr3MW-1_mh8L39uLHarGJ";

module.exports.config = {
  name: "paste",
  version: "3.0.0",
  hasPermssion: 2, // শুধুমাত্র বট অ্যাডমিন              
  credits: "Belal x Gemini",
  description: "বড় টেক্সট বা ফাইলকে Pastebin-এ আপলোড করে লিঙ্ক তৈরি করা",
  commandCategory: "Admin",
  usages: "[text | reply to file/msg]",
  cooldowns: 5
};

// Pastebin-এ ডাটা পাঠানোর মেইন ফাংশন
async function uploadToPastebin(content, title = "Mirai Bot Log") {
  const payload = {
    api_dev_key: PASTEBIN_DEV_KEY,
    api_option: "paste",
    api_paste_code: content,
    api_paste_private: "1", // Unlisted (লিঙ্ক ছাড়া কেউ দেখবে না)
    api_paste_name: title,
    api_paste_expire_date: "N" // কখনোই ডিলিট হবে না
  };

  const res = await axios.post(
    "https://pastebin.com/api/api_post.php",
    qs.stringify(payload),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 15000 }
  );

  const url = (res.data || "").toString().trim();
  if (!url.startsWith("http")) throw new Error(res.data); 
  const id = url.split("/").pop();
  return { url, raw: `https://pastebin.com/raw/${id}` };
}

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID, messageReply } = event;

  // অ্যাডমিন চেক (ডাবল সিকিউরিটি)
  const admins = global.config.ADMINBOT || [];
  if (!admins.includes(senderID)) {
    return api.sendMessage("⛔ বসের অনুমতি ছাড়া এই কমান্ড ব্যবহার করা নিষেধ!", threadID, messageID);
  }

  let content = "";

  try {
    // ১. টেক্সট মেসেজে রিপ্লাই করলে
    if (messageReply && messageReply.body) {
      content = messageReply.body;
    } 
    // ২. কোনো ফাইলে (txt, js, json) রিপ্লাই করলে
    else if (messageReply && messageReply.attachments?.length > 0) {
      const att = messageReply.attachments[0];
      if (att.url) {
        const fileData = await axios.get(att.url, { responseType: "text" });
        content = fileData.data;
      }
    } 
    // ৩. সরাসরি লিখে দিলে
    else if (args.length > 0) {
      content = args.join(" ");
    }

    if (!content) {
      return api.sendMessage("⚠️ আপনি কিছুই দেননি! কোনো লেখায় রিপ্লাই দিন বা কিছু লিখে দিন।", threadID, messageID);
    }

    api.setMessageReaction("⌛", messageID, () => {}, true);

    const title = `Log_By_${senderID}_TID_${threadID}`;
    const result = await uploadToPastebin(content, title);

    api.setMessageReaction("✅", messageID, () => {}, true);

    const report = 
      `📝 𝐏𝐀𝐒𝐓𝐄𝐁𝐈𝐍 𝐔𝐏𝐋𝐎𝐀𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🔗 𝐕𝐢𝐞𝐰 𝐋𝐢𝐧𝐤: ${result.url}\n` +
      `📄 𝐑𝐚𝐰 𝐋𝐢ն𝐤: ${result.raw}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💡 টিপস: র কোড দেখতে চাইলে Raw লিঙ্কটি ব্যবহার করুন।`;

    return api.sendMessage(report, threadID, messageID);

  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(`🚨 পেস্ট করতে সমস্যা হয়েছে: ${err.message}`, threadID, messageID);
  }
};
