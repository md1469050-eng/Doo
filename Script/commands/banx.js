const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
	name: "banx",
	version: "3.0.0",
	hasPermssion: 2,
	credits: "Chander Pahar x Gemini",
	description: "গ্রুপ থেকে মেম্বারদের স্থায়ীভাবে ব্যান করার সিস্টেম",
	commandCategory: "Group",
	usages: "banx @mention / banx unban [UID] / banx list",
	cooldowns: 2
};

const BAN_PATH = __dirname + `/cache/bans.json`;

module.exports.run = async function({ api, args, event, Users }) {
	const { threadID, messageID, senderID, type, messageReply, mentions } = event;

	// ১. বট অ্যাডমিন কি না চেক
	const threadInfo = await api.getThreadInfo(threadID);
	if (!threadInfo.adminIDs.some(item => item.id == api.getCurrentUserID())) 
		return api.sendMessage('⚠️ এই কমান্ডটি কাজ করানোর জন্য বটকে গ্রুপ অ্যাডমিন হতে হবে।', threadID, messageID);

	// ২. ডাটাবেজ ফাইল চেক ও তৈরি
	if (!fs.existsSync(BAN_PATH)) {
		fs.writeJsonSync(BAN_PATH, { banned: {} });
	}
	const data = fs.readJsonSync(BAN_PATH);
	if (!data.banned[threadID]) data.banned[threadID] = [];

	// ===== ফাংশন: মেম্বার আইডি বের করা =====
	async function getID() {
		if (type === "message_reply") return messageReply.senderID;
		if (Object.keys(mentions).length > 0) return Object.keys(mentions)[0];
		if (args[1] && !isNaN(args[1])) return args[1];
		return null;
	}

	// ৩. কমান্ড হ্যান্ডলিং
	const action = args[0]?.toLowerCase();

	// --- লিস্ট দেখা ---
	if (action === "list") {
		const list = data.banned[threadID];
		if (list.length === 0) return api.sendMessage("✅ বর্তমানে কোনো মেম্বার এই গ্রুপের ব্ল্যাকলিস্টে নেই।", threadID, messageID);
		
		let msg = "🚫 𝗕𝗔𝗡𝗫 𝗕𝗟𝗔𝗖𝗞𝗟𝗜𝗦𝗧 🚫\n━━━━━━━━━━━━━━\n";
		for (let i = 0; i < list.length; i++) {
			const uName = await Users.getNameUser(list[i].id);
			msg += `${i + 1}. ${uName}\n🆔 UID: ${list[i].id}\n────────────────\n`;
		}
		return api.sendMessage(msg, threadID, messageID);
	}

	// --- আনব্যান করা ---
	if (action === "unban") {
		const id = args[1];
		if (!id || isNaN(id)) return api.sendMessage("⚠️ আনব্যান করতে ইউজারের UID দিন। উদা: banx unban 1000xxx", threadID, messageID);
		
		const index = data.banned[threadID].findIndex(u => u.id == id);
		if (index === -1) return api.sendMessage("❌ এই ইউজারটি ব্যান লিস্টে নেই।", threadID, messageID);
		
		data.banned[threadID].splice(index, 1);
		fs.writeJsonSync(BAN_PATH, data);
		return api.sendMessage(`✅ আইডি ${id} সফলভাবে আনব্যান করা হয়েছে।`, threadID, messageID);
	}

	// --- ব্যান করা (Main Logic) ---
	const targetID = await getID();
	if (!targetID) return api.sendMessage("⚠️ কাকে ব্যান করবেন? মেনশন দিন বা মেসেজে রিপ্লাই দিন।", threadID, messageID);
	
	if (targetID == api.getCurrentUserID()) return api.sendMessage("🚫 আপনি বটকে ব্যান করতে পারবেন না!", threadID, messageID);

	// কিক এবং ডাটাবেজে অ্যাড
	try {
		await api.removeUserFromGroup(targetID, threadID);
		const uName = await Users.getNameUser(targetID);
		
		data.banned[threadID].push({ id: targetID, date: new Date().toLocaleString() });
		fs.writeJsonSync(BAN_PATH, data);

		const successMsg = `🚫 𝗨𝗦𝗘𝗥 𝗣𝗘𝗥𝗠𝗔𝗡𝗘𝗡𝗧𝗟𝗬 𝗕𝗔𝗡𝗡𝗘𝗗 🚫\n━━━━━━━━━━━━━━━\n👤 নাম: ${uName}\n🆔 আইডি: ${targetID}\n🛡️ স্ট্যাটাস: ব্ল্যাকলিস্টে যুক্ত করা হয়েছে।\n━━━━━━━━━━━━━━━\n"নিয়ম ভঙ্গ করলে ক্ষমা নেই।"`;
		api.sendMessage(successMsg, threadID, messageID);
	} catch (e) {
		api.sendMessage("❌ ইউজারকে কিক করা যায়নি। বটকে অ্যাডমিন পারমিশন দিন।", threadID, messageID);
	}
};
