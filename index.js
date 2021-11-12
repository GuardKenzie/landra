const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, topgg_token, debug } = require('./secret.json');
const { AutoPoster } = require('topgg-autoposter');


// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

// Create top.gg autoposter
if (!debug) {
    const auto_poster = AutoPoster(topgg_token, client);

    auto_poster.on('posted', () => {
        console.log('-> Posted stats to Top.gg!')
    });
}

/*
    === Read command files ===
*/
client.commands = new Collection();
const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of command_files) {
    // Loop over command fiels and add them to the bot
    const command = require(`./commands/${file}`);

    client.commands.set(command.data.name, command)
}


/*
    === Read event files ===
*/
const event_files = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of event_files) {
    // Loop over event files and register them
    const event = require(`./events/${file}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.on("error", () => { client.login(token) });

/*
    === Read button files ===
*/
client.buttons = new Collection();
const button_files = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

for (const file of button_files) {
    // Liioop over button files and register them
    const button = require(`./buttons/${file}`);

    client.buttons.set(button.name, button);
}


/*
    === Read select menu files ===
*/
client.select_menus = new Collection();
const select_menu_files = fs.readdirSync('./menus').filter(file => file.endsWith('.js'));

for (const file of select_menu_files) {
    // Loop over button files and register them
    const select_menu = require(`./menus/${file}`);

    client.select_menus.set(select_menu.name, select_menu);
}

// Log in
client.login(token);
