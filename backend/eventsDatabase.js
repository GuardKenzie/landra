const Sequelize = require('sequelize');
const Crypto = require('crypto');


class EventsHandler {
    constructor() {
        /*
            === Sequelize ===
        */
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: 'db/events.db',
            logging: false
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

    async newEvent(guild, name, description, date) {
        const event_id = Crypto.randomBytes(32).toString('hex');

        const event = await this.Events.create({
            guild_id: guild.id,
            name: name,
            description: description,
            date: date,
            event_id: event_id
        });

        return event;
    }

    async getAllEvents(guild) {
        //  Get all events scheduled in guild
        const event_list = await this.Events.findAll({
            where: {
                guild_id: guild.id,
            },
            order: [
                ["date", "ASC"]
            ]
        });

        return event_list;
    }


    async getParty(event_id) {
        // Get the party for a particular event
        const party = await this.Users.findAll({
            attributes: ['user_id'],
            where: {
                event_id: event_id
            }
        });

        return party.map(user => user.user_id);
    }


    async getEventsOfUser(user_id) {
        const events = await this.Users.findAll({
            attributes: ['event_id'],
            where: {
                user_id: user_id
            } 
        });

        return events.map(event => event.event_id);
    }


    async joinEvent(user, event_id) {
        // Add the user with user_id to the event with
        // event_id
        const join = await this.Users.create({
            event_id: event_id,
            user_id: user.id
        });

        return join
    }


    async leaveEvent(user, event_id) {
        // Remove user from a particular event
        const leave = await this.Users.destroy({
            where: {
                user_id: user.id,
                event_id: event_id
            }
        });

        return leave;
    }


    async deleteEvent(event_id) {
        // Remove the actual event
        const remove = await this.Events.destroy({
            where: {
                event_id: event_id
            }
        });

        // Remove all user entries as well
        const leave = await this.Users.destroy({
            where: {
                event_id: event_id
            }
        });

        return remove && leave;
    }


    async purgeFromGuild(guild, user) {
        const events = await this.getAllEvents(guild.id).forEach(async event => {
            await this.leave(user.id, event.event_id)
        });

        return events;
    }


    async purgeUser(user) {
        const purge = await this.Users.destroy({
            where: {
                user_id: user.id
            }
        });

        return purge;
    }
}

module.exports = EventsHandler