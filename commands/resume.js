const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resumes paused music"),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);

    if (!queue)
      return await interaction.editReply("We don't play nothin' when there's nothin' in the queue round here!");

    queue.setPaused(false);
    await interaction.editReply(
      "You hear that, fellas?! Meat's back on the menu! *does a big shimmy and a double wink*"
    );
  },
};
