require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Missing TELEGRAM_BOT_TOKEN in env");
  process.exit(1);
}

const GAME_URL_BASE = process.env.GAME_URL_BASE || 'https://your-game-site.example'; // set when deploying

const bot = new Telegraf(BOT_TOKEN);

// helper to make Play button (with optional param)
function playKeyboard(userId) {
  // build a URL with start param for tracking: ?start=userid
  const url = `${GAME_URL_BASE}?start=${encodeURIComponent(userId)}`;
  return Markup.inlineKeyboard([
    Markup.button.url('🎮 Play Now', url),
    Markup.button.callback('Share', 'share'),
  ]);
}

// /start
bot.start((ctx) => {
  const uid = ctx.from && ctx.from.id ? ctx.from.id : 'anon';
  const name = ctx.from.first_name || 'Player';
  ctx.reply(
    `Hi ${name}! 👋\nWelcome — click Play Now to open the game.`,
    playKeyboard(uid)
  );
});

// /help
bot.help((ctx) => {
  ctx.reply(
    `/play - open the game\n/leaderboard - view top players (demo)\n/stats - your stats`
  );
});

// /play
bot.command('play', (ctx) => {
  const uid = ctx.from.id;
  ctx.reply('Opening the game...', playKeyboard(uid));
});

// /stats (demo)
bot.command('stats', (ctx) => {
  // in a real app fetch from DB
  ctx.reply(`Your stats (demo):\nGames played: 5\nHigh score: 12345`);
});

// /leaderboard (demo)
bot.command('leaderboard', (ctx) => {
  ctx.reply(`🏆 Leaderboard (demo):\n1) Alice - 50k\n2) Bob - 40k\n3) You - 12k`);
});

// handle callback queries
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  if (data === 'share') {
    await ctx.answerCbQuery('Share this game with your friends!');
    await ctx.reply('Invite link:\nhttps://t.me/YourBotUsername');
  } else {
    await ctx.answerCbQuery();
  }
});

// optional: handle inline queries (search-style)
bot.on('inline_query', async (ctx) => {
  // small example — returns a link to your game
  const query = ctx.inlineQuery.query || '';
  const results = [{
    type: 'article',
    id: '1',
    title: 'Play the Game',
    input_message_content: {
      message_text: `Play the game here: ${GAME_URL_BASE}`
    },
    description: 'Open the game in your browser'
  }];
  await ctx.answerInlineQuery(results);
});

// error handling
bot.catch((err) => {
  console.error('Bot error', err);
});

// Start bot (long polling)
bot.launch()
  .then(() => console.log('Bot started (polling)'))
  .catch(err => console.error('Failed to launch bot', err));

// graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
