const { generateEventsList, getPageFromEventsList } = require('../backend/misc');

module.exports = {
	name: 'next_page',

    async execute(interaction) {
        // Get page
        const page = getPageFromEventsList(interaction.message);

        const next_page = page + 1
        const embed = await generateEventsList(interaction.guild, next_page);
        
        await interaction.deferUpdate();
		await interaction.editReply({embeds: [embed]});
        
	},
};