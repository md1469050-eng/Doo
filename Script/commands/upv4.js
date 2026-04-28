const os = require('os');
const si = require('systeminformation');
const moment = require('moment-timezone');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
  config: {
    name: "upv4",
    aliases: ["uptime4", "statusv4", "monitor"],
    version: "4.0.0",
    author: "BOTX666 🪬",
    countDown: 5,
    role: 0,
    category: "system",
    description: {
      en: "Ultimate System & Bot Statistics Monitor"
    }
  },

  onStart: async function ({ api, event, message, threadsData, usersData }) {
    const { messageID } = event;
    const commandStartTime = Date.now();

    // সময় ও তারিখ (Asia/Dhaka)
    const timeFull = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
    const dateFull = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
    const sig = `\n━━━━━━━━━━━━━━━━━━━━\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${timeFull}\n📅 তারিখ: ${dateFull}`;

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      // সিস্টেম ইনফরমেশন সংগ্রহ
      const [cpu, mem, disk, net, load, botStats] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.currentLoad(),
        getBotStats(threadsData, usersData)
      ]);

      const processingTime = Date.now() - commandStartTime;
      const botMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
      
      // মেমোরি ও ডিস্ক ক্যালকুলেশন
      const ramUsed = (mem.used / 1024 / 1024 / 1024).toFixed(2);
      const ramTotal = (mem.total / 1024 / 1024 / 1024).toFixed(2);
      const rootDisk = disk[0] || { size: 0, used: 0 };
      const diskUsed = (rootDisk.used / 1024 / 1024 / 1024).toFixed(2);
      const diskTotal = (rootDisk.size / 1024 / 1024 / 1024).toFixed(2);

      let statusMsg = `🛠️ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐌𝐎𝐍𝐈𝐓𝐎𝐑 𝐕𝟒\n━━━━━━━━━━━━━━━━━━━━\n`;
      statusMsg += `🟢 𝐒𝐭𝐚𝐭𝐮𝐬: Active & Online\n`;
      statusMsg += `⏱️ 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞: ${formatUptime(process.uptime())}\n`;
      statusMsg += `📡 𝐋𝐚𝐭𝐞𝐧𝐜𝐲: ${processingTime}ms\n\n`;

      statusMsg += `💻 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐨𝐫 𝐈𝐧𝐟𝐨:\n`;
      statusMsg += `• Model: ${cpu.brand}\n`;
      statusMsg += `• Load: ${load.currentLoad.toFixed(1)}% (${cpu.cores} Cores)\n\n`;

      statusMsg += `🧠 𝐒𝐭𝐨𝐫𝐚𝐠𝐞 & 𝐑𝐀𝐌:\n`;
      statusMsg += `• RAM: ${ramUsed}GB / ${ramTotal}GB\n`;
      statusMsg += `• Disk: ${diskUsed}GB / ${diskTotal}GB\n`;
      statusMsg += `• Bot Heap: ${botMem}MB\n\n`;

      statusMsg += `🤖 𝐁𝐨𝐭 𝐒𝐭𝐚𝐭𝐢𝐬𝐭𝐢𝐜𝐬:\n`;
      statusMsg += `• Total Users: ${botStats.users}\n`;
      statusMsg += `• Total Groups: ${botStats.threads}\n`;
      statusMsg += `• Commands: ${global.GoatBot.commands.size}\n\n`;

      statusMsg += `⚙️ 𝐒𝐞𝐫𝐯𝐞𝐫 𝐃𝐞𝐭𝐚𝐢𝐥𝐬:\n`;
      statusMsg += `• Node: ${process.version}\n`;
      statusMsg += `• Host: ${os.hostname()}\n`;
      statusMsg += `• OS: ${os.type()} ${os.arch()}`;
      
      statusMsg += sig;

      api.setMessageReaction("✅", messageID, () => {}, true);
      return message.reply(statusMsg);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply(`❌ সিস্টেম ডাটা সংগ্রহে ত্রুটি হয়েছে।${sig}`);
    }
  }
};

async function getBotStats(threadsData, usersData) {
  try {
    const [users, threads] = await Promise.all([
      usersData.getAll(),
      threadsData.getAll()
    ]);
    return { users: users.length, threads: threads.length };
  } catch {
    return { users: 0, threads: 0 };
  }
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`;
}
