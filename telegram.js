const TelegramBot = require('node-telegram-bot-api');
const credentials = require('./credentials');

const bot = new TelegramBot(credentials.telegram_bot_token, {polling: true});

module.exports = {
    bot
}
