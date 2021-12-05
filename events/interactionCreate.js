module.exports = {
	name: 'interactionCreate',

	async execute(interaction) {

        if (interaction.isCommand()) {
            // fetch command
            const command = interaction.client.commands.get(interaction.commandName);
    
            if (!command) return;
        
            // Check for permission
            if (command.checks?.length > 0) {
                const checks_ok = [];

                // Exec all checks and add them to list
                for (const check of command.checks) {
                    const result = await check(interaction);
                    checks_ok.push(result);
                }
                
                // print error if not ok
                if (checks_ok.some(result => result === false)) {
                    await interaction.editReply({
                        content: "You do not have permission to execute this command!",
                        ephemeral: true
                    }).catch(console.error);

                    return
                }
            }

            // Execute it
            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.editReply({
                    content: "There was an error while executing your command",
                    ephemeral: true
                }).catch(console.error);
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
                /*await interaction.reply({
                    content: "There was an error while executing your button :sad:",
                    ephemeral: true
                })*/
            }
        }

        else if (interaction.isSelectMenu()) {
            const select_menu = interaction.client.select_menus.get(interaction.customId);

            try {
                await select_menu.execute(interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.editReply({
                    content: "There was an error while executing your selection",
                    ephemeral: true,
                    components: []
                }).catch(console.error);
            }
        }

	},
};
