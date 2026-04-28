const moment = require("moment-timezone");
const { GoatBotApis } = global.utils;

module.exports = {
	config: {
		name: "texttoimage",
		aliases: ["midjourney", "openjourney", "text2image", "imagine3"],
		version: "2.0.0",
		author: "BOTX666 🪬",
		countDown: 10,
		role: 0,
		description: {
			en: "Create high-quality AI art from your imagination"
		},
		category: "ai-image",
		guide: {
			en: "   {pn} <আপনার কল্পনা>\n   উদাহরণ: {pn} a beautiful girl in traditional saree, 4k, cinematic lighting"
		}
	},

	onStart: async function ({ api, message, args, event, envGlobal }) {
		const { threadID, messageID } = event;
		const prompt = args.join(" ");

		// সময় ও তারিখ সেটআপ (Asia/Dhaka)
		const time = moment.tz("Asia/Dhaka").format("hh:mm:ss A");
		const date = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
		const sig = `\n━━━━━━━━━━━━━━━━━━━━\n┄┉❈✡️⋆⃝ 𖤍চাঁদের~পাহাড়𖤍 ⋆⃝🪬❈┉┄\n⏰ সময়: ${time}\n📅 তারিখ: ${date}`;

		if (!prompt) {
			return message.reply(`⚠️ চাঁদের পাহাড়, আপনি কী ধরনের ছবি তৈরি করতে চান তা লিখে দিন।${sig}`);
		}

		const goatBotApi = new GoatBotApis(envGlobal.goatbotApikey);
		if (!goatBotApi.isSetApiKey()) {
			return message.reply(`❗ GoatBot API Key সেট করা নেই। দয়া করে goatbot.tk থেকে কী সংগ্রহ করুন।${sig}`);
		}

		api.setMessageReaction("🎨", messageID, () => {}, true);

		try {
			// ইমেজ জেনারেশন রিকোয়েস্ট
			const { data: imageStream } = await goatBotApi.api({
				url: "/image/mdjrny",
				method: "GET",
				params: {
					prompt: prompt.trim(),
					style_id: 28,
					aspect_ratio: "1:1"
				},
				responseType: "stream"
			});

			imageStream.path = `ai_art_${Date.now()}.jpg`;

			api.setMessageReaction("✅", messageID, () => {}, true);

			return message.reply({
				body: `✨ 𝐀𝐈 𝐀𝐑𝐓 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃 ✨\n${"━".repeat(20)}\n📝 𝐏𝐫𝐨𝐦𝐩𝐭: ${prompt}${sig}`,
				attachment: imageStream
			});
		}
		catch (err) {
			api.setMessageReaction("❌", messageID, () => {}, true);
			console.error(err);
			const errorMsg = err.response?.data?.message || err.message;
			return message.reply(`❗ ছবি তৈরি করতে সমস্যা হয়েছে। সার্ভার ওভারলোড হতে পারে।\nত্রুটি: ${errorMsg}${sig}`);
		}
	}
};
