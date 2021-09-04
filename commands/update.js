const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js')
const EventsHandler = require('../backend/eventsDatabase');
const { parseDate, hasEventPermissions } = require('../backend/misc')
const { colour } = require('../config.json');

module.exports = {
    checks: [hasEventPermissions],

    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update an existing event\'s info')

        .addStringOption(option => 
            option.setName('name')
                .setDescription('The event\'s name')
        )

        .addStringOption(option => 
            option.setName('date')
                .setDescription('The event\'s date. Format YYYY/MM/DD hh:mm')
        )

        .addStringOption(option => 
            option.setName('description')
                .setDescription('The event\'s description')
        )

        .addStringOption(option => 
            option.setName('recurring')
                .setDescription('When the event should recurr')
                .addChoice("Weekly", "weekly")
                .addChoice("Monthly", "monthly")
                .addChoice("Once", "once")
        ),

    
    async execute(interaction) {
        // Get and parse options
        const name             = interaction.options.getString('name');
        const description      = interaction.options.getString('description');
        const date_string      = interaction.options.getString('date');
        const recurring_string = interaction.options.getString('recurring');

        // Set recurring to null if not recurring
        const recurring = recurring_string == "once" ? null : recurring_string

        // Check if the date is valid
        const date_status = parseDate(date_string, recurring);

        if (!date_status.valid) {
            await interaction.reply({
                content: date_status.error,
                ephemeral: true
            });

            return;
        }

        // Set date since it is ok
        const date = date_status.date;

        // Init select menu
        const event_handler = new EventsHandler()

        // Get all events and make the work for the menu
        const all_events = await event_handler.getAllEvents(interaction.guild);
        
        // Check if there are no events
        if (all_events.length == 0) {
            await interaction.reply({
                content: "There are no events to update!",
                ephemeral: true
            })

            return
        }

        const event_options = all_events.map(event => {
            return {
                label: event.name,
                value: event.event_id,
                description: event.description.substring(0, 50) +
                    (event.description.length > 50 ? "..." : "")
            }
        });

        const event_selection_row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('update_event_menu')
                    .setPlaceholder('Event')
                    .addOptions(event_options)
            )


        // Init info embed
        const embed = new MessageEmbed()
            .setTitle("Please pick an event to update")
            .setColor(colour);

        if (name)               embed.addFields({ name: "New name",        value: name })
        if (description)        embed.addFields({ name: "New description", value: description })
        if (date_string)        embed.addFields({ name: "New date",        value: date_string });
        if (recurring_string)   embed.addFields({ name: "Recurring",       value: recurring_string });
    
        await interaction.reply({
            components: [event_selection_row],
            embeds: [embed],
            ephemeral: true
        });

    }
}
