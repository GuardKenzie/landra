const EventsHandler = require('../backend/eventsDatabase');
const { generateEventsList, getPageFromEventsList } = require('../backend/misc');

module.exports = {
	name: 'leave_menu',

    async execute(interaction) {
        await interaction.deferUpdate()
        // Init
        const events_handler = new EventsHandler();

        // Leave event
        await events_handler.leaveEvent(interaction.member, interaction.values[0]);
        
        // Get event list message
        const parent_message_id = interaction.message.reference.messageId;
        const parent_message = await interaction.channel.messages.fetch(parent_message_id);

        // Get the page
        const page = getPageFromEventsList(parent_message);

        const embed = await generateEventsList(interaction.guild, page);

        // Update event list
        await parent_message.edit({
            embeds: [embed]
        });

        // Update join list
        await interaction.editReply({
            content: "Event left",
            components: []
        })
	},
};