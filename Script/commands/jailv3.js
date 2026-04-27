const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function baseApiUrl() {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return res.data.mahmud;
  } catch (e) {
    return "https://api.vhtear.com"; // Backup API
  }
}

module.exports.config = {
  name: "jailv3",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "MahMUD x Belal",
  description: "সবচেয়ে উন্নত জেল ইফেক্ট (Auto Target & Multi-Reply)",
  commandCategory: "🤣Funny🤣",
  usages: "[@mention/reply/UID/name]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;
  const cachePath = path.join(__dirname, "cache");
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

  let targetID;

  try {
    // ১. অ্যাডভান্সড টার্গেট ডিটেকশন
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (args.length > 0) {
      if (!isNaN(args[0]) && args[0].length > 10) {
        targetID = args[0];
      } else {
        const nameInput = args.join(" ").toLowerCase();
        const threadInfo = await api.getThreadInfo(threadID);
        const user = threadInfo.userInfo.find(u => u.name && u.name.toLowerCase().includes(nameInput));
        targetID = user ? user.id : null;
      }
    } else {
      targetID = senderID; // কাউকে না দিলে নিজেকে জেলে ভরবে
    }

    if (!targetID) return api.sendMessage("❌ বেলাল ভাই, এই নামে তো কাউকে খুঁজে পাচ্ছি না! 🧐", threadID, messageID);

    const waitMsg = await api.sendMessage("👮‍♂️ জেল পুলিশ আসছে... শিকল রেডি করা হচ্ছে...⛓️", threadID);

    // ২. এপিআই ইন্টিগ্রেশন
    const apiUrl = await baseApiUrl();
    const filePath = path.join(cachePath, `jailv3_${targetID}.png`);
    
    const response = await axios.get(`${apiUrl}/api/dig?type=jail&user=${targetID}`, {
      responseType: "arraybuffer"
    });

    fs.writeFileSync(filePath, response.data);
    await api.unsendMessage(waitMsg.messageID);

    // ৩. ডাইনামিক এবং ফানি মেসেজ কালেকশন
    const name = await Users.getNameUser(targetID);
    const jailQuotes = [
      `🚨 কিরে ${name}, অনেক তো শয়তানি করলি! এবার জেলের ঘানি টান। 👮‍♂️`,
      `⚖️ আইনের হাত অনেক লম্বা ${name}, অবশেষে তোকে ধরা পড়তেই হলো! ⛓️`,
      `🔒 ${name} এখন খাঁচার ভেতর বন্দি! বিরিয়ানি খেতে চাইলে মাফ চা। 🍗😂`,
      `👮‍♂️ থানার লকআপে ${name}-এর জন্য স্পেশাল সিট বুক করা হয়েছে! 🚔`,
      `🐸 ${name} তুই তো দেখি জেলের ভেতরেও পোদ মারানি স্বভাব ছাড়লি না! 🤣`
    ];
    const randomQuote = jailQuotes[Math.floor(Math.random() * jailQuotes.length)];

    // ৪. আউটপুট ডেলিভারি
    return api.sendMessage({
      body: targetID === senderID ? "বেলাল ভাই, নিজেই নিজের কপালে জেলের ভাত লিখলো! 😹" : randomQuote,
      mentions: [{ tag: name, id: targetID }],
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      // ৫. কুইক ক্লিনআপ
      setTimeout(() => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); }, 10000);
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("🚨 সিস্টেম জ্যাম! জেলের তালা খুলতে পারছে না। পরে ট্রাই করো।", threadID, messageID);
  }
};
