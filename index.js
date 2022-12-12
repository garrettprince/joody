const { REST } = require("@discordjs/rest");
const Discord = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const { Routes } = require("discord-api-types/v9");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { Player } = require("discord-player");
const { token } = require("./config.json");

const LOAD_SLASH = process.argv[2] == "load";

const CLIENT_ID = "894031093035073546";
const GUILD_ID = "915711521525469266";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.commands = new Collection();

client.slashcommands = new Discord.Collection();
client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});

let commands = [];

const slashFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of slashFiles) {
  const slashcmd = require(`./commands/${file}`);
  client.slashcommands.set(slashcmd.data.name, slashcmd);
  if (LOAD_SLASH) commands.push(slashcmd.data.toJSON());
}

if (LOAD_SLASH) {
  const rest = new REST({ version: "9" }).setToken(token);
  console.log("Deploying slash commands");
  rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    })
    .then(() => {
      console.log("Successfully loaded");
      process.exit(0);
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    });
} else {
  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
  });
  client.on("interactionCreate", (interaction) => {
    async function handleCommand() {
      if (!interaction.isCommand()) return;

      const slashcmd = client.slashcommands.get(interaction.commandName);
      if (!slashcmd) interaction.reply("Not a valid slash command");

      await interaction.deferReply();
      await slashcmd.run({ client, interaction });
    }
    handleCommand();
  });
  client.login(token);
}
