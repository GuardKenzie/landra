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
                    content: "There was an error while executing your button :sad:",
                    ephemeral: true
                })
            }
        }

        else if (interaction.isSelectMenu()) {
            const select_menu = interaction.client.select_menus.get(interaction.customId);

            try {
                await select_menu.execute(interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "There was an error while executing your selection :sad:",
                    ephemeral: true
                })
            }
        }

	},
};
