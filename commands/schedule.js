const { SlashCommandBuilder } = require('@discordjs/builders');
const EventsHandler = require('../backend/eventsDatabase');
const { parseDate, hasEventPermissions } = require('../backend/misc');
const { ChannelType } = require('discord-api-types/v9');

module.exports = {
    checks: [hasEventPermissions],

    data: new SlashCommandBuilder()
        .setName('schedule')
        .setDescription('Create a new event')

        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of the event')
                .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('date')
                .setDescription('Format: `YYYY/MM/DD hh:mm`')
                .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('description')
                .setDescription('Description for the event')
                .setRequired(true)    
        )

        .addStringOption(option =>
            option.setName('recurring')
                .setDescription('How often do you want your event to repeat?')
                .addChoice("Weekly", "weekly")
                .addChoice("Monthly (by day of the month)", "monthly")
                .addChoice("Monthly (by weekday)", "monthly_by_weekday")
        )

        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The voice channel the event will be taking place')
                .addChannelType(ChannelType.GuildVoice)
        ),
    
    guildCommand: true,
    
    async execute(interaction) {
        // Get and parse options
        const date_string = interaction.options.getString('date');
        const event_name  = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const recurring   = interaction.options.getString('recurring');
        const channel     = interaction.options.getChannel('channel');

        // Check if field lengths are invalid
        if (event_name.length > 180) {
            await interaction.reply({
                content: `Event name can not be longer than 180 characters`,
                ephemeral: true
            })

            return;
        }
        if (description.length > 1024) {
            await interaction.reply({
                content: `Event description can not be longer than 1024 characters`,
                ephemeral: true
            })

            return;
        }

        // Init
        const events_handler = new EventsHandler()

        // Get time offset and adjust date
        const time_offset = await events_handler.getPrintableOffset(interaction.guild);

        // Check if the date is valid
        const date_status = parseDate(date_string + time_offset, recurring);

        if (!date_status.valid) {
            await interaction.reply({
                content: date_status.error,
                ephemeral: true
            });

            return;
        }

        // Set date since it is ok
        const date = date_status.date.toDate();

        // Schedule event
        await events_handler.newEvent(
            interaction.guild, 
            event_name, 
            description, 
            date,
            recurring,
            channel
        );

        await interaction.reply({
            content: `Event \`${event_name}\` scheduled for \`${date_string}\`!`,
            ephemeral: true
        }).catch(console.error);

    }
}
