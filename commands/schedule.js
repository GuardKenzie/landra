const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageButton, Interaction } = require('discord.js');
const EventsHandler = require('../backend/eventsDatabase');
const moment = require('moment');

module.exports = {
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
        ),

    
    async execute(interaction) {
        // Init valeus
        const date_format = "YYYY/MM/DD kk:mm";
        const now = new Date();

        // Get and parse options
        const event_name  = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const date_string = interaction.options.getString('date');
        const date        = moment(date_string, date_format);

        if (isNaN(date)) {
            // Check if the date is valid
            await interaction.reply({
                content: `The provided date: \`${date_string}\` is invalid. Please try again`,
                ephemeral: true
            });

            return
        }

        if (date < now) {
            // Check if the date is in the past
            await interaction.reply({
                content: `The provided date: \`${date_string}\` is in the past. Please try again`,
                ephemeral: true
            });

            return
        }

        // Schedule event
        event_handler = new EventsHandler()
        event_reply = await event_handler.newEvent(interaction.guild, event_name, description, date);

        await interaction.reply({
            content: `Success!`
        })

    }
}