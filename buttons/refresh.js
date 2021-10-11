const { generateEventsList, getPageFromEventsList } = require('../backend/misc');


module.exports = {
	name: 'refresh_list',

    async execute(interaction) {
        // Get page
        await interaction.deferUpdate();

        const page = getPageFromEventsList(interaction.message);
        const embed = await generateEventsList(interaction.guild, page);
        
		await interaction.editReply({embeds: [embed]})
            .catch(console.error);
	},
};