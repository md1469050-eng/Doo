const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;
const checkUrlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

module.exports = {
	config: {
		name: "setrankup",
		aliases: ["rankupconfig", "src"],
		version: "2.5.0",
		author: "BELAL ⊶ BOTX666 🪬",
		countDown: 5,
		role: 1, // শুধুমাত্র এডমিনরা ব্যবহার করতে পারবে
		shortDescription: { en: "গ্রুপের লেভেল আপ মেসেজ ও ফাইল সেট করুন" },
		category: "admin",
		guide: {
			en: "╭━━━❖✦🪬✦❖━━━╮\n  ✡️  চাঁদের 𖤍 পাহাড়  🪬\n╰━━━❖✦🪬✦❖━━━╯\n\n"
				+ "📝 𝗧𝗲𝘗𝘁 𝗖𝗼𝗻𝗳𝗶𝗴:\n{pn} text <আপনার মেসেজ>\n(Params: {userName}, {userNameTag}, {oldRank}, {currentRank})\n\n"
				+ "🖼️ 𝗙𝗶𝗹𝗲 𝗖𝗼𝗻𝗳𝗶𝗴:\n{pn} file [ছবিতে রিপ্লাই দিন অথবা লিঙ্ক দিন]\n\n"
				+ "🔄 𝗥𝗲𝘀𝗲𝘁:\n{pn} reset (ডিফল্ট সেটিং)"
		}
	},

	onStart: async function ({ args, message, event, threadsData }) {
		const { body, threadID, senderID } = event;
		const sig = "\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄";

		switch (args[0]?.toLowerCase()) {
			case "text": {
				const newContent = body.slice(body.indexOf("text") + 5);
				if (!newContent) return message.reply("⚠️ বেলাল ভাই, Rankup-এর জন্য কোনো মেসেজ টেক্সট দিন!");
				
				await threadsData.set(threadID, newContent, "data.rankup.message");
				
				const successText = `╭━━━❖✦⚙️✦❖━━━╮\n   𝗦𝗬𝗦𝗧𝗘𝗠 𝗨𝗣𝗗𝗔𝗧𝗘\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n✅ লেভেল আপ মেসেজ আপডেট করা হয়েছে!\n\n📝 𝗡𝗲𝘄 𝗠𝘀𝗴: ${newContent}\n\n𖤍 𝗔𝗱𝗺𝗶𝗻 : BELAL ⊶ BOTX666 🪬${sig}`;
				return message.reply(successText);
			}

			case "file":
			case "image":
			case "video": {
				const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type));
				
				if (!attachments.length && !(args[1] || '').match(checkUrlRegex)) {
					return message.reply("⚠️ বেলাল ভাই, একটি ছবি, ভিডিও বা অডিও ফাইলে রিপ্লাই দিন অথবা লিঙ্ক দিন!");
				}

				const { data } = await threadsData.get(threadID);
				if (!data.rankup) data.rankup = {};
				if (!data.rankup.attachments) data.rankup.attachments = [];

				for (const attachment of attachments) {
					const { url } = attachment;
					const ext = getExtFromUrl(url);
					const fileName = `${getTime()}.${ext}`;
					const infoFile = await drive.uploadFile(`setrankup_${threadID}_${senderID}_${fileName}`, await getStreamFromURL(url));
					data.rankup.attachments.push(infoFile.id);
				}

				await threadsData.set(threadID, data, "data");
				
				const successFile = `╭━━━❖✦🎬✦❖━━━╮\n   𝗠𝗘𝗗𝗜𝗔 𝗨𝗣𝗗𝗔𝗧𝗘𝗗\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n✅ Rankup মিডিয়া ফাইল সফলভাবে সেভ করা হয়েছে!\n\n𖤍 𝗔𝗱𝗺𝗶𝗻 : BELAL ⊶ BOTX666 🪬${sig}`;
				return message.reply(successFile);
			}

			case "reset": {
				await threadsData.set(threadID, null, "data.rankup");
				return message.reply("🔄 Rankup কনফিগারেশন রিসেট করা হয়েছে বস!");
			}

			default:
				return message.reply("❌ ভুল কমান্ড! সঠিক নিয়মের জন্য লিখুন: /setrankup help");
		}
	}
};
