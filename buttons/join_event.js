const EventsHandler = require('../backend/eventsDatabase');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const foodEmoji = require('../backend/food')

module.exports = {
	name: 'join_event',

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        // Init event handler
        const events_handler = new EventsHandler();

        // Get all event names, ids and store them for our menu
        let event_options = [];
        const all_events = await events_handler.getAllEvents(interaction.guild)

        // Get all events that user has joined
        const joined_events = await events_handler.getEventsOfUser(interaction.member);

        if (joined_events.length == all_events.length) {
            // Check if the user has any events left to join
            await interaction.editReply({
                content: "You have already joined all available events!",
                ephemeral: true
            }).catch(console.error);

            return
        } 

        for (const event of all_events) {
            if (!joined_events.includes(event.event_id)) {
                // We can only join events we haven't already
                event_options.push({
                    label: event.name,
                    value: event.event_id,
                    description: event.description.substring(0, 50) +
                        (event.description.length > 50 ? "..." : ""),
                    emoji: {
                        name: foodEmoji(event.event_id),
                        id: null
                    }
                })
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

        await interaction.editReply({
            content: "Please pick an event to join",
            components: [join_menu_row],
            ephemeral: true
        }).catch(console.error);
	},
};