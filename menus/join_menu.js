const EventsHandler = require('../backend/eventsDatabase');
const { generateEventsList, getPageFromEventsList } = require('../backend/misc');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	name: 'join_menu',

    async execute(interaction) {
        await interaction.deferUpdate();

        // Init
        const events_handler = new EventsHandler();

        // Join event
        await events_handler.joinEvent(interaction.member, interaction.values[0]);
        
        // Get event list message
        const parent_message_id = interaction.message.reference.messageId;
        const parent_message = await interaction.channel.messages.fetch(parent_message_id);

        // Get the page
        const page = getPageFromEventsList(parent_message)

        const embed = await generateEventsList(interaction.guild, page);

        // Update event list
        if (parent_message !== null) {
            await parent_message.edit({
                embeds: [embed]
            }).catch(console.error);
        }

        // Check if event is recurring
        const recurring = await events_handler.getEvent(interaction.values[0]).then(event => event.recurring !== null)

        if (recurring) {
            // Create follow up row
            const permanent_row = new MessageActionRow()
                .addComponents([
                    new MessageButton()
                        .setCustomId('join_permanent')
                        .setLabel('Keep me in')
                        .setStyle('SECONDARY'),
                    
                    new MessageButton()
                        .setCustomId('join_non_permanent')
                        .setLabel('Just this once')
                        .setStyle('SECONDARY')
                    ]
                );

            // Create follow up message
            const follow_up_msg = await interaction.followUp({
                content: 'You are joining a recurring event. Are you signing up for just this one time or should I keep you signed up for subsequent ones?',
                components: [permanent_row],
                ephemeral: true
            }).catch(console.error);

            // Create collector
            const collector = follow_up_msg.createMessageComponentCollector({ 
                componentType: 'BUTTON',
                time: 60000,
                max: 1
            });

            collector.on('collect', async i => {
                // Make permanent
                if (i.customId === 'join_permanent') {
                    await events_handler.makeJoinPermanent(interaction.user, interaction.values[0]);
                }
            });

            collector.on('end', async collected => {
                if (collected.size == 0) {

                    // Notify of timeout
                    await interaction.followUp({
                        content: 'Interaction timed out. These buttons will no longer work.',
                        components: [],
                        ephemeral: true
                    }).catch(console.error)
                }
            })
        }

        // Update join list
        await interaction.editReply({
            content: "Event joined",
            components: [],
        }).catch(console.error);
	},
};
