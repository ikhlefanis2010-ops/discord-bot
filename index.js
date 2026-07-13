require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});


const GUILD_ID = "1525098538718072924";
const CHANNEL_ID = "1525116780979294250";

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    const guild = client.guilds.cache.get(GUILD_ID);

    joinVoiceChannel({
        channelId: CHANNEL_ID,
        guildId: GUILD_ID,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
    });

    console.log("Bot joined the voice channel!");
});

client.login(process.env.TOKEN);