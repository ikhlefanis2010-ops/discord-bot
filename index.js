require('dotenv').config();
const fs = require("fs");

let database = require("./database.json");

function saveDatabase() {
  fs.writeFileSync(
    "./database.json",
    JSON.stringify(database, null, 2)
  );
}

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ]
});

const GUILD_ID = "1525098538718072924";
const CHANNEL_ID = "1525116780979294250";
const STATS_CATEGORY_ID = "1526330699517526158";

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const guild = client.guilds.cache.get(GUILD_ID);
    await guild.members.fetch();

    if (!guild) {
        console.log("Guild not found!");
        return;
    }

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

    return;
  }


  // هنا يكون !rank خارج فلتر السب
  if (message.content === "!rank") {

    if (!database.users) database.users = {};

    if (!database.users[message.author.id]) {
      database.users[message.author.id] = {
        xp: 0,
        level: 1
      };
    }

    const rank = database.users[message.author.id];

    message.reply(
`🏆 **Rank**

👤 User: ${message.author}
⭐ Level: ${rank.level}
✨ XP: ${rank.xp}/${rank.level * 100}`
    );

    saveDatabase();
  }

});
let statsStarted = false;
client.once("ready", async () => {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return;

  const category = guild.channels.cache.get(STATS_CATEGORY_ID);
  if (!category) return;


  const updateStats = async () => {

    const members = guild.memberCount;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const online = guild.members.cache.filter(
  m => m.presence && m.presence.status !== "offline"
).size;


    const channels = [
      {
        name: `👥 Members: ${members}`,
        id: "members"
      },
      {
        name: `🟢 Online: ${online}`,
        id: "online"
      },
      {
        name: `🤖 Bots: ${bots}`,
        id: "bots"
      }
    ];


    for (const stat of channels) {

      let channel = guild.channels.cache.find(
        c => c.name.startsWith(stat.id)
      );

      if (!channel) {
        channel = await guild.channels.create({
          name: `${stat.id} ${stat.name}`,
          type: ChannelType.GuildVoice,
          parent: category.id,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: ["Connect"]
            }
          ]
        });
      }

      await channel.setName(`${stat.id} ${stat.name}`);
    }

  };


  
  updateStats();

  setInterval(updateStats, 60000);

});
const VOICE_CHANNELS_NOTIFY = [
  "1525137672996261948",
  "1525137971353751656",
  "1525138351680782366",
  "1525165226989981759",
  "1525165698848915699",
  "1525165957264310303"
];

const ROLE_CHANNEL_ID = "1525602055664959689";


client.on("voiceStateUpdate", async (oldState, newState) => {

  // العضو دخل فويس جديد
  if (!oldState.channelId && newState.channelId) {

    if (!VOICE_CHANNELS_NOTIFY.includes(newState.channelId)) return;

    const member = newState.member;

    if (member.user.bot) return;

    // منع التكرار
    if (!database.sentUsers) database.sentUsers = [];
    
    if (database.sentUsers.includes(member.id)) return;

database.sentUsers.push(member.id);
saveDatabase();

    try {
      await member.send(
`🔔 **Notification Role**

مرحباً ${member.user.username} 👋

إذا تريد تستلم إشعارات السيرفر، خذ الرول من هنا:

<#1525602055664959689>

شكراً لانضمامك ❤️`
      );

      console.log(`DM sent to ${member.user.tag}`);

    } catch (error) {
      console.log(`Cannot send DM to ${member.user.tag}`);
    }
  }
});
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!ping") {
    const msg = await message.reply("🏓 Pinging...");

    const latency = msg.createdTimestamp - message.createdTimestamp;

    await msg.edit(
      `🏓 **Pong!**
⚡ Bot: ${latency}ms
🌐 API: ${client.ws.ping}ms`
    );
  }
});
client.login(process.env.TOKEN);