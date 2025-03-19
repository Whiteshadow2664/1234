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

// Allowed languages (ISO codes)
const SUPPORTED_LANGS = ["en", "de", "fr", "ru"];

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    if (args.length < 2) {
        return message.reply("⚠️ Usage: `!t <target_language> <text>`\nExample: `!t fr Hello`");
    }

    let targetLang = args.shift().toLowerCase(); // First word is target language
    const text = args.join(" ");

    // Validate target language
    if (!SUPPORTED_LANGS.includes(targetLang)) {
        return message.reply(`⚠️ Invalid target language. Choose from: **${SUPPORTED_LANGS.join(", ")}**`);
    }

    try {
        // 🔹 Step 1: Detect input language
        const detectRes = await axios.get(`https://api.mymemory.translated.net/get`, {
            params: { q: text, langpair: "en|it" } // Trick MyMemory to detect language
        });

        let detectedLang = detectRes.data.responseData.detectedLanguage || "en";

        // 🔹 Step 2: Ensure valid translation direction
        if (detectedLang === targetLang) {
            return message.reply(`⚠️ The text is already in **${targetLang.toUpperCase()}**.`);
        }
        if (!SUPPORTED_LANGS.includes(detectedLang)) {
            return message.reply("⚠️ The detected language is not supported.");
        }

        // 🔹 Step 3: Translate
        const response = await axios.get(`https://api.mymemory.translated.net/get`, {
            params: {
                q: text,
                langpair: `${detectedLang}|${targetLang}`
            }
        });

        const translatedText = response.data.responseData.translatedText;

        if (translatedText && translatedText.toLowerCase() !== text.toLowerCase()) {
            message.reply(`**📝 Translated (${detectedLang} → ${targetLang}):** ${translatedText}`);
        } else {
            message.reply("⚠️ No meaningful translation found.");
        }
    } catch (error) {
        console.error("❌ Translation error:", error);
        message.reply("⚠️ Error translating text. API might be down or rate-limited.");
    }
});

client.login(process.env.BOT_TOKEN);