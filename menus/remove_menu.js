const EventsHandler = require('../backend/eventsDatabase');
const { generateEventsList, getPageFromEventsList } = require('../backend/misc');

module.exports = {
	name: 'remove_menu',

    async execute(interaction) {
        await interaction.deferUpdate()
        // Init
        const events_handler = new EventsHandler();

        // Remove event
        await events_handler.deleteEvent(interaction.values[0]);
        
        // Update join list
        await interaction.editReply({
            content: "Event removed! Refresh the events list to see the changes.",
            components: []
        })
	},
};