const EventsHandler = require('../backend/eventsDatabase');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
	name: 'leave_event',

    async execute(interaction) {
        // Init event handler
        const events_handler = new EventsHandler();

        // Get all event names, ids and store them for our menu
        let event_options = [];
        const all_events = await events_handler.getAllEvents(interaction.guild)

        // Get all events that user has joined
        const joined_events = await events_handler.getEventsOfUser(interaction.member);

        if (joined_events.length == 0) {
            // Check if the user has any events to leave
            await interaction.reply({
                content: "You have not joined any events yet!",
                ephemeral: true
            });

            return
        } 

        for (const event of all_events) {
            if (joined_events.includes(event.event_id)) {
                // We can only leave events we have joined
                event_options.push({
                    label: event.name,
                    value: event.event_id
                });
            }
        }

        // Init leave menu
        const leave_menu_row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('leave_menu')
                        .setPlaceholder('Event')
                        .addOptions(event_options)
                );

        await interaction.reply({
            content: "Please pick an event to leave",
            components: [leave_menu_row],
            ephemeral: true
        });
	},
};