const EventsHandler = require('./eventsDatabase');
const { MessageEmbed, DataResolver } = require('discord.js');
const moment = require('moment');
const { colour } = require('../config.json');
const foodEmoji = require('./food')


const event_regex = /Events \(page (?<page_string>\d+|NaN)\/\d+\)/

async function generateNotification(entry, guild, type) {
    // Init events handler
    const events_handler = new EventsHandler();

    // Get party
    const party_list = await events_handler.getParty(entry.event_id);

    // Get display names and mentions
    const display_names = []
    const mentions = []

    for (user_id of party_list) {
        const member = await guild.members.fetch(user_id);

        display_names.push(member.displayName);
        mentions.push(member.toString())
    }

    // Party count
    const party_count = display_names.length

    // Check if names are empty
    if (!display_names.length) {
        display_names.push("Nobody");
        mentions.push("Please someone join :(")
    }

    // Get food emoji
    const emoji = foodEmoji(entry.event_id);

    // Embed title
    const embed_title = type == 1 
        ? `${emoji} ${entry.name} is starting in an hour` 
        : `${emoji} ${entry.name} is starting now!`

    // Init embed
    const notification_colour = type == 1 ? "ORANGE" : "RED";
    const embed = new MessageEmbed()
        .setTitle(embed_title)
        .setColor(notification_colour)
        .addFields(
            {
                name: "Description",
                value: entry.description
            },
            {
                name: `Party (${party_count})`,
                value: display_names.join("\n")
            }
        );
    
    return { content: mentions.join(" "), embeds: [embed] };
}


async function postDailyNotifications(client) {
    // Init events handler
    const events_handler = new EventsHandler();

    const all_channels = await events_handler.getAllChannels()

    for (entry of all_channels) {
        // Init
        const guild   = await client.guilds.fetch(entry.guild_id);
        const channel = await guild.channels.fetch(entry.channel_id);

        // We don't want non daily channels
        if (entry.type != "daily") continue;

        // Get this day
        const now = new Date();

        // Get guild time offset and adjust now
        const events_handler = new EventsHandler();
        const time_offset = await events_handler.getTimeOffset(guild);

        now.setHours(now.getHours() + time_offset)

        // Check if time is 10:00
        if (!(now.getHours() == 10 && now.getMinutes() == 00)) return

        // Get tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Get all events happening today
        const all_events = await events_handler.getEventsBetween(guild, now, tomorrow);

        // Do not send anything if nothing is on the schedule
        if (all_events.length == 0) return

        // Aggregate all messages
        const message_contents = [":envelope:  **__TODAY'S SCHEDULE__**  :envelope:"]
        for (entry of all_events) {
            const offset_date = entry.date
            offset_date.setHours(offset_date.getHours() + time_offset)

            const date = moment(offset_date)
            const emoji_hour = date.format("h")

            const emoji = date.minute() >= 30 ? `:clock${emoji_hour}30:` : `:clock${emoji_hour}:`;

            message_contents.push(
                `${emoji}\t\t**${entry.name}** at ${date.format("kk:mm")}`
            )
        }

        // Send message
        await channel.send({
            content: message_contents.join("\n\n")
        });
    }
}


async function postEventNotifications(client) {
    // Init events handler
    const events_handler = new EventsHandler();

    const all_channels = await events_handler.getAllChannels()

    // Loop over channel and handle each
    for (entry of all_channels) {
        // Init
        const guild   = await client.guilds.fetch(entry.guild_id);
        const channel = await guild.channels.fetch(entry.channel_id);
        const now     = new Date()

        // Check if channel is for event notifications
        if (entry.type != "notifications") continue;

        // In 1 minute
        const in_a_minute = new Date()
        in_a_minute.setMinutes(now.getMinutes() + 1)

        const events_now = await events_handler.getEventsBetween(guild, now, in_a_minute);

        // Generate and send notifications
        for (entry of events_now) {
            const message_data = await generateNotification(entry, guild, 0);

            // Send message
            await channel.send(message_data)
                .then(msg => {
                    setTimeout(() => msg.delete(), 5 * 60 * 1000);
                });

            // Handle deleting or updating event
            await events_handler.handleEventNotification(entry.event_id)
        }

        // In 1 hour
        const now_after_hour = new Date()
        now_after_hour.setHours(now_after_hour.getHours() + 1)

        const now_after_hour_minute = new Date(now_after_hour)
        now_after_hour_minute.setMinutes(now_after_hour.getMinutes() + 1)

        const events_in_hour = await events_handler.getEventsBetween(guild, now_after_hour, now_after_hour_minute);

        // Generate and send notifications
        for (entry of events_in_hour) {
            const message_data = await generateNotification(entry, guild, 1);

            // Send message
            await channel.send(message_data)
                .then(msg => {
                    setTimeout(() => msg.delete(), 60 * 60 * 1000);
                });
        }
    }
}


function getPageFromEventsList(message) {
    // Get page from embed title
    const { page_string } = event_regex.exec(
        message.embeds[0].title
    ).groups

    if (isNaN(parseInt(page_string))) {
        return 0
    }
    else {
        return parseInt(page_string) - 1;
    }
}


function parseDate(date_string, recurring) {
    // null date_string is valid
    if (date_string == null) return { valid: true, date: null }

    const now = new Date();
    
    // Parse date
    const date_format = "YYYY/MM/DD kk:mm";
    const date        = moment(date_string, date_format);
    
    // Checks if a date is valid and returns an appropriate error
    // message if not

    if (isNaN(date)) {
        // Check if the date is valid
        return {
            valid: false,
            error: `The provided date: \`${date_string}\` is invalid. Please try again`,
        };
    }

    if (date < now) {
        // Check if the date is in the past
        return {
            valid: false,
            error: `The provided date: \`${date_string}\` is in the past. Please try again`,
        }
    }

    // Check if event is recurring monthly and if so, its day of the month
    // is less than 28
    if (recurring == "monthly" && date.date() > 28) {
        return {
            valid: false,
            error: "You cannot schedule a monthly event for later than the 28th of the month",
        }
    }

    return { valid: true, date: date };
}


async function generateEventsList(guild, page) {
    // Get all events
    const events_handler = new EventsHandler();
    const scheduled_events = await events_handler.getAllEvents(guild)

    // Get time offset
    const time_offset = await events_handler.getTimeOffset(guild);
    const time_offset_string = time_offset >= 0
        ? "+" + time_offset.toString()
        : time_offset.toString()

    // Figure out how many pages there will be
    const max_pages = Math.ceil(scheduled_events.length / 5);

    // If max_pages == 0 then page % max_pages == NaN
    // If there are no events, we want to say page 0/0
    page = max_pages > 0 ? Math.abs(page % max_pages) : -1

    // init embed
    const embed = new MessageEmbed()
        .setColor(colour)
        .setTitle(`Events (page ${page + 1}/${max_pages})`)
        .setDescription(`All times are provided in \`UTC${time_offset_string}\``)
        .setFooter(`${page + 1}/${max_pages}`)
        .setTimestamp(Date.now())

    for (event_entry of scheduled_events.slice(page * 5, (page + 1) * 5)) {
        // Loop over events and add them to the embed

        // Get party
        const party_list = await events_handler.getParty(event_entry.event_id);

        // Get display names
        const display_names = []
        for (user_id of party_list) {
            const member = await guild.members.fetch(user_id);
            display_names.push(member.displayName);
        }

        // Party count
        const party_count = display_names.length

        // Check if names are empty
        if (!display_names.length) {
            display_names.push("Nobody");
        }

        // Set the appropriate date format
        const date_format = 
            event_entry.recurring == "weekly" ? (
                "dddd[s at] kk:mm"
            )
            : event_entry.recurring == "monthly" ? (
                        "[The] Do [of every month at] kk:mm"
            )
            : "MMM Do [at] kk:mm"

        // Get time offset
        event_entry.date.setHours(event_entry.date.getHours() + time_offset);

        const date_string = moment(event_entry.date).format(date_format);
        
        // Get food emoji
        const emoji = foodEmoji(event_entry.event_id);

        // Update embed
        embed.addFields(
            {
                name: `${emoji}⠀${event_entry.name} (${date_string})`, 
                value: event_entry.description, 
                inline: true
            },
            {
                name: `Party (${party_count})`,
                value: display_names.join("\n"),
                inline: true
            },
            {
                name: "⠀",
                value: "⠀",
                inline: false
            }
        );
    }

    return embed
}

function isAdmin(interaction) {
    // get member
    const member = interaction.member;

    return member.permissions.has("ADMINISTRATOR");
}


async function hasEventPermissions(interaction) {
    // get member
    const member = interaction.member;
    
    // Check if admin
    if (isAdmin(interaction)) return true;

    // init events handler
    const events_handler = new EventsHandler();

    // get all event roles
    const allowed_roles = await events_handler.getAllRoles(interaction.guild)

    // Check if any of the roles are allowed
    return member.roles.cache.hasAny(
        ...allowed_roles.map(role => role.role_id)
    );
}


async function setStatus(client) {
    const events_handler = new EventsHandler();
    const guild_count = await client.guilds.fetch().then(coll => coll.size);
    const event_count = await events_handler.eventCount();

    const status = `${event_count} events in ${guild_count} guilds`
    client.user.setActivity(status, { type: "WATCHING" });
}


module.exports = { setStatus, hasEventPermissions, isAdmin, postDailyNotifications, postEventNotifications ,generateEventsList, getPageFromEventsList, parseDate };
