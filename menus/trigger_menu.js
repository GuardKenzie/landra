const EventsHandler = require('../backend/eventsDatabase');
const { generateEventsList, getPageFromEventsList } = require('../backend/misc');

module.exports = {
	name: 'trigger_menu',

    async execute(interaction) {
        await interaction.deferUpdate()
        // Init
        const events_handler = new EventsHandler();

        // Remove event
        await events_handler.handleEventNotification(interaction.values[0]);
        
        // Update join list
        await interaction.editReply({
            content: "Done!",
            components: []
        }).catch(console.error);
	},
};