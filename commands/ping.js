const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    async execute(interaction) {

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('again')
                    .setLabel('Again!')
                    .setStyle('PRIMARY'),
            );

        await interaction.reply({
            content: 'Pong!',
            components: [row]
        });
        return true
    },
};