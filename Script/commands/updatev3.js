const axios = require("axios");
const fs = require("fs-extra");
const execSync = require("child_process").execSync;
const dirBootLogTemp = `${__dirname}/tmp/rebootUpdated.txt`;

module.exports = {
	config: {
		name: "updatev3",
		version: "1.6.0",
		author: "BELAL ⊶ BOTX666 🪬",
		role: 2, // শুধুমাত্র ওনারের জন্য
		description: {
			en: "Check and install system updates from GitHub.",
			bn: "বটের সিস্টেম আপডেট চেক এবং ইনস্টল করুন।"
		},
		category: "owner",
		guide: { en: "{pn}" }
	},

	langs: {
		bn: {
			noUpdates: "✅ চাঁদের পাহাড়, আপনার বট বর্তমানে লেটেস্ট ভার্সনে (v%1) আছে।",
			updatePrompt: "╭━━━━━━⊱✨⊰━━━━━━╮\n   𝐒𝐘𝐒𝐓𝐄𝐌 𝐔𝐏𝐃𝐀𝐓𝐄\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n📌 বর্তমান ভার্সন: %1\n🆕 নতুন ভার্সন: %2\n\n🚀 চাঁদের পাহাড়, আপনি কি আপডেট করতে চান?\n\n📂 আপডেট হওয়া ফাইলসমূহ:\n%3%4\n\n💡 নিশ্চিত করতে এই মেসেজে যেকোনো ইমোজি রিয়্যাক্ট দিন।",
			fileWillDelete: "\n🗑️ এই ফাইলগুলো মুছে যাবে:\n%1",
			andMore: " ...এবং আরও %1টি ফাইল",
			updateConfirmed: "🚀 চাঁদের পাহাড়, আপডেট প্রক্রিয়া শুরু হয়েছে। দয়া করে অপেক্ষা করুন...",
			updateComplete: "✅ আপডেট সম্পন্ন হয়েছে!\n\n🔄 বটটি কি এখনই রিস্টার্ট দিতে চান? (হ্যাঁ হলে 'yes' বা 'y' লিখে রিপ্লাই দিন)",
			updateTooFast: "⭕ দুঃখিত চাঁদের পাহাড়, এইমাত্র একটি আপডেট রিলিজ হয়েছে। নিরাপত্তার জন্য %3 মিনিট %4 সেকেন্ড পর আবার চেষ্টা করুন।",
			botWillRestart: "🔄 সিস্টেম রিস্টার্ট হচ্ছে... চাঁদের পাহাড়, শীঘ্রই ফিরে আসছি!"
		},
		en: {
			noUpdates: "✅ You are using the latest version (v%1).",
			updatePrompt: "💫 Version %1 -> %2 available.\n\nFiles to update:\n%3%4\n\n💡 React to confirm update.",
			fileWillDelete: "\n🗑️ Files to delete:\n%1",
			andMore: " ...and %1 more",
			updateConfirmed: "🚀 Updating system...",
			updateComplete: "✅ Update complete! Restart now? (reply 'yes' or 'y')",
			updateTooFast: "⭕ Cooldown active. Try again after %3m %4s.",
			botWillRestart: "🔄 Restarting system now!"
		}
	},

	onLoad: async function ({ api }) {
		if (fs.existsSync(dirBootLogTemp)) {
			const threadID = fs.readFileSync(dirBootLogTemp, "utf-8");
			fs.removeSync(dirBootLogTemp);
			api.sendMessage("╭━━━━━━⊱⚙️⊰━━━━━━╮\n   𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐍𝐋𝐈𝐍𝐄\n╰━━━━━━⊱✨⊰━━━━━━╯\n\n✅ চাঁদের পাহাড়, আপডেট সফলভাবে ইনস্টল হয়েছে এবং বট রিস্টার্ট নিয়েছে।", threadID);
		}
	},

	onStart: async function ({ message, getLang, commandName, event }) {
		try {
			const { data: { version } } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json");
			const { data: versions } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/versions.json");

			const currentVersion = require("../../package.json").version;
			if (compareVersion(version, currentVersion) < 1)
				return message.reply(getLang("noUpdates", currentVersion));

			const newVersions = versions.slice(versions.findIndex(v => v.version == currentVersion) + 1);

			let fileWillUpdate = [...new Set(newVersions.map(v => Object.keys(v.files || {})).flat())].sort().filter(f => f?.length);
			const totalUpdate = fileWillUpdate.length;
			fileWillUpdate = fileWillUpdate.slice(0, 10).map(file => ` • ${file}`).join("\n");

			let fileWillDelete = [...new Set(newVersions.map(v => Object.keys(v.deleteFiles || {}).flat()))].sort().filter(f => f?.length);
			const totalDelete = fileWillDelete.length;
			fileWillDelete = fileWillDelete.slice(0, 10).map(file => ` • ${file}`).join("\n");

			message.reply(
				getLang("updatePrompt", currentVersion, version, fileWillUpdate + (totalUpdate > 10 ? "\n" + getLang("andMore", totalUpdate - 10) : ""),
				totalDelete > 0 ? getLang("fileWillDelete", fileWillDelete + (totalDelete > 10 ? "\n" + getLang("andMore", totalDelete - 10) : "")) : ""),
				(err, info) => {
					global.GoatBot.onReaction.set(info.messageID, {
						authorID: event.senderID,
						commandName
					});
				}
			);
		} catch (e) { console.error(e); message.reply("❌ সার্ভার থেকে ডেটা আনতে সমস্যা হচ্ছে।"); }
	},

	onReaction: async function ({ message, getLang, Reaction, event, commandName }) {
		if (event.userID != Reaction.authorID) return;

		try {
			const { data: lastCommit } = await axios.get('https://api.github.com/repos/ntkhang03/Goat-Bot-V2/commits/main');
			const lastCommitDate = new Date(lastCommit.commit.committer.date);
			const diff = new Date().getTime() - lastCommitDate.getTime();
			const cooldown = 5 * 60 * 1000;

			if (diff < cooldown) {
				const remMin = Math.floor((cooldown - diff) / 60000);
				const remSec = Math.floor(((cooldown - diff) % 60000) / 1000);
				return message.reply(getLang("updateTooFast", 0, 0, remMin, remSec));
			}

			await message.reply(getLang("updateConfirmed"));
			
			// এক্সিকিউট আপডেট
			execSync("node update", { stdio: "inherit" });
			fs.ensureDirSync(path.dirname(dirBootLogTemp));
			fs.writeFileSync(dirBootLogTemp, event.threadID);

			message.reply(getLang("updateComplete"), (err, info) => {
				global.GoatBot.onReply.set(info.messageID, {
					authorID: event.senderID,
					commandName
				});
			});
		} catch (e) { message.reply("❌ আপডেট ব্যর্থ হয়েছে! কনসোল চেক করুন।"); }
	},

	onReply: async function ({ message, getLang, event }) {
		if (['yes', 'y', 'হ্যাঁ'].includes(event.body?.toLowerCase())) {
			await message.reply(getLang("botWillRestart"));
			process.exit(2);
		}
	}
};

function compareVersion(v1, v2) {
	const a = v1.split("."), b = v2.split(".");
	for (let i = 0; i < 3; i++) {
		const n1 = parseInt(a[i]), n2 = parseInt(b[i]);
		if (n1 > n2) return 1;
		if (n1 < n2) return -1;
	}
	return 0;
}
