module.exports = {
	name: 'join_permanent',

    async execute(interaction) {
        // Get page
        await interaction.deferUpdate();
        
		await interaction.editReply({
            content: "Got it!",
            components: [],
            ephemeral: true
        }).catch(console.error);
	},
};