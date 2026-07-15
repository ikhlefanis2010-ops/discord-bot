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

  const content = message.content.toLowerCase();

if (badWords.some(word => {
  const regex = new RegExp(`\\b${word}\\b`, "i");
  return regex.test(content);
})) {

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
  console.log("MESSAGE:", message.content);
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
const GAME_CHANNELS = {
  "1525137559624351855": "1525163693933858876",
  "1525137903473397871": "1525157422069583953",
  "1525138258760040478": "1525163596726796408",
  "1525165141824376913": "1525166182074683423",
  "1525165616485371944": "1525166048758861975",
  "1525165857582354574": "1525166113602666670"
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const allowedRole = GAME_CHANNELS[message.channel.id];

  if (!allowedRole) return;

  for (const role of message.mentions.roles.values()) {

    if (role.id !== allowedRole) {

      console.log(
  `❌ Wrong mention: ${role.id} in channel ${message.channel.id}`
);

      await message.delete().catch(() => {});

      const warn = await message.channel.send(
        `❌ ${message.author} هذا الشات مخصص لهذه اللعبة فقط.`
      );

      setTimeout(() => {
        warn.delete().catch(() => {});
      }, 5000);

      break;
    }
  }
});
console.log("GAME MENTION SYSTEM LOADED");
client.on("voiceStateUpdate", (oldState, newState) => {

  // دخل فويس
  if (!oldState.channelId && newState.channelId) {

    if (!database.voiceTime) database.voiceTime = {};

    database.voiceTime[newState.member.id] = {
      joinTime: Date.now()
    };

    saveDatabase();
  }


  // خرج من الفويس
  if (oldState.channelId && !newState.channelId) {

    const userId = oldState.member.id;

    if (!database.voiceTime) database.voiceTime = {};

    if (database.voiceTime[userId]) {

      const time =
        Date.now() - database.voiceTime[userId].joinTime;

      const minutes = Math.floor(time / 60000);

      if (!database.users) database.users = {};
      if (!database.users[userId]) {
        database.users[userId] = {};
      }

      if (!database.users[userId].voiceMinutes) {
        database.users[userId].voiceMinutes = 0;
      }

      database.users[userId].voiceMinutes += minutes;

      delete database.voiceTime[userId];

      saveDatabase();
    }
  }

});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  if (message.content === "!rank") {  

  if (!database.users) database.users = {};

  if (!database.users[message.author.id]) {
    database.users[message.author.id] = {
      voiceMinutes: 0
    };
  }

  const minutes = database.users[message.author.id].voiceMinutes || 0;

  let rank;
  let next;

  if (minutes < 100) {
    rank = "🥉 Bronze";
    next = 100;
  } 
  else if (minutes < 300) {
    rank = "🥈 Silver";
    next = 300;
  }
  else if (minutes < 600) {
    rank = "🥇 Gold";
    next = 600;
  }
  else if (minutes < 1000) {
    rank = "💎 Diamond";
    next = 1000;
  }
  else {
    rank = "👑 Immortal";
    next = "MAX";
  }

  message.reply(
`🏆 **Rank**

👤 User: ${message.author}

🎧 Voice Time: **${minutes} minutes**

⭐ Rank: **${rank}**

📈 Next Rank: **${next === "MAX" ? "MAX" : next + " minutes"}**`
  );
}
});
client.login(process.env.TOKEN);