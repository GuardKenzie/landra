const { SlashCommandBuilder } = require('@discordjs/builders');
const { postDailyNotifications } = require('../backend/misc');

module.exports = {
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
