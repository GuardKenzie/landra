const EventsHandler = require('../backend/eventsDatabase');

module.exports = {
    name: 'guildMemberRemove',

    async execute(member) { 
        // Bots do not matter
        if (member.user.bot) return;

        const events_handler = new EventsHandler();
        await events_handler.purgeFromGuild(member.guild, member);
    }
}