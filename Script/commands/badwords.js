const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "badwords",
		aliases: ["censors", "anti-toxic"],
		version: "2.0.0",
		author: "BOTX666 🪬",
		countDown: 5,
		role: 1,
		category: "Protection",
		description: {
			en: "Automatically detects bad words, warns the user, and kicks on the second violation."
		},
		guide: {
			en: "『 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 』"
				+ "\n▶ {pn} add <word> : Add to blacklist"
				+ "\n▶ {pn} delete <word> : Remove from blacklist"
				+ "\n▶ {pn} list : Show banned words"
				+ "\n▶ {pn} on/off : Toggle protection"
				+ "\n▶ {pn} unwarn @tag : Remove a warning"
		}
	},

	onStart: async function ({ message, event, args, threadsData, usersData, role }) {
		const { threadID, messageID, senderID, mentions, messageReply } = event;
		const bdTime = moment.tz("Asia/Dhaka").format("h:mm A | DD/MM/YYYY");
		const header = "🛡️ ━━━『 𝐀𝐍𝐓𝐈-𝐓𝐎𝐗𝐈𝐂 𝐆𝐔𝐀𝐑𝐃 』━━━ 🛡️";
		const sig = `\n━━━━━━━━━━━━━━━━━━━━\n🏔️ 𝖲𝗂𝗀𝗇: 𝖢𝗁𝖺𝗇𝖽𝖾𝗋 𝖯𝖺𝗁𝖺𝗋\n⏰ 𝖳𝗂𝗆𝖾: ${bdTime}`;

		let data = await threadsData.get(threadID, "data.badWords") || { words: [], violationUsers: {} };

		switch (args[0]) {
			case "add": {
				if (role < 1) return message.reply(`❌ Only Admins can add words.${sig}`);
				const input = args.slice(1).join(" ").split(/[,|]/).map(w => w.trim()).filter(w => w.length > 1);
				if (input.length === 0) return message.reply(`⚠️ Please enter word(s) to ban.${sig}`);
				
				data.words = [...new Set([...data.words, ...input])];
				await threadsData.set(threadID, data, "data.badWords");
				return message.reply(`${header}\n\n✅ Added ${input.length} words to the blacklist.${sig}`);
			}
			case "delete":
			case "del": {
				if (role < 1) return message.reply(`❌ Only Admins can delete words.${sig}`);
				const wordToDel = args.slice(1).join(" ").trim();
				data.words = data.words.filter(w => w !== wordToDel);
				await threadsData.set(threadID, data, "data.badWords");
				return message.reply(`${header}\n\n✅ Word "${wordToDel}" removed.${sig}`);
			}
			case "list": {
				if (data.words.length === 0) return message.reply(`📭 Blacklist is empty.${sig}`);
				return message.reply(`${header}\n\n📝 Banned Words:\n${data.words.join(", ")}${sig}`);
			}
			case "on":
			case "off": {
				if (role < 1) return message.reply(`❌ Admin access required.${sig}`);
				const status = args[0] === "on";
				await threadsData.set(threadID, status, "settings.badWords");
				return message.reply(`${header}\n\n🔥 Protection is now ${args[0].toUpperCase()}.${sig}`);
			}
			case "unwarn": {
				if (role < 1) return message.reply(`❌ Only Admins can unwarn.${sig}`);
				let targetID = Object.keys(mentions)[0] || args[1] || (messageReply ? messageReply.senderID : null);
				if (!targetID) return message.reply(`⚠️ Tag a user to unwarn.${sig}`);
				
				if (data.violationUsers[targetID]) {
					data.violationUsers[targetID] = 0;
					await threadsData.set(threadID, data, "data.badWords");
					const name = await usersData.getName(targetID);
					return message.reply(`✅ Warnings cleared for ${name}.${sig}`);
				}
				return message.reply(`⚠️ User has no active warnings.${sig}`);
			}
			default:
				return message.reply(`${header}\n\nUse {pn} add/delete/list/on/off/unwarn`);
		}
	},

	onChat: async function ({ message, event, api, threadsData }) {
		if (!event.body || event.senderID === api.getCurrentUserID()) return;

		const isEnabled = await threadsData.get(event.threadID, "settings.badWords");
		if (!isEnabled) return;

		const data = await threadsData.get(event.threadID, "data.badWords");
		if (!data || !data.words || data.words.length === 0) return;

		const msg = event.body.toLowerCase();
		for (const word of data.words) {
			const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, "gi");
			if (regex.test(msg)) {
				let violations = (data.violationUsers[event.senderID] || 0) + 1;
				data.violationUsers[event.senderID] = violations;
				await threadsData.set(event.threadID, data, "data.badWords");

				if (violations < 2) {
					return message.reply(`⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆! ⚠️\n━━━━━━━━━━━━━━━━━━━━\n👤 User: @${event.senderID}\n🚫 Bad word detected: "${word}"\n🛑 This is your first warning. One more and you will be KICKED!`);
				} else {
					message.reply(`🚫 𝐅𝐈𝐍𝐀𝐋 𝐕𝐈𝐎𝐋𝐀𝐓𝐈𝐎𝐍! 🚫\n━━━━━━━━━━━━━━━━━━━━\nDetected: "${word}"\nYou have been kicked for toxic behavior. Goodbye!`);
					return api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
						if (err) message.reply("❌ I need Admin power to kick this user!");
					});
				}
			}
		}
	}
};
