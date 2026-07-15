const GAME_CHANNELS = {
  "1525137559624351855": "1525163693933858876", // Minecraft
  "1525137903473397871": "1525157422069583953", // Valorant
  "1525138258760040478": "1525163596726796408", // CS
  "1525165141824376913": "1525166182074683423", // FIFA
  "1525165616485371944": "1525166048758861975", // Fortnite
  "1525165857582354574": "1525166113602666670"  // Free Fire
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const allowedRole = GAME_CHANNELS[message.channel.id];

  if (!allowedRole) return;

  for (const role of message.mentions.roles.values()) {

    if (role.id !== allowedRole) {

      await message.delete().catch(() => {});

      const warn = await message.channel.send(
        `❌ ${message.author} لا يمكنك منشن هذا الرول في هذا الشات.`
      );

      setTimeout(() => {
        warn.delete().catch(() => {});
      }, 5000);

      break;
    }
  }
});

client.login(process.env.TOKEN);