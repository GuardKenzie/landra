const { MessageActionRow, Message, MessageButton } = require('discord.js');
const EventsHandler = require('../backend/eventsDatabase');
const { announcementEmbed } = require('../backend/misc');

module.exports = {
	name: 'announce_menu',

    async execute(interaction) {
        // Defer update
        await interaction.deferUpdate();

        // Init
        const events_handler = new EventsHandler();

        // Get the event
        const event = await events_handler.getEvent(interaction.values[0]);

        // Get the original content
        const content = await interaction.fetchReply()
            .then(reply => reply.content)
            .catch(console.error);

        // Create embed
        const embed = await announcementEmbed(event);

        // Create join and refresh buttons
        const button_row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('join_announcement')
                    .setLabel('Join')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('refresh_announcement')
                    .setLabel('Refresh')
                    .setStyle('PRIMARY')
            )
        
        // Update select menu
        await interaction.editReply({
            content: "Done!",
            components: []
        }).catch(console.error);

        // Post announcement
        await interaction.channel.send({
            content: content,
            embeds: [embed],
            components: [button_row]
        }).catch(async () => {
            await interaction.followUp({
                content: "I could not post my announcement in this channel for some reason.",
                ephemeral: true
            });
        });
	},
};