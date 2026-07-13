require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
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

const badWords = [
  "nami",
  "97boun",
  "zbo",
  "nega3rek",
  "na7wik",
  "nikk",
  "zokk",
  "rbk",
  "tiz",
  "NA3tizmok",
  "sowa",
  "7atchoun",
  "bazol",
  "ziza",
  "97ba",
  "zbi",
  "zb",
  "nik mok"
];
const LOG_CHANNEL_ID = "1525385648964632637";

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (badWords.some(word => message.content.toLowerCase().includes(word))) {

    await message.delete();

    await message.member.timeout(
      10 * 60 * 1000,
      "Bad words"
    );
    const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);

if (logChannel) {
  logChannel.send(
    `🛡️ **Moderation Log**\n\n` +
    `👤 User: ${message.author}\n` +
    `⚠️ Reason: Bad words\n` +
    `⏱️ Timeout: 10 minutes\n` +
    `💬 Message: ${message.content}`
  );
}

  }
});
client.login(process.env.TOKEN);