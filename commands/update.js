const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js')
const EventsHandler = require('../backend/eventsDatabase');
const { parseDate, hasEventPermissions } = require('../backend/misc')
const { colour } = require('../config.json');
const foodEmoji = require('../backend/food');
const { ChannelType } = require('discord-api-types/v9');

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
                .addChoice("Once", "once")
                .addChoice("Weekly", "weekly")
                .addChoice("Monthly (by day of the month)", "monthly")
                .addChoice("Monthly (by weekday)", "monthly_by_weekday")
        )
        
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('The voice channel the event will be taking place')
            .addChannelType(ChannelType.GuildVoice)
        ),

    
    async execute(interaction) {
        // Get and parse options
        const name             = interaction.options.getString('name');
        const description      = interaction.options.getString('description');
        const date_string      = interaction.options.getString('date');
        const recurring_string = interaction.options.getString('recurring');

        // Check if field lengths are invalid
        if (name?.length > 180) {
            await interaction.reply({
                content: `Event name can not be longer than 180 characters`,
                ephemeral: true
            })

            return;
        }
        if (description?.length > 1024) {
            await interaction.reply({
                content: `Event description can not be longer than 1024 characters`,
                ephemeral: true
            })

            return;
        }

        await interaction.deferReply({ ephemeral: true });

        if ([name, description, date_string, recurring_string].every(e => e === null)) {
            await interaction.editReply({
                content: "You didn't provide any information to update",
                ephemeral: true
            })

            return
        }

        // Init
        const events_handler = new EventsHandler()

        // Set recurring to null if not recurring
        const recurring = recurring_string == "once" ? null : recurring_string

        // Get time offset and adjust date
        const time_offset = await events_handler.getPrintableOffset(interaction.guild);


        // Check if the date is valid
        const date_status = Boolean(date_string) 
            ? parseDate(date_string + time_offset, recurring)
            : parseDate(date_string, recurring)

        if (!date_status.valid) {
            await interaction.editReply({
                content: date_status.error,
                ephemeral: true
            }).catch(console.error);

            return;
        }

        // Init select meny
        // Get all events and make the work for the menu
        const all_events = await events_handler.getAllEvents(interaction.guild);
        
        // Check if there are no events
        if (all_events.length == 0) {
            await interaction.editReply({
                content: "There are no events to update!",
                ephemeral: true
            }).catch(console.error);

            return
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
    
        await interaction.editReply({
            components: [event_selection_row],
            embeds: [embed],
            ephemeral: true
        }).catch(console.error);

    }
}
