const EventsHandler = require('../backend/eventsDatabase');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
	name: 'join_event',

    async execute(interaction) {
        // Init event handler
        const events_handler = new EventsHandler();

        // Get all event names, ids and store them for our menu
        let event_options = [];
        const all_events = await events_handler.getAllEvents(interaction.guild)

        // Get all events that user has joined
        const joined_events = await events_handler.getEventsOfUser(interaction.member);

        if (joined_events.length == all_events.length) {
            // Check if the user has any events left to join
            await interaction.reply({
                content: "You have already joined all available events!",
                ephemeral: true
            });

            return
        } 

        for (const event of all_events) {
            if (!joined_events.includes(event.event_id)) {
                // We can only join events we haven't already
                event_options.push({
                    label: event.name,
                    value: event.event_id
                });
            }
        }

        // Init join menu
        const join_menu_row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('join_menu')
                        .setPlaceholder('Event')
                        .addOptions(event_options)
                );

        await interaction.reply({
            content: "Please pick an event to join",
            components: [join_menu_row],
            ephemeral: true
        });
	},
};