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

        // Channel command
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Set or unset a channel type')
                .addStringOption(option =>
                    option
                        .setName("action")
                        .setDescription("Whether to set or usnet the channel type")
                        .addChoices([
                            [
                                "set",
                                "set"
                            ],
                            [
                                "unset",
                                "unset"
                            ]
                        ])
                        .setRequired(true)
                )
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

        // Role group
        .addSubcommand(subcommand =>
            subcommand
                .setName('role')
                .setDescription('Allow or disallow roles to edit events')
                .addStringOption(option =>
                    option
                        .setName("action")
                        .setDescription("Whether to allow or disallow the role to manage events")
                        .addChoices([
                            [
                                "allow",
                                "allow"
                            ],
                            [
                                "disallow",
                                "disallow"
                            ]
                        ])
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName("role")
                        .setDescription("Which role to configure")
                        .setRequired(true)
                )

        )

        // Print command
        .addSubcommand(subcommand =>
            subcommand
                .setName("print")
                .setDescription("Prints the current configuration")
        )

        // Time command
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
        const subcommand = interaction.options.getSubcommand();
        const events_handler = new EventsHandler();

        // Channel group
        if (subcommand == 'channel') {
            const channel = await interaction.options.getChannel("channel");
            const type    = await interaction.options.getString("type");
            const action  = await interaction.options.getString("action");

            // Check if the provided channel is a text channel
            if (channel.type != "GUILD_TEXT") {
                await interaction.reply({
                    content: "Categories are not valid channel options. Please try again.",
                    ephemeral: true
                }).catch(console.error);

                return
            }

            // configure channel set
            if (action == "set") {
                // Process the channel set command
                await events_handler.addChannelType(channel, type);
                
                await interaction.reply({
                    content: `${channel} has been set to \`${type}\``
                }).catch(console.error);
            }

            // configure channel unset
            else if (action == "unset") {
                await events_handler.removeChannelType(channel, type);

                await interaction.reply({
                    content: `${channel} is no longer set to \`${type}\``
                }).catch(console.error);
            }
        }

        // Role group
        if (subcommand == 'role') {
            const role =   await interaction.options.getRole('role');
            const action = await interaction.options.getString("action");

            if (action == 'allow') {
                await events_handler.addRole(role);

                await interaction.reply({
                    content: `${role} can now manage events!`
                }).catch(console.error);

                return
            }

            if (action == 'disallow') {
                await events_handler.removeRole(role);

                await interaction.reply({
                    content: `${role} can no longer manage events!`
                }).catch(console.error);

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
            }).catch(console.error);

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
            }).catch(console.error);
        }

    },
};
