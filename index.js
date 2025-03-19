require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const PREFIX = "!t"; // Command prefix

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    if (args.length < 1) {
        return message.reply("⚠️ Please provide text to translate.");
    }

    const text = args.join(" ");
    const targetLang = "en"; // Default translation to English

    try {
        const response = await axios.post("https://translate.argosopentech.com/translate", {
            q: text,
            source: "auto",
            target: targetLang,
            format: "text"
        }, {
            headers: { "Content-Type": "application/json" }
        });

        if (response.data && response.data.translatedText) {
            message.reply(`**📝 Translated:** ${response.data.translatedText}`);
        } else {
            message.reply("⚠️ Translation failed. Try again later.");
        }
    } catch (error) {
        console.error("❌ Translation error:", error);
        message.reply("⚠️ Error translating text. API might be down or rate-limited.");
    }
});

client.login(process.env.BOT_TOKEN);