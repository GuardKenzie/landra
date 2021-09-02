const { SlashCommandBuilder } = require('@discordjs/builders');
const EventsHandler = require('../backend/eventsDatabase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purges your user id from the bot\'s database'),

    async execute(interaction) {
        // Init event handler
        const events_handler = new EventsHandler();

        await interaction.deferReply({ ephemeral: true });
        // Purge
        await events_handler.purgeUser(interaction.member);

        await interaction.editReply({
            content: "Purged",
        });
    }

}