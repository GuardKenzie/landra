const { setStatus, postEventNotifications, postDailyNotifications } = require("../backend/misc");
const { setIntervalAsync } = require('set-interval-async/fixed');
const EventsHandler = require('../backend/eventsDatabase')

module.exports = {
	name: 'ready',
	once: true,

    async execute(client) {
		// Init
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// set status
		await setStatus(client);

		// Counts
		const events_handler = new EventsHandler();
		const all_guilds = await client.guilds.fetch();

		console.log("\n=== Joined guilds: ===")
		all_guilds.each(guild => {
			console.log(guild.name);
		})

		const guild_count = all_guilds.size;
		const event_count = await events_handler.eventCount();

		console.log()
		console.log(`Keeping track of ${event_count} events in ${guild_count} guilds`)
		
		
		// If for some reason we are checking a channel in a guild we are no longer
        // a member of, we purge that guild from our database and skip it
		const all_guild_ids = all_guilds.map(guild => guild.id)
		const all_channels = await events_handler.getAllChannels()
		
        for (const entry of all_channels) {
			if (!all_guild_ids.includes(entry.guild_id)) {
				console.log(`Purging ${all_guilds.get(entry.guild_id).name}`)

				await events_handler.purgeGuild(entry.guild_id);
			}
		}

		// Handle past events
		console.log("\nHandling past events")
		await events_handler.handlePastEvents();
		console.log("Done!")

		console.log("\nStarting loops")
		// Start event notification loop
		console.log("STARTING:	Event notification loop")
		setIntervalAsync(postEventNotifications, 60 * 1000, client);

		// Start daily notification loop
		console.log("STARTING:	Daily notification loop")
		setIntervalAsync(postDailyNotifications, 60 * 1000, client);

		// Start status loop
		console.log("STARTING:	Status loop")
		setIntervalAsync(setStatus, 5 * 60 * 1000, client);
	},
};