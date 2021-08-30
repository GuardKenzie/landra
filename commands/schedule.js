const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageButton, Interaction } = require('discord.js');

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
                .setDescription('The date and time for the event')
                .setRequired(true)
        )

        .addStringOption(option => 
            option.setName('description')
                .setDescription('Description for the event')
                .setRequired(true)    
        ),

    
    async execute(interaction) {
        const event_name  = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const date_string = interaction.options.getString('date');
        const date        = new Date(date_string);

        if (isNaN(date)) {
            await interaction.reply({
                content: `The provided date: \`${date_string}\` is invalid. Please try again`,
                ephemeral: true
            });

            return
        }

        await interaction.reply({
            content: `name: ${event_name}\nDate: ${date}\nDescription: ${description}`
        })
    }
}