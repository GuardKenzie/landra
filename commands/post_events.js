const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu, Message } = require('discord.js');
const { generateEventsList } = require('../backend/misc');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('post_events')
        .setDescription('Posts the list of events with controls'),
    
    async execute(interaction) {
        // Get the embed for page 0
        const embed = await generateEventsList(interaction.guild, 0);

        // Init page buttons
        const page_button_row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('last_page')
                    .setLabel('')
                    .setStyle('SECONDARY')
                    .setEmoji('⬅️'),
                new MessageButton()
                    .setCustomId('next_page')
                    .setLabel('')
                    .setStyle('SECONDARY')
                    .setEmoji('➡️'),
                new MessageButton()
                    .setCustomId('refresh_list')
                    .setLabel('Refresh')
                    .setStyle('PRIMARY')
            )
        
        // Action row for joining and leaving
        const user_action_row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('join_event')
                        .setLabel('Join event')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('leave_event')
                        .setLabel('Leave event')
                        .setStyle('DANGER'),
                    new MessageButton()
                        .setCustomId('admin_button')
                        .setLabel('Admin')
                        .setStyle('SECONDARY')
                )

        interaction.reply({
            embeds: [embed],
            components: [
                page_button_row, 
                user_action_row
            ]
        });
    }
}