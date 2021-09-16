const EventsHandler = require('../backend/eventsDatabase');

module.exports = {
    name: 'guildDelete',

    async execute(guild) {
        // Init events handler
        const events_handler = new EventsHandler();
        const guild_id = guild.id;

        // Purge all entries of guild
        console.log(`Purging ${guild_id}`);
        if (guild_id === undefined) {
            console.log("Guild id was undefined");
        }
        else {
            await events_handler.purgeGuild(guild_id);
        }
    }
}