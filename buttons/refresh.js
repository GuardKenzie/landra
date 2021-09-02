const { generateEventsList, getPageFromEventsList } = require('../backend/misc');


module.exports = {
	name: 'refresh_list',

    async execute(interaction) {
        // Get page
        const page = getPageFromEventsList(interaction.message);

        const embed = await generateEventsList(interaction.guild, page);

        await interaction.deferUpdate();
		await interaction.editReply({embeds: [embed]});
	},
};