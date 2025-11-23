require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Please set BOT_TOKEN in environment.");
  process.exit(1);
}

const WEB_APP_URL = process.env.WEB_APP_URL || "https://tradexy.netlify.app/";
const COMMUNITY_INVITE_LINK =
  process.env.COMMUNITY_INVITE_LINK || "https://t.me/joinchat/XXXX";
const BANNER_IMAGE_URL =
  process.env.BANNER_IMAGE_URL ||
  "https://your-banner-image-url.com/banner.jpg";
const SOCIALS_LINK = process.env.SOCIALS_LINK || "https://twitter.com/genz";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("GenZ Bot is running...");

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name || "Player";

  const welcomeMessage = `Hey, @${username}! Welcome to GenZ 🎮

GenZ is a community-driven gaming platform where you can play multiple exciting games like Aviator & Color trade and win real money! 💰

🎯 Play games and compete with players worldwide
💎 Win real money with every game
🎮 Enjoy demo mode for free - no money needed, just pure fun!
🚀 Master your skills and climb the leaderboards

Invite your friends, relatives, and co-workers to join the game. The more players you bring in, the more rewards you earn! 💸

🫵🏻 Tap "Play Now" to start your gaming journey!`;

  // Inline keyboard for the photo message (shown below photo)
  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: "🎮 Play Now", web_app: { url: WEB_APP_URL } }],
      [{ text: "👥 Join Community", url: COMMUNITY_INVITE_LINK }],
      [{ text: "🌐 Socials", callback_data: "socials" }],
      [{ text: "❓ How it Works", callback_data: "how_it_works" }],
    ],
  };

  // Correct reply keyboard that appears in the input area (left side)
  // NOTE: field name is `is_persistent` (Telegram Bot API)
  const replyKeyboard = {
    keyboard: [[{ text: "🎮 Open GenZ", web_app: { url: WEB_APP_URL } }]],
    resize_keyboard: true,
    one_time_keyboard: false,
    is_persistent: true,
  };

  try {
    // Send a banner photo with inline keyboard below it
    await bot.sendPhoto(chatId, BANNER_IMAGE_URL, {
      caption: welcomeMessage,
      reply_markup: inlineKeyboard,
      parse_mode: "Markdown",
    });

    // Send a second message that ensures the reply keyboard is shown in the input area
    await bot.sendMessage(chatId, "👇 Quick access to GenZ:", {
      reply_markup: replyKeyboard,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    // fallback: at least send the plain message + keyboard
    await bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: inlineKeyboard,
      parse_mode: "Markdown",
    });
    await bot.sendMessage(chatId, "👇 Quick access to GenZ:", {
      reply_markup: replyKeyboard,
    });
  }
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    await bot.answerCallbackQuery(query.id, { text: "" });
  } catch (e) {
    // ignore answer errors
  }

  switch (data) {
    case "socials": {
      const socialsMessage = `🌐 Connect with GenZ on Social Media:

📱 Follow us for updates, tournaments, and exclusive rewards!

🔗 Links:
- Twitter/X: ${SOCIALS_LINK}
- Instagram: Coming Soon
- Discord: Coming Soon

Stay connected to never miss a game update! 🚀`;

      const socialsKeyboard = {
        inline_keyboard: [
          [{ text: "🐦 Follow on Twitter", url: SOCIALS_LINK }],
          [{ text: "« Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await bot.sendMessage(chatId, socialsMessage, {
        reply_markup: socialsKeyboard,
      });
      break;
    }

    case "how_it_works": {
      const howItWorksMessage = `❓ How GenZ Works:

🎮 Step 1: Choose Your Game
Browse through exciting games like Aviator, Dice, and more!

💰 Step 2: Select Your Mode
- Demo Mode: Practice for free with virtual coins
- Real Mode: Play with real money and win big!

🎯 Step 3: Play & Win
Master the game mechanics and compete for rewards

💎 Step 4: Withdraw Earnings
Cash out your winnings anytime to your preferred payment method

👥 Bonus: Invite Friends
Earn referral bonuses for every friend you bring to GenZ!

Ready to start? Tap "Play Now" below! 🚀`;

      const howItWorksKeyboard = {
        inline_keyboard: [
          [{ text: "🎮 Play Now", web_app: { url: WEB_APP_URL } }],
          [{ text: "« Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await bot.sendMessage(chatId, howItWorksMessage, {
        reply_markup: howItWorksKeyboard,
        parse_mode: "Markdown",
      });
      break;
    }

    case "back_to_menu": {
      const menuMessage = `🎮 GenZ Gaming Menu

Select an option below:`;

      const menuKeyboard = {
        inline_keyboard: [
          [{ text: "🎮 Play Now", web_app: { url: WEB_APP_URL } }],
          [{ text: "👥 Join Community", url: COMMUNITY_INVITE_LINK }],
          [{ text: "🌐 Socials", callback_data: "socials" }],
          [{ text: "❓ How it Works", callback_data: "how_it_works" }],
        ],
      };

      await bot.sendMessage(chatId, menuMessage, {
        reply_markup: menuKeyboard,
      });
      break;
    }
  }
});

// Handle plain messages (user clicking the reply keyboard button sends a normal message text)
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // ignore commands
  if (!text || text.startsWith("/")) return;

  if (text === "🎮 Open GenZ") {
    await bot.sendMessage(chatId, "🎮 Opening GenZ gaming platform...", {
      reply_markup: {
        inline_keyboard: [[{ text: "🚀 Launch GenZ", web_app: { url: WEB_APP_URL } }]],
      },
    });
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

process.on("SIGINT", () => {
  console.log("Stopping bot...");
  bot.stopPolling();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Stopping bot...");
  bot.stopPolling();
  process.exit(0);
});
