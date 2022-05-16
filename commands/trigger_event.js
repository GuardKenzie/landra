const EventsHandler = require('../backend/eventsDatabase');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const foodEmoji = require('../backend/food');

module.exports = {
    guildCommand: true,
 
	data: new SlashCommandBuilder()
        .setName('trigger')
        .setDescription('Trigger an event'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // Init event handler
        const events_handler = new EventsHandler();

        // Get all event names, ids and store them for our menu
        const all_events = await events_handler.getAllEvents(interaction.guild)
        
        if (all_events.length == 0) {
            await interaction.editReply({
                content: "There are no events",
                ephemeral: true
            }).catch(console.error);

            return;
        }

        const event_options = all_events.map(event => {
            return {
                label: event.name.substring(0,90) +
                    (event.name.length > 90 ? "..." : ""),
                value: event.event_id,
                description: event.description.substring(0, 50) +
                    (event.description.length > 50 ? "..." : ""),
                emoji: {
                    name: foodEmoji(event.event_id),
                    id: null
                }
            }
        })

        // Init trigger menu
        const trigger_menu = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('trigger_menu')
                        .setPlaceholder('Event')
                        .addOptions(event_options)
                );

        await interaction.editReply({
            content: "Please pick an event to trigger",
            components: [trigger_menu],
            ephemeral: true
        }).catch(console.error);
	},
};