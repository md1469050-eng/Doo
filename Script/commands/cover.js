module.exports.config = {
  name: "cover",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Chander Pahar x Gemini",
  description: "আপনার প্রোফাইল পিকচার দিয়ে আকর্ষণীয় ব্যানার তৈরি করুন",
  commandCategory: "Create Photo",
  usages: "[টেক্সট ১ - টেক্সট ২]",
  cooldowns: 15,
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};

// গোল অ্যাভাটার তৈরির উন্নত ফাংশন (জিম্প ছাড়া)
async function getCircleAva(url) {
    const axios = require('axios');
    const { loadImage, createCanvas } = require('canvas');
    
    let img;
    try {
        img = await loadImage((await axios.get(url, { responseType: 'arraybuffer' })).data);
    } catch (e) {
        // যদি graph.facebook.com কাজ না করে তবে স্ট্যাটিক অ্যাভাটার ব্যবহার করবে
        img = await loadImage('https://i.imgur.com/8Qp4s8F.png'); 
    }
    
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    ctx.drawImage(img, 0, 0, size, size);
    return canvas.toBuffer();
}

module.exports.run = async function ({ api, event, args }) {
  let { senderID, threadID, messageID } = event;
  const { loadImage, createCanvas } = require("canvas");
  const fs = require("fs-extra");
  const path = require("path");

  // ১. ইনপুট চেক এবং স্প্লিট লজিক
  let textInput = args.join(" ");
  if (!textInput || !textInput.includes(' - ')) {
      return api.sendMessage('🏔️ ভুল ফরম্যাট! দয়া করে সঠিক ফরম্যাটে লিখুন:\nউদা: !cover বেলাল - চাঁদের পাহাড়', threadID, messageID);
  }

  const part1 = textInput.substr(0, textInput.indexOf(' - ')).trim(); 
  const part2 = textInput.split(" - ").pop().trim();
  
  if (!part1 || !part2) return api.sendMessage('⚠️ টেক্সট খালি রাখা যাবে না!', threadID, messageID);

  const pathCache = path.join(__dirname, 'cache');
  if (!fs.existsSync(pathCache)) mkdirSync(pathCache);
  const finalPath = path.join(pathCache, `cover_${senderID}.png`);

  api.sendMessage("⏳ একটু অপেক্ষা করো... চাঁদের পাহাড় থেকে তোমার জন্য ব্যানারটা এডিট করে আনছি! ✨", threadID);

  try {
    // ২. প্রোফাইল পিকচার এবং ব্যাকগ্রাউন্ড ছবি লোড করা (উন্নত হাই-কোয়ালিটি লিঙ্ক)
    let avaUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    let bgUrl = 'https://i.ibb.co/cCpB1sQ/Ph-i-b-a-trung-thu.png'; // আপনার অরিজিনাল ব্যাকগ্রাউন্ড

    let [circleAvaBuffer, bgRes] = await Promise.all([
        getCircleAva(avaUrl),
        axios.get(encodeURI(bgUrl), { responseType: "arraybuffer" })
    ]);

    // ৩. ক্যানভাস এডিটিং এবং ডিজাইন লজিক
    let baseAva = await loadImage(circleAvaBuffer);
    let baseImage = await loadImage(Buffer.from(bgRes.data, "utf-8"));

    // আপনার ব্যাকগ্রাউন্ড অনুযায়ী ক্যানভাস সাইজ (১৯২০x১০৮০)
    let canvas = createCanvas(1920, 1080);
    let ctx = canvas.getContext("2d");

    // ব্যাকগ্রাউন্ড ড্র করা
    ctx.drawImage(baseImage, 0, 0, 1920, 1080);

    // গোল প্রোফাইল পিকচার ড্র করা (সঠিক পজিশন: ৮২০, ৩১৫)
    ctx.drawImage(baseAva, 820, 315, 283, 283);

    // টেক্সট ১ (বোল্ড নাম): সঠিক পজিশন (৯৬৫, ৭১৫)
    ctx.font = "bold 70px Manrope";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(part1, 965, 715);

    // টেক্সট ২ (ডেজিগনেশন): সঠিক পজিশন (৯৬৫, ৮০০)
    ctx.font = "55px Manrope";
    ctx.fillStyle = "#f1f1f1"; // একটু হালকা সাদা
    ctx.textAlign = "center";
    ctx.fillText(part2, 965, 800);

    // ৪. আউটপুট তৈরি এবং পাঠানো
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(finalPath, imageBuffer);

    return api.sendMessage(
      { body: "🏔️ চাঁদের পাহাড় থেকে তোমার জন্য প্রিমিয়াম ব্যানার তৈরি! 🌻", attachment: fs.createReadStream(finalPath) },
      threadID,
      () => fs.unlinkSync(finalPath),
      messageID
    );

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ ব্যানার তৈরি করার সময় একটি ত্রুটি ঘটেছে!", threadID, messageID);
  }
};
    
