const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req,res)=>res.send('MavGrab running'));
app.listen(PORT, ()=>console.log('Server running'));
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });
const BOT_NAME = "MavGrab";
const OWNER = "Maverick";
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text) return;
  if (text === '/start') {
    return bot.sendMessage(chatId,
      `? ${BOT_NAME} online\n\nSend any Instagram reel/post link and I'll grab it for you.\n\nBuilt for ${OWNER}`
    );
  }
  if (/instagram\.com\/(reel|p|tv)\//.test(text)) {
    return handleInstagram(chatId, text);
  }
  bot.sendMessage(chatId, "Send a valid Instagram link.");
});
async function handleInstagram(chatId, url) {
  try {
    await bot.sendMessage(chatId, "? Fetching your reel...");
    const response = await axios.post('https://api.cobalt.tools/', {
      url: url
    }, {
      headers: { 'Accept': 'application/json' }
    });
    const data = response.data;
    let videoUrl;
    if (data.status === 'stream' || data.status === 'redirect') {
      videoUrl = data.url;
    } else if (data.status === 'picker') {
      videoUrl = data.picker[0].url;
    } else {
      return bot.sendMessage(chatId, "? Couldn't fetch this post.");
    }
    await bot.sendVideo(chatId, videoUrl, {
      caption: "? Downloaded via MavGrab"
    });
  } catch (err) {
    bot.sendMessage(chatId, "? Error while downloading.");
  }
}

