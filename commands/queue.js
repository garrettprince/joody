const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("displays the current song queue")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("add song to queue")
        .addStringOption((option) =>
          option
            .setName("searchterms")
            .setDescription("the search keywords")
            .setRequired(true)
        )
    ),

  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing) {
      return await interaction.editReply("There are no songs in the queue");
    }

    const totalPages = Math.ceil(queue.tracks.length / 10) || 1;
    const page = (interaction.options.getNumber("page") || 1) - 1;

    if (page + 1 > totalPages)
      return await interaction.editReply(
        `Invalid Page. There are only a total of ${totalPages} pages of songs`
      );

    const queueString = queue.tracks
      .slice(page * 10, page * 10 + 10)
      .map((song, i) => {
        return `**${page * 10 + i + 1}.** \`[${song.duration}]\` ${
          song.title
        } -- <@${song.requestedBy.id}>`;
      })
      .join("\n");

    const currentSong = queue.current;

    if (interaction.options.getSubcommand() === "add") {
      let url = interaction.options.getString("url");
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_VIDEO,
      });
      if (result.tracks.length === 0)
        return interaction.editReply("No results");

      const song = result.tracks[0];
      await queue.addTrack(song);
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `**Currently Playing**\n` +
              (currentSong
                ? `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy.id}>`
                : "None") +
              `\n\n**Queue**\n${queueString}`
          )
          .setFooter({
            text: `Page ${page + 1} of ${totalPages}`,
          })
          .setThumbnail(currentSong.setThumbnail),
      ],
    });
  },
};
