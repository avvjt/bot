// bot.js
const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-web-app.example.com';
const COMMUNITY_INVITE_LINK = process.env.COMMUNITY_INVITE_LINK || 'https://t.me/joinchat/XXXX';
const BANNER_URL = process.env.BANNER_URL || 'https://yourdomain.com/assets/genz-banner.jpg';

if (!BOT_TOKEN) {
  console.error('Please set BOT_TOKEN environment variable.');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Helper: build the inline keyboard (one horizontal row)
function mainInlineKeyboard() {
  return Markup.inlineKeyboard([
    // Use web_app if you want an in-telegram web app (Telegram Web Apps)
    Markup.button.webApp('Play', { url: WEB_APP_URL + '/play' }), 
    Markup.button.callback('Join Community', 'join_community'),
    Markup.button.callback('Socials', 'socials'),
    Markup.button.callback('How it works', 'how_it_works'),
  ], { columns: 4 });
}

// Build the persistent reply keyboard with "Open GenZ" on left
function persistentReplyKeyboard() {
  // This is a reply keyboard (shows below the message). Telegram supports keyboard buttons opening a web app:
  return Markup.keyboard([
    [ Markup.button.webApp('Open GenZ', { url: WEB_APP_URL }) ]
  ])
  .resize()
  .oneTime(false);
}

// /start handler
bot.start(async (ctx) => {
  try {
    const firstName = ctx.from?.first_name || ctx.from?.username || 'Player';
    // Send banner image first (either local file or remote URL)
    // If you host the file, put a URL; Telegraf accepts URLs for sendPhoto.
    await ctx.replyWithPhoto({ url: BANNER_URL }, {
      caption: `Hey, ${firstName}! Welcome to GenZ`,
    });

    // Send the improved welcome message and the inline keyboard + persistent reply keyboard
    const welcomeMessage = `Hey, ${firstName}! Welcome to *GenZ* — your gateway to fast, social skill-based gaming.\n\n` +
      `GenZ is a community-first gaming hub where you can play popular arcade-style games (like Aviator), try demo rounds for fun, and — when you're ready — play real-money matches. Invite friends to grow your clan and unlock more rewards. Tap *Play* or *Open GenZ* to jump into the web app. Good luck — and have fun! 🎮💸`;

    await ctx.replyWithMarkdown(welcomeMessage, Markup
      .keyboard([
        [ Markup.button.webApp('Open GenZ', { url: WEB_APP_URL }) ]
      ])
      .resize()
      .oneTime(false)
      .extra() // keep keyboard visible
    );

    // Send inline keyboard as a separate message so it appears horizontally
    await ctx.reply('Choose an option:', mainInlineKeyboard());
  } catch (err) {
    console.error('Error in /start:', err);
    await ctx.reply('Oops! Something went wrong while starting GenZ. Try again later.');
  }
});

// Play - web app opens (we used webApp button above). This is callback fallback if you want to handle non-webapp clicks.
bot.action('play', async (ctx) => {
  // not used if using webApp button. kept for completeness
  await ctx.answerCbQuery();
  await ctx.reply('Opening Play...'); // optional
});

// Join community
bot.action('join_community', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`Join our community: ${COMMUNITY_INVITE_LINK}`);
});

// Socials - show multiple social links
bot.action('socials', async (ctx) => {
  await ctx.answerCbQuery();
  const msg = `Follow GenZ:\n\n` +
    `• Twitter: https://twitter.com/yourhandle\n` +
    `• Instagram: https://instagram.com/yourhandle\n` +
    `• Discord: https://discord.gg/yourInvite\n` +
    `• YouTube: https://youtube.com/yourchannel`;
  await ctx.reply(msg);
});

// How it works
bot.action('how_it_works', async (ctx) => {
  await ctx.answerCbQuery();
  const how = `How GenZ works:\n\n` +
    `1. Tap *Play* to open the web app and pick a game.\n` +
    `2. Try the demo mode to practice (no money required).\n` +
    `3. When ready, switch to real play and place bets according to the game rules.\n` +
    `4. Invite friends to earn referral rewards and increase your earning potential.\n\n` +
    `We strongly recommend playing responsibly.`;
  await ctx.replyWithMarkdown(how);
});

// Optional: a handler that receives when the web app sends data back (if you use Telegram Web Apps)
bot.on('web_app_data', async (ctx) => {
  try {
    const data = ctx.message?.web_app_data?.data;
    await ctx.reply(`Received data from web app: ${data}`);
  } catch (err) {
    console.error('web_app_data error', err);
  }
});

// Start polling (for development). For production, consider webhooks.
bot.launch()
  .then(() => console.log('GenZ bot started (polling)'))
  .catch(err => console.error('Bot launch error', err));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));