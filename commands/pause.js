const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauses the music"),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);

    if (!queue)
      return await interaction.editReply("*looks around* Stop what, honeypie??!!? There ain't no sound playin round here at the moment!");

    queue.setPaused(true);
    await interaction.editReply(
      "*DING DING* One hot pause comin' right up! Use `/resume` to resume the music"
    );
  },
};
