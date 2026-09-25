require("dotenv").config();

const http = require("http");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

const BOT_TOKEN = process.env.BOT_TOKEN;

const WEB_APP_URL =
  process.env.WEB_APP_URL || "https://cryptomintx.co.in";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://backendxmint.onrender.com";

const COMMUNITY_INVITE_LINK =
  process.env.COMMUNITY_INVITE_LINK ||
  "https://t.me/CryptomintxBot";

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not configured");
}

if (!process.env.TELEGRAM_BOT_LINK_SECRET) {
  throw new Error("TELEGRAM_BOT_LINK_SECRET is not configured");
}

const bot = new TelegramBot(BOT_TOKEN, {
  polling: true,
});

console.log("CryptoMintX Telegram Bot is running...");

// ============================================================
// RENDER HEALTH SERVER
// ============================================================

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        status: "ok",
        service: "CryptoMintX Telegram Bot",
      })
    );

    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/plain",
  });

  res.end("CryptoMintX Telegram Bot is running.");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Health server running on port ${PORT}`);
});

// ============================================================
// MINI APP URL
// ============================================================

const TELEGRAM_AUTH_URL = `${WEB_APP_URL}/telegram-auth`;

// ============================================================
// BANNER IMAGE
// ============================================================

// Banner should be inside the bot root directory.
// Supported names:
// banner.jpg
// banner.jpeg
// banner.png
// banner.webp

const possibleBannerFiles = [
  "banner.jpg",
  "banner.jpeg",
  "banner.png",
  "banner.webp",
];

let BANNER_IMAGE_PATH = null;

for (const fileName of possibleBannerFiles) {
  const filePath = path.join(__dirname, fileName);

  if (fs.existsSync(filePath)) {
    BANNER_IMAGE_PATH = filePath;
    break;
  }
}

if (BANNER_IMAGE_PATH) {
  console.log(
    `Telegram banner found: ${path.basename(BANNER_IMAGE_PATH)}`
  );
} else {
  console.log(
    "No banner image found. /start will use text-only fallback."
  );
}

// ============================================================
// START
// ============================================================

bot.onText(/^\/start(?:\s+(.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "there";

  // Token supplied after /start
  const linkToken = match?.[1]?.trim();

  // ==========================================================
  // TELEGRAM ACCOUNT LINKING
  // ==========================================================

  if (linkToken) {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/auth/telegram/complete-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-telegram-bot-secret":
              process.env.TELEGRAM_BOT_LINK_SECRET,
          },
          body: JSON.stringify({
            token: linkToken,
            telegramUser: {
              id: msg.from.id,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        await bot.sendMessage(
          chatId,
          `
❌ <b>Telegram linking failed</b>

${data.message || "The link token is invalid or expired."}

Please generate a new Telegram connection from your CryptoMintX profile.
`,
          {
            parse_mode: "HTML",
          }
        );

        return;
      }

      await bot.sendMessage(
        chatId,
        `
✅ <b>Telegram Connected!</b>

Your Telegram account has been successfully connected to your CryptoMintX account.

You can now open CryptoMintX directly from Telegram.
`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚀 Open CryptoMintX",
                  web_app: {
                    url: TELEGRAM_AUTH_URL,
                  },
                },
              ],
            ],
          },
        }
      );

      return;
    } catch (error) {
      console.error("TELEGRAM LINK ERROR:", error);

      await bot.sendMessage(
        chatId,
        `
❌ <b>Unable to connect Telegram</b>

Please try generating a new connection from your CryptoMintX profile.
`,
        {
          parse_mode: "HTML",
        }
      );

      return;
    }
  }

  // ==========================================================
  // NORMAL START
  // ==========================================================

  const welcomeMessage = `
👋 Welcome to <b>CryptoMintX</b>, ${firstName}!

Your simple platform for managing and exploring digital assets.

📊 Explore live crypto markets
💰 Manage your wallet
🤖 Use Auto Trade
👥 Track your referral network
🔐 Manage your account securely

Tap <b>Open CryptoMintX</b> to get started.
`;

  // ==========================================================
  // MAIN INLINE MENU
  // ==========================================================

  const inlineKeyboard = {
    inline_keyboard: [
      // Open dashboard
      [
        {
          text: "🚀 Open CryptoMintX",
          web_app: {
            url: TELEGRAM_AUTH_URL,
          },
        },
      ],

      // Markets
      [
        {
          text: "📊 Markets",
          web_app: {
            url: `${TELEGRAM_AUTH_URL}?redirect=/markets`,
          },
        },
      ],

      // Wallet
      [
        {
          text: "💰 Wallet",
          web_app: {
            url: `${TELEGRAM_AUTH_URL}?redirect=/wallet`,
          },
        },
      ],

      // Auto Trade + Team
      [
        {
          text: "🤖 Auto Trade",
          web_app: {
            url: `${TELEGRAM_AUTH_URL}?redirect=/trade`,
          },
        },
        {
          text: "👥 Team",
          web_app: {
            url: `${TELEGRAM_AUTH_URL}?redirect=/team`,
          },
        },
      ],

      // Community
      [
        {
          text: "👥 Community",
          url: COMMUNITY_INVITE_LINK,
        },
      ],

      // Help
      [
        {
          text: "❓ Help",
          callback_data: "help",
        },
      ],
    ],
  };

  // ==========================================================
  // REPLY KEYBOARD
  // ==========================================================

  const replyKeyboard = {
    keyboard: [
      [
        {
          text: "🚀 Open CryptoMintX",
          web_app: {
            url: TELEGRAM_AUTH_URL,
          },
        },
      ],
    ],
    resize_keyboard: true,
    persistent: true,
    one_time_keyboard: false,
  };

  try {
    // ========================================================
    // SEND BANNER + WELCOME MESSAGE
    // ========================================================

    if (BANNER_IMAGE_PATH) {
      await bot.sendPhoto(chatId, BANNER_IMAGE_PATH, {
        caption: welcomeMessage,
        reply_markup: inlineKeyboard,
        parse_mode: "HTML",
      });
    } else {
      // Fallback if banner doesn't exist
      await bot.sendMessage(chatId, welcomeMessage, {
        reply_markup: inlineKeyboard,
        parse_mode: "HTML",
      });
    }

    // ========================================================
    // QUICK ACCESS
    // ========================================================

    await bot.sendMessage(
      chatId,
      "👇 Quick access to CryptoMintX:",
      {
        reply_markup: replyKeyboard,
      }
    );
  } catch (error) {
    console.error("START ERROR:", error);

    // ========================================================
    // FINAL TEXT FALLBACK
    // ========================================================

    try {
      await bot.sendMessage(chatId, welcomeMessage, {
        reply_markup: inlineKeyboard,
        parse_mode: "HTML",
      });

      await bot.sendMessage(
        chatId,
        "👇 Quick access to CryptoMintX:",
        {
          reply_markup: replyKeyboard,
        }
      );
    } catch (fallbackError) {
      console.error(
        "START FALLBACK ERROR:",
        fallbackError
      );
    }
  }
});

// ============================================================
// CALLBACK BUTTONS
// ============================================================

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    await bot.answerCallbackQuery(query.id);

    switch (data) {
      // ------------------------------------------------------
      // HELP
      // ------------------------------------------------------

      case "help": {
        const helpMessage = `
🆘 <b>CryptoMintX Help</b>

Need assistance with your account?

You can use the CryptoMintX platform to:

📊 Explore markets
💰 Manage your wallet
🤖 Use Auto Trade
👥 Manage your referral activity

Open CryptoMintX to access your account.
`;

        const helpKeyboard = {
          inline_keyboard: [
            [
              {
                text: "🚀 Open CryptoMintX",
                web_app: {
                  url: TELEGRAM_AUTH_URL,
                },
              },
            ],

            [
              {
                text: "« Back to Menu",
                callback_data: "back_to_menu",
              },
            ],
          ],
        };

        await bot.sendMessage(
          chatId,
          helpMessage,
          {
            reply_markup: helpKeyboard,
            parse_mode: "HTML",
          }
        );

        break;
      }

      // ------------------------------------------------------
      // BACK TO MENU
      // ------------------------------------------------------

      case "back_to_menu": {
        const menuMessage = `
🚀 <b>CryptoMintX</b>

What would you like to open?
`;

        const menuKeyboard = {
          inline_keyboard: [
            // Dashboard
            [
              {
                text: "🚀 Open CryptoMintX",
                web_app: {
                  url: TELEGRAM_AUTH_URL,
                },
              },
            ],

            // Markets
            [
              {
                text: "📊 Markets",
                web_app: {
                  url: `${TELEGRAM_AUTH_URL}?redirect=/markets`,
                },
              },
            ],

            // Wallet
            [
              {
                text: "💰 Wallet",
                web_app: {
                  url: `${TELEGRAM_AUTH_URL}?redirect=/wallet`,
                },
              },
            ],

            // Auto Trade + Team
            [
              {
                text: "🤖 Auto Trade",
                web_app: {
                  url: `${TELEGRAM_AUTH_URL}?redirect=/trade`,
                },
              },
              {
                text: "👥 Team",
                web_app: {
                  url: `${TELEGRAM_AUTH_URL}?redirect=/team`,
                },
              },
            ],

            // Community
            [
              {
                text: "👥 Community",
                url: COMMUNITY_INVITE_LINK,
              },
            ],

            // Help
            [
              {
                text: "❓ Help",
                callback_data: "help",
              },
            ],
          ],
        };

        await bot.sendMessage(
          chatId,
          menuMessage,
          {
            reply_markup: menuKeyboard,
            parse_mode: "HTML",
          }
        );

        break;
      }
    }
  } catch (error) {
    console.error("CALLBACK ERROR:", error);
  }
});

// ============================================================
// NORMAL MESSAGES
// ============================================================

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith("/")) {
    return;
  }

  if (text === "🚀 Open CryptoMintX") {
    await bot.sendMessage(
      chatId,
      "🚀 Opening CryptoMintX...",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Launch CryptoMintX",
                web_app: {
                  url: TELEGRAM_AUTH_URL,
                },
              },
            ],
          ],
        },
      }
    );
  }
});

// ============================================================
// ERRORS
// ============================================================

bot.on("polling_error", (error) => {
  console.error("Telegram polling error:", error);
});

// ============================================================
// PROCESS SHUTDOWN
// ============================================================

process.on("SIGINT", () => {
  console.log("Stopping CryptoMintX bot...");

  bot.stopPolling();
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("Stopping CryptoMintX bot...");

  bot.stopPolling();
  server.close(() => {
    process.exit(0);
  });
});