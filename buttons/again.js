module.exports = {
	name: 'again',

    async execute(interaction) {
		await interaction.reply("Ping again!");
        await interaction.channel.send('Whaat');
	},
};