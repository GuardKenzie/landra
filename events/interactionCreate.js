module.exports = {
	name: 'interactionCreate',

	async execute(interaction) {

        if (interaction.isCommand()) {
            // fetch command
            const command = interaction.client.commands.get(interaction.commandName);
    
            if (!command) return;
        
        
            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "There was an error while executing your command :sad:",
                    ephemeral: true
                })
            }
        }

        else if (interaction.isButton()) {
            // fetch button
            const button = interaction.client.buttons.get(interaction.customId);

            try {
                await button.execute(interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "There was an error while executing your command :sad:",
                    ephemeral: true
                })
            }
        }

	},
};
