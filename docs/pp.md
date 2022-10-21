# Privacy policy

This document details what data Landra stores on you. Landra will only store user inputs which were made with intent towards her - whether that be through a command, or interaction with action rows.

At any time, a user can purge all references to their Discord user id from Landra's database using the `/purge` command. When removed from your guild, Landra will remove all references to your Guild (including scheduled events, users attending those events, etc.) from her database.

## What data is stored?
The following section details what data is stored when users execute the relevant commands or interactions.

### Configuration
The configuration is used to taylor Landra to your server's needs.

| Data | What is it used for? |
|------|----------------------|
| Guild ID | Associates this configuration to your server. |
| Time offset | If configured, it is used to calculate when event notifications are to be sent, and to allow users to schedule events in their own time zone. |
| Management role IDs | If configured using the `/config role` command, these are used to restrict the certain commands to only be available to users with these roles. |
| Channel IDs | If configured using the `/config channel` command, they are used to post the relevant notifications in the relevant channels. |
| Channel types | If configured using the `/config channel` command, they are used to discern what type of notification to post in that channel. |

### Scheduling events
The scheduled events are any events created with the `/schedule` command.

| Data | What is it used for? |
| ---- | -------------------- |
| Guild ID | Associates this event with your server. |
| Event ID | A random string representing the event. |
| Event name | Used to display the event name in event list's, notifications, etc. |
| Event description | Used to display the event description in event list's, notifications, etc. |
| Date | Used to display the event date in event list's, notifications, etc. as well as being used to send event notifications. |
| Recurring value | If provided, it is used to calculate when the event will next take place and update the event's date accordingly |
| Voice channel ID | If provided, it is used to display the relevant voice channel in event lists, notifications, etc. as well as being used to schedule Discord events set to take place in that voice channel |

### Joining events
A user can join an event by interacting with action rows on messages created by Landra.

| Data | What is it used for? |
| ---- | -------------------- |
| User ID | Used to create mentions to the user in event lists, notifications, etc. |
| Event ID | Used to associate a user with an event they have joined. |