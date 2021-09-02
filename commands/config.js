const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configure')
        .setDescription('Prints current configuration')
        .addSubcommandGroup(group =>
            group
                .setName('role')
                .setDescription('Allow or disallow roles to edit events')
                .addSubcommand(subcommand =>
                    subcommand
                        // configure role remove 
                        .setName("remove")
                        .setDescription("Dissallow a role to edit events")
                        .addRoleOption(option =>
                            option
                                .setName("role")
                                .setDescription("The role to disallow")
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        // configure role remove 
                        .setName("add")
                        .setDescription("Allow a role to edit events")
                        .addRoleOption(option =>
                            option
                                .setName("role")
                                .setDescription("The role to allow")
                                .setRequired(true)
                        )
                )
        )
        .addSubcommandGroup(group =>
            group
                .setName('channel')
                .setDescription('Edit channel types')
                .addSubcommand(subcommand =>
                    // configure channel set
                    subcommand
                        .setName("set")
                        .setDescription("Set a channel's type")
                        .addChannelOption(option =>
                            option
                                .setName("channel")
                                .setDescription("The channel to configure")
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option
                                .setName("type")
                                .setDescription("The channel's type")
                                .setRequired(true)
                                .addChoice(
                                    "Event notifications", 
                                    "notifications"
                                )
                                .addChoice(
                                    "Daily notifications for recurring events",
                                    "daily"
                                )
                        )
                )
        ),

    async execute(interaction) {
        // Pong back
        await interaction.reply({
            content: 'Pong!'
        });
        return true
    },
};
