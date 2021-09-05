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
		const guild_count = await client.guilds.fetch().then(coll => coll.size);
		const event_count = await events_handler.eventCount();

		console.log(`Keeping track of ${event_count} events in ${guild_count} guilds`)


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