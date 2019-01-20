const TelegramBot = require('node-telegram-bot-api');
const credentials = require('./credentials');

const bot = new TelegramBot(credentials.telegram_bot_token, {polling: true});

bot.onText(/\/check (.+)/, (msg, match) => {
    // TODO: start puppeteer with telegram /check command
});