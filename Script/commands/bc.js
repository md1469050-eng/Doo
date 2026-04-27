const tlt = 30; // জিতার সম্ভাবনা (%)
const minBet = 100; // সর্বনিম্ন বেট

module.exports.config = {
  name: "bc",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Chander Pahar x Gemini",
  description: "একটি প্রিমিয়াম বউ-কুয়া গেম (ক্যাসিনো এডিশন)",
  commandCategory: "Game",
  usages: "[bau/cua/tom/ca/nai/ga] [টাকা]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const fs = require("fs-extra");
  const axios = require("axios");
  const { loadImage, createCanvas } = require("canvas");

  if (args.length < 2)
    return api.sendMessage("⚠️ ব্যবহার: bc [নাম] [টাকা]\nউদা: bc bau 500", threadID, messageID);

  const allface = ["bau", "cua", "tom", "ca", "nai", "ga"];
  const betChoice = args[0].toLowerCase();
  const betAmount = parseInt(args[1]);

  if (!allface.includes(betChoice))
    return api.sendMessage(`❌ ভুল নাম! পছন্দ করুন: bau, cua, tom, ca, nai, ga`, threadID, messageID);

  const userData = await Currencies.getData(senderID);
  const userMoney = userData.money;

  if (isNaN(betAmount) || betAmount < 1)
    return api.sendMessage("❌ বেট করার টাকার পরিমাণ সঠিক নয়!", threadID, messageID);
  if (betAmount < minBet)
    return api.sendMessage(`❌ সর্বনিম্ন বেট ${minBet}$ হতে হবে!`, threadID, messageID);
  if (betAmount > userMoney)
    return api.sendMessage(`❌ আপনার কাছে পর্যাপ্ত টাকা নেই! ব্যালেন্স: ${userMoney}$`, threadID, messageID);

  // জিতার লজিক (tlt এর ওপর ভিত্তি করে)
  const luck = Math.floor(Math.random() * 100) + 1;
  const tempFaces = [...allface];
  if (luck > tlt) {
      const index = tempFaces.indexOf(betChoice);
      if (index > -1) tempFaces.splice(index, 1);
  }

  const result = [
    tempFaces[Math.floor(Math.random() * tempFaces.length)],
    tempFaces[Math.floor(Math.random() * tempFaces.length)],
    tempFaces[Math.floor(Math.random() * tempFaces.length)]
  ];

  const getLink = (face) => {
    const links = {
      bau: "https://i.postimg.cc/SR3qy939/bau.png",
      cua: "https://i.postimg.cc/0jbPRnWx/cua.png",
      tom: "https://i.postimg.cc/tCnpBrnN/tom.png",
      ca: "https://i.postimg.cc/BnWskxx9/ca.png",
      nai: "https://i.postimg.cc/05B9dgjN/nai.png",
      ga: "https://i.postimg.cc/Kz9xHw5J/ga.png"
    };
    return links[face];
  };

  try {
    const canvas = createCanvas(1200, 900);
    const ctx = canvas.getContext("2d");
    
    // ব্যাকগ্রাউন্ড ডাউনলোড ও ড্রয়িং
    const bgRes = await axios.get("https://i.postimg.cc/9fcVVWSb/background.png", { responseType: "arraybuffer" });
    const background = await loadImage(Buffer.from(bgRes.data));
    ctx.drawImage(background, 0, 0, 1200, 900);

    let count = 0;
    for (let i = 0; i < 3; i++) {
      if (result[i] === betChoice) count++;
      const imgRes = await axios.get(getLink(result[i]), { responseType: "arraybuffer" });
      const img = await loadImage(Buffer.from(imgRes.data));
      
      const x = i === 0 ? 250 : i === 1 ? 612 : 480;
      const y = i === 0 ? 129 : i === 1 ? 134 : 344;
      ctx.drawImage(img, x, y, 370, 370);
    }

    const pathImg = __dirname + `/cache/bc_${senderID}.png`;
    fs.writeFileSync(pathImg, canvas.toBuffer("image/png"));

    let msg = "";
    if (count === 0) {
      await Currencies.decreaseMoney(senderID, betAmount);
      msg = `╭┈───────🎰───────┈╮\n   ✨ 𝗖𝗔𝗦𝗜𝗡𝗢 𝗟𝗢𝗦𝗘 ✨\n╰┈────────────────┈╯\n💔 ফলাফল: ${result.join(" | ")}\n📉 আপনি ${betAmount}$ হেরেছেন!\n\n"আবার চেষ্টা করুন, ভাগ্য এবার সহায় হতে পারে!" 🏔️`;
    } else {
      const winMoney = betAmount * count;
      await Currencies.increaseMoney(senderID, winMoney);
      msg = `╭┈───────🎰───────┈╮\n   ✨ 𝗖𝗔𝗦𝗜𝗡𝗢 𝗪𝗜𝗡𝗡𝗘𝗥 ✨\n╰┈────────────────┈╯\n🎉 ফলাফল: ${result.join(" | ")}\n✅ আপনি ${count}টি ${betChoice} পেয়েছেন!\n💰 বোনাস: +${winMoney}$\n\n"চাঁদের পাহাড় ক্যাসিনোর পক্ষ থেকে অভিনন্দন!" 🏔️`;
    }

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ গেমটি লোড করতে সমস্যা হয়েছে! আবার চেষ্টা করুন।", threadID, messageID);
  }
};
