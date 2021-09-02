const EventsHandler = require('./eventsDatabase');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

const event_regex = /Events \(page (?<page_string>\d+|NaN)\/\d+\)/


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


async function generateEventsList(guild, page) {
    // Get all events
    const events_handler = new EventsHandler();
    const scheduled_events = await events_handler.getAllEvents(guild)

    const max_pages = Math.ceil(scheduled_events.length / 5);

    console.log(max_pages == 0)

    // If max_pages == 0 then page % max_pages == NaN
    // If there are no events, we want to say page 0/0
    page = max_pages > 0 ? Math.abs(page % max_pages) : -1

    // init embed
    const embed = new MessageEmbed()
        .setTitle(`Events (page ${page + 1}/${max_pages})`);

    for (event_entry of scheduled_events.slice(page * 5, page + 1 * 5)) {
        // Loop over events and add them to the embed

        // Get party
        const party_list = await events_handler.getParty(event_entry.event_id);

        // Get display names
        const display_names = []
        for (user_id of party_list) {
            const member = await guild.members.fetch(user_id);
            display_names.push(member.displayName);
        }

        // Check if names are empty
        if (!display_names.length) {
            display_names.push("Nobody");
        }

        const date_string = moment(event_entry.date).format("MMM Do [at] kk:mm");

        // Update embed
        embed.addFields(
            {
                name: `${event_entry.name} (${date_string})`, 
                value: event_entry.description, 
                inline: true
            },
            {
                name: "Party",
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

module.exports = { generateEventsList, getPageFromEventsList };