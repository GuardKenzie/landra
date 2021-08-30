const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test command'),

    async execute(interaction) {
        let guild_id = await interaction.guild.id;

        await interaction.reply({
            content: guild_id,
            ephemeral: true
        });
    }
}