const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const PREFIX = "!t";

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    if (args.length < 1) return message.reply("Please provide text to translate.");

    const text = args.join(" ");
    const targetLang = "en"; // Change as needed

    try {
        const response = await axios.post("https://libretranslate.com/translate", {
            q: text,
            source: "auto",
            target: targetLang,
            format: "text"
        });

        message.reply(`**Translated:** ${response.data.translatedText}`);
    } catch (error) {
        console.error("Translation error:", error);
        message.reply("Error translating text. Please try again.");
    }
});

client.login(process.env.BOT_TOKEN);