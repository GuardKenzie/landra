const EventsHandler = require('../backend/eventsDatabase');

module.exports = {
    name: 'guildDelete',

    async execute(guild) {
        // Init events handler
        const events_handler = new EventsHandler();

        // Purge all entries of guild
        console.log(`Purging ${guild.id}`)
        //await events_handler.purgeGuild(guild.id);
    }
}