const EventsHandler = require('../backend/eventsDatabase');

module.exports = {
    name: 'guildDelete',

    async execute(guild) {
        // Init events handler
        const events_handler = new EventsHandler();

        // Get all events in guild
        const all_events = await events_handler.getAllEvents(guild);

        // Loop over each event and delete it
        for (const event of all_events) {
            await events_handler.deleteEvent(event.event_id);
        }
    }
}