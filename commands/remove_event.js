const EventsHandler = require('../backend/eventsDatabase');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove an event'),

    async execute(interaction) {
        // Init event handler
        const events_handler = new EventsHandler();

        // Get all event names, ids and store them for our menu
        const all_events = await events_handler.getAllEvents(interaction.guild)
        
        if (all_events.length == 0) {
            await interaction.reply({
                content: "There are no events to remove",
                ephemeral: true
            });

            return;
        }

        const event_options = all_events.map(event => {
            return {
                label: event.name,
                value: event.event_id,
                description: event.description.substring(0, 50) +
                        (event.description.length > 50 ? "..." : "")
            }
        })

        // Init remove menu
        const remove_menu_row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('remove_menu')
                        .setPlaceholder('Event')
                        .addOptions(event_options)
                );

        await interaction.reply({
            content: "Please pick an event to remove",
            components: [remove_menu_row],
            ephemeral: true
        });
	},
};