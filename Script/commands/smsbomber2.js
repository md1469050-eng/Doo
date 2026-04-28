const axios = require("axios");
const moment = require("moment-timezone");

const RATE_PER_SMS = 10; 
const RAW_JSON_URL = "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json";

module.exports = {
  config: {
    name: "smsbomber2", 
    aliases: ["bomb", "sms", "attack"], 
    version: "10.5.0",
    author: "BOTX666 🪬", 
    role: 0,
    countDown: 10,
    shortDescription: { en: "Premium High-Speed SMS Bomber" },
    category: "premium",
    guide: {
      en: "{pn} [phone] [amount]"
    }
  },

  onStart: async function ({ api, event, message, usersData, args }) {
    const { threadID, messageID, senderID } = event;
    
    // সময় ও তারিখ সেটআপ
    const time = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
    const date = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
    const sig = `\n━━━━━━━━━━━━━━━━━━━━\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${time}\n📅 তারিখ: ${date}`;

    const phone = args[0];
    const userCount = parseInt(args[1]);

    // ইনপুট ভ্যালিডেশন
    if (!phone || phone.length < 11 || isNaN(phone) || isNaN(userCount) || userCount <= 0) {
      api.setMessageReaction("❓", messageID, () => {}, true);
      return message.reply(`╭─────────────╮\n       ⚠️  𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗨𝗦𝗔𝗚𝗘  ⚠️\n╰─────────────╯\n\n💡 ব্যবহার: ${this.config.name} [phone] [amount]\n💰 খরচ: প্রতি SMS ${RATE_PER_SMS} টাকা${sig}`);
    }

    const totalCost = userCount * RATE_PER_SMS;
    const serverCount = userCount * 2; 

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      // ব্যালেন্স চেক
      const balance = await usersData.get(senderID, "money");

      if (balance < totalCost) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return message.reply(`╭─────────────╮\n       🚫  𝗟𝗢𝗪 𝗕𝗔𝗟𝗔𝗡𝗖𝗘  🚫\n╰─────────────╯\n\n❌ আপনার পর্যাপ্ত ব্যালেন্স নেই।\n\n💵 বর্তমান ব্যালেন্স: ${balance} TK\n💸 প্রয়োজন: ${totalCost} TK${sig}`);
      }

      // ব্যালেন্স কর্তন
      await usersData.set(senderID, balance - totalCost, "money");
      
      message.reply(`💸 𝗣𝗮𝘆𝗺𝗲𝗻𝘁 𝗖𝗼𝗻𝗳𝗶𝗿𝗺𝗲𝗱!\n━━━━━━━━━━━━━━━━━━━━\n✅ ${totalCost} TK কেটে নেওয়া হয়েছে।\n💰 অবশিষ্ট: ${balance - totalCost} TK\n\n⚡ সার্ভারে কানেক্ট করা হচ্ছে...${sig}`);

      // এপিআই থেকে ইউআরএল সংগ্রহ
      const jsonRes = await axios.get(RAW_JSON_URL);
      const bomberBaseUrl = jsonRes.data.bomb;

      if (!bomberBaseUrl) throw new Error("API URL not found in JSON");

      // বোম্বিং রিকোয়েস্ট
      const res = await axios.get(`${bomberBaseUrl}/api?phone=${phone}&count=${serverCount}`);

      if (res.data.status === "success" || res.status === 200) {
        api.setMessageReaction("🔥", messageID, () => {}, true);
        
        return message.reply({
          body: `🚀  𝗔𝗧𝗧𝗔𝗖𝗞  𝗗𝗘𝗣𝗟𝗢𝗬𝗘𝗗  🚀\n━━━━━━━━━━━━━━━━━━━━\n📱 𝗧𝗮𝗿𝗴𝗲𝘁: ${phone}\n🔢 𝗔𝗺𝗼𝘂𝗻𝘁: ${userCount} (Sensed: ${serverCount})\n📡 𝗦𝘁𝗮𝘁𝘂𝘀: সাকসেসফুলি পাঠানো হচ্ছে!${sig}`
        });
      } else {
        throw new Error("Server Response Failed");
      }

    } catch (err) {
      console.error(err);
      api.setMessageReaction("⚠️", messageID, () => {}, true);
      return message.reply(`❌ সার্ভার এরর! দয়া করে কিছুক্ষণ পর চেষ্টা করুন।${sig}`);
    }
  }
};
