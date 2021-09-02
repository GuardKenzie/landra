const EventsHandler = require('../backend/eventsDatabase');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'admin_button',

    async execute(interaction) {
        // Init admin action buttons
        const admin_button_row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('remove_event')
                    .setLabel('Remove event')
                    .setStyle('DANGER'),
                new MessageButton()
                    .setCustomId('update_button')
                    .setLabel('Update event')
                    .setStyle('PRIMARY')
        );

        await interaction.reply({
            content: "Please pick an action",
            components: [admin_button_row],
            ephemeral: true
        });
	},
};