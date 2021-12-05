const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const EventsHandler = require('../backend/eventsDatabase');
const foodEmoji = require('../backend/food');
const { hasEventPermissions } = require('../backend/misc');

module.exports = {
    checks: [hasEventPermissions],

    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Post an announcement widget for an event')
        .addStringOption(option => 
            option.setName('message')
            .setDescription('A message to include with the announcement')
            .setRequired(false)
        ),

    async execute(interaction) {
        // Defer reply
        await interaction.deferReply({ ephemeral: true });

        // Get the message
        const message = interaction.options.getString('message');

        // Get events database
        const events_handler = new EventsHandler();

        // Get all events
        const all_events = await events_handler.getAllEvents(interaction.guild)

        if (all_events.length == 0) {
            await interaction.editReply({
                content: "There are no events to announce",
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

        // Create select menu
        const action_row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('announce_menu')
                    .setPlaceholder('Event to announce')
                    .addOptions(event_options)
            );

        const content = message
            ? `:envelope:  ${interaction.user} announced an event  :envelope:\n\n${message}\n⠀`
            : `:envelope:  ${interaction.user} announced an event  :envelope:\n⠀`

        await interaction.editReply({
            content: content,
            components: [action_row],
            ephemeral: true
        }).catch(console.error);
    }
}