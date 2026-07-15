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

  "97boun",
  "zbo",
  "nega3rek",
  "na7wik",
  "nikk",
  "zokk",
  "rbk",
  "tiz",
  "NA3tiz",
  "sowa",
  "7atchoun",
  "bazol",
  "ziza",
  "97ba",
  "zbi",
  "zb",
  "nik"
];
const LOG_CHANNEL_ID = "1525385648964632637";

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

if (badWords.some(word => {
  const regex = new RegExp(`(?<![a-z0-9])${word}(?![a-z0-9])`, "i");
  return regex.test(content);
})) {

    await message.delete();

   try {
  await message.member.timeout(
    10 * 60 * 1000,
    "Bad words"
  );
} catch (err) {
  console.log("Cannot timeout member:", err.message);
}

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

// XP System
if (!database.users) database.users = {};

if (!database.users[message.author.id]) {
  database.users[message.author.id] = {
    xp: 0,
    level: 1
  };
}

const user = database.users[message.author.id];

// زيادة XP لكل رسالة
user.xp += 5;

// رفع المستوى
const neededXP = user.level * 100;

if (user.xp >= neededXP) {
  user.xp -= neededXP;
  user.level++;

  message.channel.send(
    `🎉 ${message.author} وصل إلى **Level ${user.level}**!`
  );
}

saveDatabase();

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

  console.log("CHANNEL ID:", message.channel.id);
  console.log("ALLOWED ROLE:", allowedRole);
  console.log("MENTIONED ROLES:", [...message.mentions.roles.keys()]);

  if (!allowedRole) return;

  for (const role of message.mentions.roles.values()) {

    if (role.id !== allowedRole) {

      console.log("WRONG ROLE:", role.id);

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

client.login(process.env.TOKEN);