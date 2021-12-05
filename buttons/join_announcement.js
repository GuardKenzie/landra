const EventsHandler = require('../backend/eventsDatabase');
const { announcementEmbed } = require('../backend/misc');

const id_re = new RegExp('[0-9a-f]{64}');

module.exports = {
	name: 'join_announcement',

    async execute(interaction) {
        // Defer update
        await interaction.deferUpdate();

        // Init
        const events_handler = new EventsHandler();

        // Get message and event_id
        const embeds  = await interaction.fetchReply().then(reply => reply.embeds);

        // Get event from footer
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

        // Check if user already joined
        const joined_events = await events_handler.getEventsOfUser(interaction.member);

        if (joined_events.includes(event_id)) {
            await interaction.followUp({
                content: "You have already joined this event.",
                ephemeral: true
            }).catch(console.error);

            return;
        }

        // Get event
        const event = await events_handler.getEvent(event_id);

        // Check if null
        if (event === null) {
            await interaction.deleteReply().catch(console.error);
        }

        // Join event
        await events_handler.joinEvent(interaction.member, event.event_id);

        const embed = await announcementEmbed(event);

        // Update event list
        await interaction.editReply({
            embeds: [embed]
        }).catch(console.error);
	},
};
