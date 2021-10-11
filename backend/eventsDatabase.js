const { Op, Sequelize } = require('sequelize');
const Crypto = require('crypto');
const { getNthWeekday, whichNthWeekday } = require('./getNthWeekday');

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

        this.Roles = this.sequelize.define('roles', {
            role_id:     Sequelize.STRING,
            guild_id:    Sequelize.STRING
        });

        this.TimeOffsets = this.sequelize.define('time_offsets', {
            guild_id: {
                type: Sequelize.STRING,
                unique: true
            },
            offset:      Sequelize.INTEGER
        })

        this.Users.sync();
        this.Events.sync();
        this.Channels.sync();
        this.Roles.sync();
        this.TimeOffsets.sync();
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

    async eventCount() {
        // Get the total number of scheduled events
        const count = await this.Events.findAll().then(res => res.length);

        return count
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
        const events = await this.getAllEvents(guild)
        
        for (const event of events) {
            await this.leaveEvent(user, event.event_id)
        }

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


    async purgeGuild(guild_id) {
        const all_events = await this.getAllEvents({ id: guild_id });

        // Delete all events
        for (const event of all_events) {
            await this.deleteEvent(event.event_id)
        }

        // Delete all configuration
        await this.Channels.destroy({
            where: {
                guild_id: guild_id
            }
        });

        await this.Roles.destroy({
            where: {
                guild_id: guild_id
            }
        })

        await this.TimeOffsets.destroy({
            where: {
                guild_id: guild_id
            }
        })
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


    async getAllChannels() {
        // Gets everything in the Channels table
        const channels = await this.Channels.findAll({
            order: ["type"] 
        });

        return channels
    }


    async getAllChannelsOfGuild(guild) {
        // Gets everything in the Channels table
        const channels = await this.Channels.findAll({
            where: {
                guild_id: guild.id
            },
            order: ['type']
        });

        return channels
    }


    async addChannelType(channel, type) {
        // Check if the channel is already there
        const channel_type = (await this.getChannelType(channel))
            .map(entry => entry.type);

        if (channel_type.includes(type)) return;

        // Sets the channel type to type
        const channel_type_added = await this.Channels.create({
            guild_id:   channel.guild.id,
            channel_id: channel.id,
            type:       type
        });

        return channel_type_added
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
        // Updates event with the data provided
        const update = await this.Events.update(data, {
            where: {
                event_id:   event_id
            }
        });

        return update
    }


    async handleEventNotification(event_id) {
        // Get the event
        const event = await this.getEvent(event_id);

        // Get attending ids
        const party_list = await this.getParty(event_id);

        // Check if the event is recurring or not and update date if it is
        if (event.recurring == "weekly") {
            // Date
            event.date.setDate(event.date.getDate() + 7);
            await this.updateEvent(event_id, { date: event.date });

            // Kick
            await this.Users.destroy({
                where: {
                    event_id: event_id,
                    user_id: party_list,
                }
            })
        }

        else if (event.recurring == "monthly") {
            // Date
            event.date.setMonth(event.date.getMonth() + 1);
            await this.updateEvent(event_id, { date: event.date });

            // Kick
            await this.Users.destroy({
                where: {
                    event_id: event_id,
                    user_id: party_list,
                }
            })
        }

        else if (event.recurring == "monthly_by_weekday") {
            // Date
            const { weekday, n } = whichNthWeekday(event.date);
            event.date.setMonth(event.date.getMonth() + 1);

            const date = getNthWeekday(
                event.date.getFullYear(), 
                event.date.getMonth(), 
                weekday, n
            ).set({ "hour": event.date.getHours(), "minute": event.date.getMinutes() });

            await this.updateEvent(event_id, { date: date });

            // Kick
            await this.Users.destroy({
                where: {
                    event_id: event_id,
                    user_id: party_list,
                }
            })
        }

        else {
            await this.deleteEvent(event_id);
        }
    }


    async getAllRoles(guild) {
        // Gets all the roles of a guild
        const roles = await this.Roles.findAll({
            where: {
                guild_id: guild.id
            }
        })

        return roles
    }


    async getRole(role) {
        const permissions = await this.Roles.findOne({
            where: {
                role_id: role.id
            }
        })

        return permissions
    }


    async addRole(role) {
        // Get entry if it exists
        const role_permissions = await this.getRole(role)

        if (!role_permissions) {
            // Create the permissions entry if it does not exist
            await this.Roles.create({
                role_id:      role.id,
                guild_id:     role.guild.id
            })
        }
    }


    async removeRole(role) {
        // Removes a role from Roles
        await this.Roles.destroy({
            where: {
                role_id: role.id,
                guild_id: role.guild.id
            }
        })
    }


    async getTimeOffset(guild) {
        // Gets the guild's time offset and returns an integer
        const offset = await this.TimeOffsets.findOne({
            attributes: ['offset'],
            where: {
                guild_id: guild.id
            }
        })

        if (offset === null) return 0;
        else return offset.offset;
    }

    async getPrintableOffset(guild) {
        // Returns 0 padded, signed offset as a string
        const time_offset = await this.getTimeOffset(guild);
        const absolute_offset = Math.abs(time_offset);

        const sign = time_offset < 0 ? "-" : "+";

        return sign + String(absolute_offset).padStart(2, "0");
    }


    async setTimeOffset(guild, offset) {
        await this.TimeOffsets.upsert({
            guild_id: guild.id,
            offset: offset
        });
    }
}

module.exports = EventsHandler
