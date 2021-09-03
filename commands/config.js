const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const EventsHandler = require('../backend/eventsDatabase');
const { colour } = require("../config.json")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configure')
        .setDescription('Prints current configuration')

        // Role group
        .addSubcommandGroup(group =>
            group
                .setName('role')
                .setDescription('Allow or disallow roles to edit events')

                // configure role remove 
                .addSubcommand(subcommand =>
                    subcommand
                        .setName("remove")
                        .setDescription("Dissallow a role to edit events")
                        .addRoleOption(option =>
                            option
                                .setName("role")
                                .setDescription("The role to disallow")
                                .setRequired(true)
                        )
                )

                // configure role add
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

        // channel group
        .addSubcommandGroup(group =>
            group
                .setName('channel')
                .setDescription('Edit channel types')

                // configure channel set
                .addSubcommand(subcommand =>
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

                // configure channel unset
                .addSubcommand(subcommand =>

                    subcommand
                        .setName("unset")
                        .setDescription("Removes a channel type")
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
        )
        
        .addSubcommand(subcommand =>
            subcommand
                .setName("print")
                .setDescription("Prints the current configuration")
        ),

    async execute(interaction) {
        // Init
        const group = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand();
        const events_handler = new EventsHandler();

        // Channel group
        if (group == 'channel') {
            const channel = await interaction.options.getChannel("channel");
            const type    = await interaction.options.getString("type");
            
            // Check if the provided channel is a text channel
            if (channel.type != "GUILD_TEXT") {
                await interaction.reply({
                    content: "Categories are not valid channel options. Please try again.",
                    ephemeral: true
                })

                return
            }

            // configure channel set
            if (subcommand == "set") {
                // Process the channel set command
                await events_handler.addChannelType(channel, type);
                
                await interaction.reply({
                    content: `${channel} has been set to \`${type}\``
                })
            }

            // configure channel unset
            else if (subcommand == "unset") {
                await events_handler.removeChannelType(channel, type);

                await interaction.reply({
                    content: `${channel} is no longer set to \`${type}\``
                })
            }
        }

        // Print config
        if (subcommand == "print") {
            // init embed
            const embed = new MessageEmbed()
                .setColor(colour)
                .setTitle(`Configuration for ${interaction.guild.name}`);
            
            // Get all channels
            const all_channels = await events_handler.getAllChannelsOfGuild(interaction.guild);

            for (entry of all_channels) {
                // get the channel
                const channel = await interaction.guild.channels.fetch(entry.channel_id)

                const title = entry.type == "daily" 
                    ? ":envelope:  Daily notifications channel" 
                    : ":alarm_clock:  Event notifications channel";
                
                // Add to embed
                embed.addField(title, channel.toString());
            }

            // Send embed
            await interaction.reply({
                embeds: [embed]
            })
        }

    },
};
