const Sequelize = require('sequelize');
const Crypto = require('crypto');

class EventsHandler {
    constructor() {
        /*
            === Sequelize ===
        */
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: 'db/events.db'
        });

        this.Events = this.sequelize.define('events', {
            guild_id:    Sequelize.STRING,
            name:        Sequelize.STRING,
            description: Sequelize.STRING,
            date:        Sequelize.DATE,
            event_id: {
                type: Sequelize.STRING,
                unique: true
            }
        });

        this.Users = this.sequelize.define('users', {
            user_id:     Sequelize.STRING,
            event_id:    Sequelize.STRING
        });

        this.Users.sync();
        this.Events.sync();
    }

    async new_event(guild, name, description, date) {
        const event_id = Crypto.randomBytes(64).toString('hex');

        const event = await this.Events.create({
            guild_id: guild.id,
            name: name,
            description: description,
            date: date,
            event_id: event_id
        });

        return event
    }
}