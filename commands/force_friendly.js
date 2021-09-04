const { SlashCommandBuilder } = require('@discordjs/builders');
const { postDailyNotifications } = require('../backend/misc');

module.exports = {
    guildCommand: true,
    checks: [(interaction) => { return interaction.member.id === "197471216594976768" }],

    data: new SlashCommandBuilder()
        .setName('force_friendly')
        .setDescription('Force posts friendly'),

    async execute(interaction) {
        // Pong back
        await postDailyNotifications(interaction.client);
        await interaction.reply({
            content: "done",
            ephemeral: true
        });
    },
};
