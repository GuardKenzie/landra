const { generateEventsList, getPageFromEventsList } = require('../backend/misc');


module.exports = {
	name: 'last_page',

    async execute(interaction) {
        await interaction.deferUpdate();

        // Get page
        const page = getPageFromEventsList(interaction.message);

        const last_page = page - 1
        const embed = await generateEventsList(interaction.guild, last_page);
        

		await interaction.editReply({embeds: [embed]});
        
	},
};