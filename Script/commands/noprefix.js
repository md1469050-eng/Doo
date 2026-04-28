const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "noprefix",
		aliases: ["prefixcontrol", "pref"],
		version: "2.0.0",
		author: "BOTX666 🪬",
		role: 2, // Admin only
		description: "Enable or disable the bot prefix system",
		category: "system",
		guide: {
			en: "{pn} on | off"
		},
		countDown: 5
	},

	onStart: async function ({ args, message, role, api, event }) {
		const { threadID, messageID } = event;
		
		// সময় ও তারিখ সেটআপ (Asia/Dhaka)
		const time = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
		const date = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
		const sig = `\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${time}\n📅 তারিখ: ${date}`;

		// অ্যাডমিন চেক
		if (role < 2) {
			api.setMessageReaction("❌", messageID, () => {}, true);
			return message.reply(`❌ এই কমান্ডটি শুধুমাত্র বট অ্যাডমিনদের জন্য সংরক্ষিত!${sig}`);
		}

		const status = args[0]?.toLowerCase();

		if (status === "on") {
			// প্রিফিক্স সিস্টেম চালু করা
			global.GoatBot.config.isPrefix = true;
			api.setMessageReaction("✅", messageID, () => {}, true);
			return message.reply(`🛡️ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐔𝐩𝐝𝐚𝐭𝐞: 𝐏𝐫𝐞𝐟𝐢𝐱 𝐄𝐧𝐚𝐛𝐥𝐞𝐝\n━━━━━━━━━━━━━━━━━━━━\nবট এখন থেকে প্রিফিক্স ছাড়া কাজ করবে না। ⚡${sig}`);
		} 
		else if (status === "off") {
			// প্রিফিক্স সিস্টেম বন্ধ করা (No-Prefix চালু)
			global.GoatBot.config.isPrefix = false;
			api.setMessageReaction("🔄", messageID, () => {}, true);
			return message.reply(`🛡️ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐔𝐩𝐝𝐚𝐭𝐞: 𝐍𝐨-𝐏𝐫𝐞𝐟𝐢𝐱 𝐌𝐨𝐝𝐞\n━━━━━━━━━━━━━━━━━━━━\nবট এখন প্রিফিক্স ছাড়াই সব কমান্ড গ্রহণ করবে। ✨${sig}`);
		} 
		else {
			api.setMessageReaction("⚠️", messageID, () => {}, true);
			return message.reply(`⚠️ 𝐔𝐬𝐚𝐠𝐞 𝐈𝐧𝐬𝐭𝐫𝐮𝐜𝐭𝐢𝐨𝐧:\n━━━━━━━━━━━━━━\nসিস্টেম পরিবর্তন করতে লিখুন: \n${this.config.name} on (প্রিফিক্স চালু)\n${this.config.name} off (প্রিফিক্স বন্ধ)${sig}`);
		}
	}
};
