const Sequelize = require('sequelize');
const Crypto = require('crypto');

// A class that handles all database operations. Methods:

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
            },
            recurring:  Sequelize.STRING
        });

        this.Channels = this.sequelize.define('channels', {
            guild_id:   Sequelize.STRING,
            type:       Sequelize.STRING,
            channel_id: Sequelize.STRING
        });

        this.Users = this.sequelize.define('users', {
            user_id:     Sequelize.STRING,
            event_id:    Sequelize.STRING
        });

        this.Users.sync();
        this.Events.sync();
        this.Channels.sync();
    }

    async newEvent(guild, name, description, date, recurring) {
        const event_id = Crypto.randomBytes(32).toString('hex');
        
        const event = await this.Events.create({
            guild_id: guild.id,
            name: name,
            description: description,
            date: date,
            event_id: event_id,
            recurring: recurring
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


    async getEvent(event_id) {
        // Get the event with event_id
        const event_result = await this.Events.findOne({
            where: { event_id: event_id }
        });

        return event_result
    }


    async getEventsBetween(guild, start_date, end_date) {
        // Get all the events that are happening in guild
        // between start_date and end_date
        const events = await this.Events.findAll({
            where: {
                guild_id: guild.id,
                date: {
                    [Op.between]: [start_date, end_date]
                }
            }
        });

        return events;
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


    async getEventsOfUser(user) {
        // Get all the events ids of events the user with user_id
        // has joined
        const events = await this.Users.findAll({
            attributes: ['event_id'],
            where: {
                user_id: user.id
            } 
        });

        return events.map(event => event.event_id);
    }


    async joinEvent(user, event_id) {
        // Add the user with user_id to the event with event_id
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
        // Removes this user from all events scheduled int the guild
        const events = await this.getAllEvents(guild.id).forEach(async event => {
            await this.leaveEvent(user, event.event_id)
        });

        return events;
    }


    async purgeUser(user) {
        // Purges all entries with user's id in the database
        const purge = await this.Users.destroy({
            where: {
                user_id: user.id
            }
        });

        return purge;
    }

    
    async getChannelType(channel) {
        // Gets all types associated with the channel
        const types = await this.Channels.findAll({
            attributes: ['type'],
            where: {
                guild_id:   channel.guild.id,
                channel_id: channel.id
            } 
        });

        return types
    }


    async addChannelType(channel, type) {
        // Sets the channel type to type
        const channel_type = await this.Channels.create({
            guild_id:   channel.guild.id,
            channel_id: channel.id,
            type:       type
        });

        return channel_type
    }


    async removeChannelType(channel, type) {
        // Removes a channel type from channel
        const remove_type = await this.Channels.destroy({
            where: {
                type:       type,
                channel_id: channel.id,
                guild_id:   channel.guild.id
            }
        });

        return remove_type
    }


    async updateEvent(event_id, data) {
        const update = await this.Events.update(data, {
            where: {
                event_id:   event_id
            }
        });

        return update
    }
}

module.exports = EventsHandler
