module.exports.config = {
	name: "unsendv22",
	version: "2.6.0",
	hasPermssion: 0,
	credits: "Belal x Gemini",
	description: "নির্দিষ্ট ইমোজি রিঅ্যাকশন দিলে বটের মেসেজ আনসেন্ড হবে",
	commandCategory: "System",
	usages: "[মেসেজে রিঅ্যাকশন দিন: ✡️ 🚫 😡 🛑 ❌ ⚠️ 🚮]",
	cooldowns: 0
};

// ১. কমান্ডের মাধ্যমে আনসেন্ড (Reply to unsend)
module.exports.run = async function({ api, event }) {
	if (event.type != "message_reply") {
		return api.sendMessage("⚠️ বটের যে মেসেজটি মুছতে চান সেটিতে রিপ্লাই দিয়ে 'unsend' লিখুন।", event.threadID, event.messageID);
	}
	if (event.messageReply.senderID != api.getCurrentUserID()) {
		return api.sendMessage("⛔ শুধু বটের মেসেজ আনসেন্ড করা যাবে!", event.threadID, event.messageID);
	}
	return api.unsendMessage(event.messageReply.messageID);
}

// ২. নির্দিষ্ট ইমোজি রিঅ্যাকশন দিলে ডিলিট হওয়ার লজিক
module.exports.handleReaction = async function({ api, event, handleReaction }) {
	const { reaction, userID } = event;
	
	// আপনার দেওয়া ইমোজি লিস্ট
	const deleteTriggers = ["✡️", "🚫", "😡", "🛑", "❌", "⚠️", "🚮"];

	if (deleteTriggers.includes(reaction)) {
		try {
			return api.unsendMessage(handleReaction.messageID);
		} catch (e) {
			console.log("Error unsending message:", e);
		}
	}
};

// ৩. ইভেন্ট হ্যান্ডলার (মেসেজ পাঠানোর সময় রিঅ্যাকশন ট্র্যাকার সেট করা)
module.exports.handleEvent = async function({ api, event }) {
	const { threadID, messageID, senderID, type, body, messageReply } = event;
	const botID = api.getCurrentUserID();

	// বট যখনই কোনো মেসেজ দিবে, সেটাকে রিঅ্যাকশন লিস্টে পুশ করবে
	if (senderID == botID && type == "message") {
		global.client.handleReaction.push({
			name: this.config.name,
			messageID: messageID,
			author: senderID 
		});
	}

	// বটের মেসেজে রিপ্লাই দিয়ে ইমোজি লিখে পাঠালেও আনসেন্ড হবে
	const deleteTriggers = ["✡️", "🚫", "😡", "🛑", "❌", "⚠️", "🚮"];
	if (type == "message_reply" && messageReply.senderID == botID) {
		if (deleteTriggers.includes(body.trim())) {
			return api.unsendMessage(messageReply.messageID);
		}
	}
};
