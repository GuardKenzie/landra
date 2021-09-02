const { postEventNotifications } = require("../backend/misc");
const { setIntervalAsync } = require('set-interval-async/fixed');

module.exports = {
	name: 'ready',
	once: true,

    async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		const interval = setIntervalAsync(postEventNotifications, 1000, client);
	},
};