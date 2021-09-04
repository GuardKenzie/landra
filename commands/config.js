const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const EventsHandler = require('../backend/eventsDatabase');
const { colour } = require("../config.json")
const { isAdmin } = require("../backend/misc");

module.exports = {
    checks: [isAdmin],

    data: new SlashCommandBuilder()
        .setName('config')
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
        )

        .addSubcommand(subcommand => 
            subcommand
                .setName("time")
                .setDescription("Sets the time offset for this guild")
                .addStringOption(option =>
                    option
                        .setName("offset")
                        .setDescription("The time offset")
                        .setRequired(true)
                        .addChoices((() => {
                            const choices = [];

                            for (i = -12; i <= 12; i++) {
                                const out_string = i >= 0
                                    ? `UTC+${i}`
                                    : `UTC${i}`
                                choices.push([out_string, i.toString()])
                            }
                            
                            return choices
                        })())
                )

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

        // Role group
        if (group == 'role') {
            const role = interaction.options.getRole('role');

            if (subcommand == 'add') {
                await events_handler.addRole(role);

                await interaction.reply({
                    content: `${role} can now manage events!`
                })

                return
            }

            if (subcommand == 'remove') {
                await events_handler.removeRole(role);

                await interaction.reply({
                    content: `${role} can no longer manage events!`
                })

                return
            }
        }

        // Time command
        if (subcommand == "time") {
            // Get offset
            const offset = parseInt(interaction.options.getString("offset"));
            
            // insert offset
            await events_handler.setTimeOffset(interaction.guild, offset);

            const time_offset_string = offset >= 0
                ? `UTC+${offset.toString()}`
                : `UTC${offset.toString()}`

            await interaction.reply({
                content: `Offset set to \`${time_offset_string}\``
            })

        }

        // Print config
        if (subcommand == "print") {
            // init embed
            const embed = new MessageEmbed()
                .setColor(colour)
                .setTitle(`Configuration for ${interaction.guild.name}`);
            

            // Time offset
            const time_offset = await events_handler.getTimeOffset(interaction.guild);
            const time_offset_string = time_offset >= 0
                ? `\`UTC+${time_offset.toString()}\``
                : `\`UTC${time_offset.toString()}\``

            embed.setDescription("**Time offset:** " + time_offset_string);

            // Get all channels
            const all_channels = await events_handler.getAllChannelsOfGuild(interaction.guild);

            for (entry of all_channels) {
                // get the channel
                const channel = await interaction.guild.channels.fetch(entry.channel_id)

                const title = entry.type == "daily" 
                    ? ":envelope:⠀Daily notifications channel" 
                    : ":alarm_clock:⠀Event notifications channel";
                
                // Add to embed
                embed.addField(title, channel.toString());
            }


            // Get all roles
            const all_roles = await events_handler.getAllRoles(interaction.guild);

            const role_mentions = []

            for (entry of all_roles) {
                // Get all mention strings
                const role = await interaction.guild.roles.fetch(entry.role_id);
                role_mentions.push(role.toString());
            }

            if (role_mentions.length == 0) role_mentions.push("None");

            // Create roles field
            embed.addField("Roles that can manage events", role_mentions.join("\n"));

            // Send embed
            await interaction.reply({
                embeds: [embed]
            })
        }

    },
};
