const schedule = require('node-schedule');
const axios = require('axios');
const fs = require("fs-extra");

module.exports.config = {
  name: "3card",
  version: "66.0.0",
  hasPermssion: 0,
  credits: "Belal x Gemini",
  description: "৩ কার্ড গ্যাম্বলিং ড্যাশবোর্ড (বিলাসবহুল ডিজাইন)",
  commandCategory: "Game",
  usages: "[start/join/info/leave]",
  cooldowns: 5
};

const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const suits = ["spades", "hearts", "diamonds", "clubs"];
const deck = [];

for (let i = 0; i < values.length; i++) {
  for (let x = 0; x < suits.length; x++) {
    let weight = parseInt(values[i]);
    if (["J", "Q", "K"].includes(values[i])) weight = 10;
    else if (values[i] == "A") weight = 11;

    const card = {
      Value: values[i],
      Suit: suits[x],
      Weight: weight,
      Icon: suits[x] == "spades" ? "♠️" : suits[x] == "hearts" ? "♥️" : suits[x] == "diamonds" ? "♦️" : "♣️"
    };
    deck.push(card);
  }
}

function createDeck() {
  const deckShuffled = [...deck];
  for (let i = 0; i < 1000; i++) {
    const loc1 = Math.floor(Math.random() * deckShuffled.length);
    const loc2 = Math.floor(Math.random() * deckShuffled.length);
    const tmp = deckShuffled[loc1];
    deckShuffled[loc1] = deckShuffled[loc2];
    deckShuffled[loc2] = tmp;
  }
  return deckShuffled;
}

function getCardLink(Value, Suit) {
  return `https://raw.githubusercontent.com/ntkhang03/poker-cards/main/cards/${Value == "J" ? "jack" : Value == "Q" ? "queen" : Value == "K" ? "king" : Value == "A" ? "ace" : Value}_of_${Suit}.png`;
}

async function drawCard(cards) {
  const Canvas = require("canvas");
  const canvas = Canvas.createCanvas(500 * cards.length, 726);
  const ctx = canvas.getContext("2d");
  let x = 0;
  for (const card of cards) {
    const img = await Canvas.loadImage(card);
    ctx.drawImage(img, x, 0);
    x += 500;
  }
  return canvas.toBuffer();
}

module.exports.handleEvent = async ({ Currencies, event, api, Users }) => {
  const fs = require("fs-extra");
  const { senderID, threadID, body, messageID } = event;

  if (!body) return;
  if (!global.moduleData.threecards) global.moduleData.threecards = new Map();
  if (!global.moduleData.threecards.has(threadID)) return;

  const values = global.moduleData.threecards.get(threadID);
  if (values.start != 1) return;

  const deckShuffled = values.deckShuffled;

  if (body.toLowerCase().startsWith("deal cards")) {
    if (senderID !== values.author) return api.sendMessage("কেবলমাত্র হোস্ট কার্ড ডিল করতে পারবেন।", threadID, messageID);
    if (values.dealt == 1) return;

    for (const player of values.player) {
      const card1 = deckShuffled.shift();
      const card2 = deckShuffled.shift();
      const card3 = deckShuffled.shift();

      let total = card1.Weight + card2.Weight + card3.Weight;
      total = total % 10;

      player.card1 = card1;
      player.card2 = card2;
      player.card3 = card3;
      player.total = total;

      const cardLinks = [getCardLink(card1.Value, card1.Suit), getCardLink(card2.Value, card2.Suit), getCardLink(card3.Value, card3.Suit)];
      const pathSave = __dirname + `/cache/card_${player.id}.png`;
      fs.writeFileSync(pathSave, await drawCard(cardLinks));

      api.sendMessage({
        body: `╭┈──────────┈╮\n   🃏 𝗕𝗘𝗟𝗔𝗟 𝗖𝗔𝗦𝗜𝗡𝗢 🃏\n╰┈──────────┈╯\n🌸 আপনার কার্ড: ${card1.Value}${card1.Icon} | ${card2.Value}${card2.Icon} | ${card3.Value}${card3.Icon}\n✨ পয়েন্ট: ${total}\n━━━━━━━━━━━━━━\nআপনি ২বার কার্ড সোয়াপ করতে পারবেন।`,
        attachment: fs.createReadStream(pathSave)
      }, player.id, (err) => {
        if (err) api.sendMessage(`ইউজারকে কার্ড পাঠানো যায়নি: ${player.id}`, threadID);
        fs.unlinkSync(pathSave);
      });
    }

    values.dealt = 1;
    global.moduleData.threecards.set(threadID, values);
    return api.sendMessage("🎲 কার্ড ডিল করা হয়েছে! প্রত্যেকের ইনবক্স চেক করুন। 'Ready' লিখে রেজাল্ট দেখুন।", threadID);
  }

  if (body.toLowerCase().startsWith("swap card")) {
    const player = values.player.find(p => p.id == senderID);
    if (!player || values.dealt != 1) return;
    if (player.swaps == 0) return api.sendMessage("আপনার সোয়াপ করার সুযোগ শেষ।", threadID, messageID);
    if (player.ready) return api.sendMessage("আপনি অলরেডি রেডি দিয়েছেন!", threadID, messageID);

    const cards = ["card1", "card2", "card3"];
    player[cards[Math.floor(Math.random() * cards.length)]] = deckShuffled.shift();
    player.total = (player.card1.Weight + player.card2.Weight + player.card3.Weight) % 10;
    player.swaps -= 1;

    const cardLinks = [getCardLink(player.card1.Value, player.card1.Suit), getCardLink(player.card2.Value, player.card2.Suit), getCardLink(player.card3.Value, player.card3.Suit)];
    const pathSave = __dirname + `/cache/swap_${player.id}.png`;
    fs.writeFileSync(pathSave, await drawCard(cardLinks));

    return api.sendMessage({
      body: `🔄 কার্ড সোয়াপ সফল!\nনতুন কার্ড: ${player.card1.Value}${player.card1.Icon} | ${player.card2.Value}${player.card2.Icon} | ${player.card3.Value}${player.card3.Icon}\nপয়েন্ট: ${player.total}`,
      attachment: fs.createReadStream(pathSave)
    }, player.id, (err) => {
      fs.unlinkSync(pathSave);
    });
  }

  if (body.toLowerCase().startsWith("ready")) {
    const player = values.player.find(p => p.id == senderID);
    if (!player || values.dealt != 1 || player.ready) return;

    values.ready += 1;
    player.ready = true;

    if (values.player.length == values.ready) {
      values.player.sort((a, b) => b.total - a.total);
      const winner = values.player[0];
      let ranking = [];
      
      for (let i = 0; i < values.player.length; i++) {
        const name = await Users.getNameUser(values.player[i].id);
        ranking.push(`${i + 1}. ${name} — ${values.player[i].total} পয়েন্ট`);
      }

      const winAmount = values.betAmount * values.player.length;
      await Currencies.increaseMoney(winner.id, winAmount);
      global.moduleData.threecards.delete(threadID);

      return api.sendMessage(`🏆 𝗚𝗔𝗠𝗘 𝗥𝗘𝗦𝗨𝗟𝗧𝗦 🏆\n━━━━━━━━━━━━━━\n${ranking.join("\n")}\n━━━━━━━━━━━━━━\n👑 বিজয়ী: ${await Users.getNameUser(winner.id)}\n💰 প্রাইজ মানি: ${winAmount}$`, threadID);
    } else {
      return api.sendMessage(`✅ রেডি! এখনো বাকি: ${values.player.length - values.ready} জন।`, threadID);
    }
  }
}

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { senderID, threadID, messageID } = event;
  const fs = require("fs-extra");
  const axios = require("axios");
  const path = __dirname + "/cache/3cards_main.png";

  if (!global.moduleData.threecards) global.moduleData.threecards = new Map();
  const values = global.moduleData.threecards.get(threadID) || {};

  if (!args[0]) {
    const imageStream = (await axios.get("https://i.imgur.com/VGdyICK.jpeg", { responseType: 'stream' })).data;
    return api.sendMessage({
      body: `╭┈──────────────┈╮\n   ⚜️ 𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧𝗫𝟲𝟲𝟲 𝗖𝗔𝗦𝗜𝗡𝗢 ⚜️\n╰┈──────────────┈╯\n\n[ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 ]\n━━━━━━━━━━━━━━━\n» 3card create [টাকা] - টেবিল খুলুন\n» 3card join - খেলায় যোগ দিন\n» 3card start - খেলা শুরু করুন\n» Deal Cards - কার্ড ডিল (হোস্ট)\n» Swap Card - কার্ড বদলান\n» Ready - রেজাল্ট দেখুন\n━━━━━━━━━━━━━━━\n[ 𝗨𝗹𝘁𝗿𝗮 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗚𝗮𝗺𝗶𝗻𝗴 ]`,
      attachment: imageStream
    }, threadID);
  }

  const data = await Currencies.getData(senderID);
  const money = data.money;

  switch (args[0]) {
    case "create": {
      if (global.moduleData.threecards.has(threadID)) return api.sendMessage("এই গ্রুপে অলরেডি একটি গেম চলছে।", threadID);
      const bet = parseInt(args[1]);
      if (isNaN(bet) || bet < 50) return api.sendMessage("সর্বনিম্ন ৫০$ বেট ধরতে হবে।", threadID);
      if (money < bet) return api.sendMessage(`আপনার কাছে পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজন: ${bet}$`, threadID);

      await Currencies.decreaseMoney(senderID, bet);
      global.moduleData.threecards.set(threadID, {
        author: senderID, start: 0, dealt: 0, ready: 0,
        player: [{ id: senderID, card1: 0, card2: 0, card3: 0, swaps: 2, ready: false }],
        betAmount: bet
      });
      return api.sendMessage(`✅ ৩ কার্ড টেবিল তৈরি হয়েছে!\n💰 বেট: ${bet}$\nঅন্যরা '3card join' লিখে যোগ দিন।`, threadID);
    }
    case "join": {
      if (!values.player) return api.sendMessage("আগে টেবিল তৈরি করুন।", threadID);
      if (values.start == 1) return api.sendMessage("গেম অলরেডি শুরু হয়ে গেছে।", threadID);
      if (money < values.betAmount) return api.sendMessage("আপনার কাছে পর্যাপ্ত টাকা নেই।", threadID);
      if (values.player.find(p => p.id == senderID)) return api.sendMessage("আপনি অলরেডি জয়েন করেছেন।", threadID);

      values.player.push({ id: senderID, card1: 0, card2: 0, card3: 0, total: 0, swaps: 2, ready: false });
      await Currencies.decreaseMoney(senderID, values.betAmount);
      return api.sendMessage("🃏 আপনি সফলভাবে ক্যাসিনোতে যোগ দিয়েছেন!", threadID);
    }
    case "start": {
      if (values.author != senderID) return api.sendMessage("শুধু হোস্ট গেম শুরু করতে পারবেন।", threadID);
      if (values.player.length < 2) return api.sendMessage("খেলার জন্য কমপক্ষে ২ জন লাগবে।", threadID);
      values.deckShuffled = createDeck();
      values.start = 1;
      return api.sendMessage("🚀 গেম শুরু! হোস্ট এখন 'Deal Cards' লিখুন।", threadID);
    }
    case "leave": {
        if (values.start == 1) return api.sendMessage("গেম চলাকালীন পালানো নিষেধ!", threadID);
        if (values.author == senderID) {
            global.moduleData.threecards.delete(threadID);
            return api.sendMessage("হোস্ট টেবিল ভেঙে দিয়েছে।", threadID);
        }
        values.player = values.player.filter(p => p.id != senderID);
        return api.sendMessage("আপনি টেবিল ছেড়ে চলে গেছেন।", threadID);
    }
    default: return api.sendMessage("ভুল কমান্ড! সঠিক ভাবে ব্যবহার করুন।", threadID);
  }
};
