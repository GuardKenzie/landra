const { postEventNotifications, postDailyNotifications } = require("../backend/misc");
const { setIntervalAsync } = require('set-interval-async/fixed');

const status = "with swords!"

module.exports = {
	name: 'ready',
	once: true,

    async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// Set status
		console.log(`Status set to "Playing ${status}"`);
		client.user.setActivity(status);

		console.log("\nStarting loops")
		// Start event notification loop
		console.log("STARTING:	Event notification loop")
		setIntervalAsync(postEventNotifications, 60 * 1000, client);

		// Start daily notification loop
		console.log("STARTING:	Daily notification loop")
		setIntervalAsync(postDailyNotifications, 60 * 1000, client);
	},
};