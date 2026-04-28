const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "autosetname",
		aliases: ["autoname", "setnickname"],
		version: "2.0.0",
		author: "BOTX666 🪬",
		countDown: 5,
		role: 1,
		category: "Admin Tool",
		description: {
			en: "Automatically rebrands new members' nicknames with an advanced formatting system."
		},
		guide: {
			en: "『 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 』"
				+ "\n▶ {pn} on/off : Toggle feature"
				+ "\n▶ {pn} set <text> : Custom format"
				+ "\n▶ {pn} status : Check current state"
				+ "\n\n『 𝐒𝐡𝐨𝐫𝐭𝐜𝐮𝐭𝐬 』"
				+ "\n🆔 {id} - User UID"
				+ "\n👤 {name} - Full Name"
		}
	},

	onStart: async function ({ message, event, args, threadsData }) {
		const { threadID } = event;
		const bdTime = moment.tz("Asia/Dhaka").format("h:mm A");

		// ইউনিক ডিজাইন ফর অনস্টার্ট
		const header = "💠 ━━━『 𝐀𝐔𝐓𝐎-𝐍𝐀𝐌𝐄 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 』━━━ 💠";

		if (args[0] === "on" || args[0] === "off") {
			const isEnable = args[0] === "on";
			await threadsData.set(threadID, isEnable, "settings.enableAutoSetName");
			return message.reply(`${header}\n\n✅ Feature ${args[0].toUpperCase()} successful.\n⏰ Status updated at: ${bdTime}`);
		}

		if (args[0] === "set") {
			const format = args.slice(1).join(" ");
			if (!format) return message.reply("⚠️ Please provide a format! Example: {pn} set [NEW] {name}");
			await threadsData.set(threadID, format, "data.autoSetName");
			return message.reply(`${header}\n\n📝 New Format: ${format}\n✨ Verified by BOTX666`);
		}

		if (args[0] === "status" || args[0] === "view") {
			const currentFormat = await threadsData.get(threadID, "data.autoSetName") || "Not Set";
			const isActivated = await threadsData.get(threadID, "settings.enableAutoSetName");
			return message.reply(`${header}\n\n🟢 Status: ${isActivated ? "ACTIVE" : "INACTIVE"}\n📐 Format: ${currentFormat}\n━━━━━━━━━━━━━━━━━━\n🏔️ 𝖲𝗂𝗀𝗇: 𝖢𝗁𝖺𝗇𝖽𝖾𝗋 𝖯𝖺𝗁𝖺𝗋`);
		}

		return message.reply(`${header}\n\nInvalid usage! Use {pn} set/on/off/status`);
	},

	onEvent: async ({ event, api, threadsData }) => {
		// শুধুমাত্র নতুন মেম্বার জয়েন করলে ট্রিগার হবে
		if (event.logMessageType !== "log:subscribe") return;

		const { threadID, logMessageData } = event;
		const isEnabled = await threadsData.get(threadID, "settings.enableAutoSetName");
		if (!isEnabled) return;

		const format = await threadsData.get(threadID, "data.autoSetName");
		if (!format) return;

		const newMembers = logMessageData.addedParticipants;

		for (const member of newMembers) {
			const { userFbId: uid, fullName: name } = member;
			
			// নিখুঁত রিপ্লেসমেন্ট লজিক
			let customName = format
				.replace(/\{name\}/g, name)
				.replace(/\{id\}/g, uid);

			try {
				// ১ সেকেন্ড ডিলে দেওয়া হয়েছে যাতে ফেসবুক স্প্যাম হিসেবে না ধরে
				setTimeout(async () => {
					await api.changeNickname(customName, threadID, uid);
				}, 1500);
			} catch (err) {
				console.error("AutoName Fix Error:", err);
			}
		}
	}
};
