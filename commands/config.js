const { SlashCommandBuilder } = require('@discordjs/builders');
const EventsHandler = require('../backend/eventsDatabase');

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
        // Init
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const events_handler = new EventsHandler();

        if (group == 'channel') {
            const channel = await interaction.options.getChannel("channel");
            const type    = await interaction.options.getString("type");
            if (subcommand == "set") {
                // Process the channel set command
                await events_handler.addChannelType(channel, type);
                
                await interaction.reply({
                    content: `${channel} has been set to \`${type}\``
                })
            }
        }
    },
};
