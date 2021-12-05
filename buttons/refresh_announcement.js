const EventsHandler = require('../backend/eventsDatabase');
const { announcementEmbed } = require('../backend/misc');

const id_re = new RegExp('[0-9a-f]{64}');

module.exports = {
	name: 'refresh_announcement',

    async execute(interaction) {
        // Defer update
        await interaction.deferUpdate();

        // Init
        const events_handler = new EventsHandler();

        // Get embeds
        const embeds  = await interaction.fetchReply().then(reply => reply.embeds);

        if (embeds.length < 1) {
            await interaction.deleteReply().catch(console.error);
        }
        
        // Get event_id from thumbnail url
        const thumbnail_url = embeds[0].thumbnail.url

        if (id_re.exec(thumbnail_url) == 0) {
            await interaction.deleteReply().catch(console.error);
            return;
        }

        const event_id = id_re.exec(thumbnail_url)[0];

        // Get event
        const event = await events_handler.getEvent(event_id);

        // Check if null
        if (event === null) {
            await interaction.deleteReply().catch(console.error);
        }

        const embed = await announcementEmbed(event);
        
		await interaction.editReply({embeds: [embed]})
            .catch(console.error);
	},
};