const fs = require('fs');
const { REST }                     = require('@discordjs/rest');
const { Routes }                   = require('discord-api-types/v9');
const { clientId, guildId }        = require('./config.json')
const { token }                    = require('./secret.json')

// Read command files
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    // Loop over command fiels and add them to array
    const command = require(`./commands/${file}`);

    commands.push(command.data.toJSON());
}


const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
    }
    catch (error) {
        console.error(error);
    }
})();