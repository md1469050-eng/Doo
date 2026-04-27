const axios = require("axios");

module.exports.config = {
  name: "ip",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "আইপি-র নাড়িভুঁড়ি, ম্যাপ লোকেশন এবং সিকিউরিটি অ্যানালাইসিস",
  commandCategory: "Utility",
  usages: "[IP Address]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const ip = args.join(' ');

  if (!ip) return api.sendMessage("🚩 বসের নির্দেশ: আইপি অ্যাড্রেস ছাড়া স্ক্যান করা সম্ভব না।\nসঠিক নিয়ম: !ip 8.8.8.8", threadID, messageID);

  const waitMsg = await api.sendMessage("📡 𝐈𝐏 𝐈𝐧𝐭𝐞𝐥𝐥𝐢𝐠𝐞𝐧𝐜𝐞 𝐒𝐲𝐬𝐭𝐞𝐦 কানেক্ট হচ্ছে... ডাটা প্রসেস করা হচ্ছে...", threadID);

  try {
    // ১. আইপি-র সব তথ্য সংগ্রহ (fields=66846719)
    const res = await axios.get(`http://ip-api.com/json/${ip}?fields=66846719`);
    const d = res.data;

    if (d.status === 'fail') {
      api.unsendMessage(waitMsg.messageID);
      return api.sendMessage(`❌ এরর রিপোর্ট: ${d.message}`, threadID, messageID);
    }

    // ২. সিকিউরিটি অ্যানালাইসিস লজিক
    let riskLevel = "🟢 Low Risk";
    let alertEmoji = "✅";
    if (d.proxy || d.hosting) {
      riskLevel = "🔴 High Risk (VPN/Proxy Detected)";
      alertEmoji = "🚨";
    } else if (d.mobile) {
      riskLevel = "🟡 Medium (Mobile Network)";
      alertEmoji = "📶";
    }

    // ৩. গুগল ম্যাপস স্ট্যাটিক ইমেজ জেনারেশন (লোকেশন দেখানোর জন্য)
    const mapImg = `https://maps.googleapis.com/maps/api/staticmap?center=${d.lat},${d.lon}&zoom=10&size=600x400&maptype=roadmap&markers=color:red%7C${d.lat},${d.lon}&key=`; 
    
    // বিকল্প ইমেজ এপিআই (যদি গুগল কি না থাকে তবে লোকেশন প্রিভিউ দিবে)
    const cardImg = `https://api.screenshotmachine.com/?key=ca8282&url=https://ipapi.co/${d.query}/&dimension=1024x768`;

    // ৪. টেক্সট ডিসপ্লে সাজানো (প্রিমিয়াম ইউআই)
    const reportText = `━━━━━━━━━━━━━━━━━━
📊 𝐈𝐏 𝐈𝐍𝐓𝐄𝐋𝐋𝐈𝐆𝐄𝐍𝐂𝐄 𝐑𝐄𝐏𝐎𝐑𝐓
━━━━━━━━━━━━━━━━━━
🌐 𝐈𝐏: ${d.query}
${alertEmoji} 𝐒𝐭𝐚𝐭𝐮𝐬: ${riskLevel}

🌍 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧 𝐃𝐞𝐭𝐚𝐢𝐥𝐬:
🏳️ 𝐍𝐚𝐭𝐢𝐨𝐧: ${d.country} (${d.countryCode})
🏙️ 𝐂𝐢𝐭𝐲: ${d.city}, ${d.regionName}
📮 𝐙𝐢𝐩: ${d.zip}
⏰ 𝐓𝐢𝐦𝐞𝐳𝐨𝐧𝐞: ${d.timezone}

📡 𝐍𝐞𝐭𝐰𝐨𝐫𝐤 𝐈𝐧𝐬𝐢𝐠𝐡𝐭𝐬:
🏢 𝐈𝐒𝐏: ${d.isp}
👨‍✈️ 𝐎𝐫𝐠: ${d.org}
🔗 𝐀𝐒: ${d.as}
🛰️ 𝐓𝐲𝐩𝐞: ${d.mobile ? "Cellular (Mobile)" : "Residential/Business"}

🧭 𝐂𝐨𝐨𝐫𝐝𝐢𝐧𝐚𝐭𝐞𝐬:
📍 Lat: ${d.lat} | Lon: ${d.lon}
🗺️ Google Maps: https://www.google.com/maps/place/${d.lat},${d.lon}
━━━━━━━━━━━━━━━━━━
⏱️ Scan Done! | Requested by Belal Boss`;

    // ৫. ইমেজ প্রসেসিং ও সেন্ডিং
    const imageStream = (await axios.get(cardImg, { responseType: 'stream' })).data;

    api.unsendMessage(waitMsg.messageID);

    return api.sendMessage({
      body: reportText,
      attachment: imageStream
    }, threadID, messageID);

  } catch (error) {
    api.unsendMessage(waitMsg.messageID);
    console.error(error);
    return api.sendMessage("🚨 মারাত্মক এরর! ডাটাবেজ রেসপন্স করছে না। আইপি চেক করুন।", threadID, messageID);
  }
};
      
