const EventsHandler = require('../backend/eventsDatabase');

module.exports = {
    name: 'guildDelete',

    async execute(guild) {
        // Init events handler
        const events_handler = new EventsHandler();
        const guild_id = guild.id;

        // Purge all entries of guild
        if (guild.name === undefined) return;
        if (guild_id === undefined) {
            console.log("Guild id was undefined");
        }
        else {
            console.log(`Guild was deleted. Purging ${guild_id}`);
            await events_handler.purgeGuild(guild_id);
        }
    }
}