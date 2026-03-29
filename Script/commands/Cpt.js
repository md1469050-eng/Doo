const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "hack", // কমান্ডের নাম 'hack' দেওয়া ভালো, \n অনেক সময় এরর দেয়
    version: "22.0.0",
    hasPermssion: 0,
    credits: "Belal x Gemini",
    description: "৫ মিনিটের প্রিমিয়াম হ্যাকার ড্যাশবোর্ড (Ultra Dynamic)",
    commandCategory: "Info",
    usages: "hack",
    cooldowns: 5,
    dependencies: { "fs-extra": "", "axios": "" }
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID } = event;
    const myFB = "https://www.facebook.com/profile.php?id=61577502464880";
    const sig = "┈───╼ ┄┉❈✡️⋆⃝চৃাঁদেৃঁরৃঁ পাৃঁহা্ঁড়ৃঁ✿⃝🪬 ╾───┈";
    
    // ১. আনলিমিটেড ইমোজি পুল (ডাইনামিক লুকের জন্য)
    const icons = ["🚀", "⚡", "🛸", "🛰️", "🔥", "💎", "☄️", "🛡️", "🧬", "⚙️", "🔋", "📡", "💻", "🎮", "👾", "🤖", "👑", "🔮", "🧿", "🩹", "⚖️", "🔭", "🔬", "🔋", "⏱️", "⌛", "🕰️", "🪙", "💳", "📜", "📂", "📊", "📈", "📉", "📁", "📅", "🗝️", "🔨", "🔫", "🗡️", "🏹", "💣", "🧨", "⚔️", "🔱", "⚜️", "💵", "🛡️", "🔗", "💾"];
    const getIcon = () => icons[Math.floor(Math.random() * icons.length)];

    // ২. হ্যাকার ডিসপ্লে জেনারেটর (প্রতিটি সেকেন্ডে আলাদা ইমোজি)
    const getHackerBody = (step) => {
        const ping = (Math.random() * (12.00 - 4.00) + 4.00).toFixed(2);
        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        
        // নিওন লোডিং বার সিস্টেম
        const bars = ["▉▒▒▒▒▒▒▒▒▒", "▉▉▒▒▒▒▒▒▒▒", "▉▉▉▒▒▒▒▒▒▒", "▉▉▉▉▒▒▒▒▒▒", "▉▉▉▉▉▒▒▒▒▒", "▉▉▉▉▉▉▒▒▒▒", "▉▉▉▉▉▉▉▒▒▒", "▉▉▉▉▉▉▉▉▒▒", "▉▉▉▉▉▉▉▉▉▒", "▉▉▉▉▉▉▉▉▉▉"];
        const currentBar = bars[step % 10]; 
        
        const timeLeft = 300 - step;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;

        return `╭┈────────── ${getIcon()} ──────────┈╮
   ${getIcon()} 𝗠𝗔𝗦𝗧𝗘𝗥 𝗕𝗘𝗟𝗔𝗟 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 ${getIcon()}
╰┈────────── ${getIcon()} ──────────┈╯

${getIcon()} 𝗦𝗬𝗦𝗧𝗘𝗠_𝗛𝗔𝗖𝗞 : 𝗔𝗖𝗧𝗜𝗩𝗘 ⚡
━━━━━━━━━━━━━━━━━━━━━━
🌸 𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗮𝗹𝗮𝗶𝗸𝘂𝗺 🌸

${getIcon()} 𝗟𝗼𝗮𝗱𝗶𝗻𝗴 : ${currentBar}
${getIcon()} 𝗟𝗮𝘁𝗲𝗻𝗰𝘆 : ${ping} ms (𝗟𝗶𝘃𝗲)
${getIcon()} 𝗥𝗲𝘀𝗼𝘂𝗿𝗰𝗲: ${ram} MB / 𝟭𝟬𝟮𝟰𝗠𝗕
${getIcon()} 𝗧𝗶𝗺𝗲_𝗟𝗲𝗳𝘁: ${mins}m ${secs}s

┏━━━━ ${getIcon()}『 👑 𝗔𝗗𝗠𝗜𝗡_𝗜𝗡𝗙𝗢 』
┃ ${getIcon()} 𝗡𝗮𝗺𝗲 : 𝗕𝗘𝗟𝗔𝗟 𝗬𝗧 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
┃ ${getIcon()} 𝗙𝗕   : ${myFB}
┗━━━━━━━━━━━━━━━━━━━━┈ ${getIcon()}

${sig}
『 ${getIcon()} 𝗘𝗫𝗘𝗖𝗨𝗧𝗜𝗡𝗚: ${step}/𝟯𝟬𝟬 』`;
    };

    const images = ['https://i.imgur.com/FQQq8WH.jpeg', 'https://i.imgur.com/6b6DGcW.jpeg'];
    const imageUrl = images[Math.floor(Math.random() * images.length)];
    const cachePath = path.join(__dirname, 'cache', `hacker_${Date.now()}.jpg`);

    if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(cachePath, Buffer.from(response.data, 'utf-8'));

        api.sendMessage({
            body: getHackerBody(0),
            attachment: fs.createReadStream(cachePath)
        }, threadID, (err, info) => {
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
            if (err) return;

            let count = 0;
            const interval = setInterval(() => {
                count++;
                
                // প্রতি সেকেন্ডে এডিট হবে আনলিমিটেড ডিজাইন ও ইমোজিসহ
                api.editMessage(getHackerBody(count), info.messageID, (error) => {
                    if (error) clearInterval(interval);
                });

                if (count >= 300) {
                    clearInterval(interval);
                    api.editMessage(`✅ ${getIcon()} 𝗦𝗘𝗦𝗦𝗜𝗢𝗡_𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘𝗗_𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬\n${sig}`, info.messageID);
                }
            }, 1000); 
        }, messageID);
    } catch (e) {
        console.error(e);
    }
};
                    
