const { SlashCommandBuilder } = require('@discordjs/builders');
const EventsHandler = require('../backend/eventsDatabase');
const { parseDate, hasEventPermissions } = require('../backend/misc');

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
                .addChoice("Monthly", "monthly")
        ),

    
    async execute(interaction) {
        // Get and parse options
        const date_string = interaction.options.getString('date');
        const event_name  = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const recurring   = interaction.options.getString('recurring');

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

        // Schedule event
        const event_handler = new EventsHandler()
        await event_handler.newEvent(
            interaction.guild, 
            event_name, 
            description, 
            date,
            recurring
        );

        await interaction.reply({
            content: `Event \`${event_name}\` scheduled for \`${date}\`!`,
            ephemeral: true
        })

    }
}
