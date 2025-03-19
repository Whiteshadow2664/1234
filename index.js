require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const PREFIX = "!t"; // Command prefix

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    if (args.length < 1) {
        return message.reply("Please provide text to translate.");
    }

    const text = args.join(" ");
    const targetLang = "EN"; // Change target language if needed

    try {
        const response = await axios.post("https://api-free.deepl.com/v2/translate", null, {
            params: {
                auth_key: DEEPL_API_KEY,
                text: text,
                target_lang: targetLang
            }
        });

        const translatedText = response.data.translations[0].text;
        message.reply(`**Translated:** ${translatedText}`);
    } catch (error) {
        console.error("Translation error:", error);
        message.reply("Error translating text. Please try again.");
    }
});

client.login(process.env.BOT_TOKEN);