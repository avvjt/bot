require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN =
  process.env.BOT_TOKEN || "8257396483:AAHy5ZJwvfy16QeqOnbZh-g-1sEMdcJruFk";
const WEB_APP_URL = process.env.WEB_APP_URL || "https://tradexy.netlify.app/";
const COMMUNITY_INVITE_LINK =
  process.env.COMMUNITY_INVITE_LINK || "https://t.me/joinchat/XXXX";
const BANNER_IMAGE_URL =
  process.env.BANNER_IMAGE_URL ||
  "https://your-banner-image-url.com/banner.jpg";
const SOCIALS_LINK = process.env.SOCIALS_LINK || "https://twitter.com/genz";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("GenZ Bot is running...");

// Build the persistent reply keyboard (same as in your previous code)
function getPersistentKeyboard() {
  return {
    keyboard: [
      [{ text: "🎮 Open GenZ", web_app: { url: WEB_APP_URL } }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

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

  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: "🎮 Play Now", web_app: { url: WEB_APP_URL } }],
      [{ text: "👥 Join Community", url: COMMUNITY_INVITE_LINK }],
      [{ text: "🌐 Socials", callback_data: "socials" }],
      [{ text: "❓ How it Works", callback_data: "how_it_works" }],
    ],
  };

  try {
    // Send banner with inline keyboard
    await bot.sendPhoto(chatId, BANNER_IMAGE_URL, {
      caption: welcomeMessage,
      reply_markup: inlineKeyboard,
      parse_mode: "Markdown",
    });

    // Send a separate message with the PERSISTENT reply keyboard
    // This will make "Open GenZ" appear at the bottom left of the keyboard
    await bot.sendMessage(chatId, "Quick access:", {
      reply_markup: getPersistentKeyboard()
    });
  } catch (error) {
    console.error("Error sending message:", error);
    
    // Fallback: send welcome message without photo
    await bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: inlineKeyboard,
      parse_mode: "Markdown",
    });
    
    // Still send the persistent keyboard
    await bot.sendMessage(chatId, "Quick access:", {
      reply_markup: getPersistentKeyboard()
    });
  }
});

// Alternative approach: If you want the persistent keyboard to be the MAIN keyboard
// you can modify the /start handler like this:
bot.onText(/\/start2/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name || "Player";

  const welcomeMessage = `Hey, @${username}! Welcome to GenZ 🎮

Your gaming adventure starts here!`;

  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: "🎮 Play Now", web_app: { url: WEB_APP_URL } }],
      [{ text: "👥 Join Community", url: COMMUNITY_INVITE_LINK }],
      [{ text: "🌐 Socials", callback_data: "socials" }],
      [{ text: "❓ How it Works", callback_data: "how_it_works" }],
    ],
  };

  try {
    // Send banner with inline keyboard AND persistent reply keyboard
    await bot.sendPhoto(chatId, BANNER_IMAGE_URL, {
      caption: welcomeMessage,
      reply_markup: getPersistentKeyboard(), // This makes "Open GenZ" appear below the input field
    });

    // Send inline keyboard as separate message
    await bot.sendMessage(chatId, "Choose an option:", {
      reply_markup: inlineKeyboard
    });
  } catch (error) {
    console.error("Error sending message:", error);
    await bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: getPersistentKeyboard(),
    });
    await bot.sendMessage(chatId, "Choose an option:", {
      reply_markup: inlineKeyboard
    });
  }
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  switch (data) {
    case "socials":
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

    case "how_it_works":
      const howItWorksMessage = `❓ How GenZ Works:

🎮 **Step 1: Choose Your Game**
Browse through exciting games like Aviator, Dice, and more!

💰 **Step 2: Select Your Mode**
- Demo Mode: Practice for free with virtual coins
- Real Mode: Play with real money and win big!

🎯 **Step 3: Play & Win**
Master the game mechanics and compete for rewards

💎 **Step 4: Withdraw Earnings**
Cash out your winnings anytime to your preferred payment method

👥 **Bonus: Invite Friends**
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

    case "back_to_menu":
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
});

// Handle the "Open GenZ" button press
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text && text.startsWith("/")) return;

  if (text === "🎮 Open GenZ") {
    await bot.sendMessage(chatId, "🎮 Opening GenZ gaming platform...", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🚀 Launch GenZ", web_app: { url: WEB_APP_URL } }],
        ],
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