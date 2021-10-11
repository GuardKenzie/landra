const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    async execute(interaction) {
        // Pong back
        await interaction.reply({
            content: 'Pong!'
        }).catch(console.error);
        return true
    },
};
