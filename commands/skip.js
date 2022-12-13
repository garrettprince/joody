const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song"),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);

    if (!queue)
      return await interaction.editReply("No songs in the queue, you know what to do!");

    const currentSong = queue.current;

    queue.skip();
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`${currentSong.title} has been skipped! Boy howdy! West Philly Pancake platters on the house!`)
          .setThumbnail(currentSong.thumbnail),
      ],
    });
  },
};
