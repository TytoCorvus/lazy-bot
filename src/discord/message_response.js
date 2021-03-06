const Twitter = require('../twitter/Twitter')
const MESSAGE_UTILS = require('./message_utils')
const mongo = require('../mongo/mongo_dao')
const twitter = new Twitter()
const message_utils = new MESSAGE_UTILS()

function message_response(message) {
    if (message.author.bot) { return; } //Don't respond to bots

    responses.forEach(response => {
        if (response.exact) {
            if (message.content === response.compare) {
                response.action(message)
            }
        } else {
            if (message.content.match(response.compare)) {
                if (response.type == 'command') {
                    //Confirm that the first word in the message is the command
                    if (message.content.split(' ')[0] === response.compare) {
                        response.action(message)
                    }
                } else {
                    //Keywords are just looking for exact matches of the string anywhere
                    response.action(message)
                }
            }
        }
    })
}

var responses = [
    {
        'exact': true,
        'type': 'command',
        'compare': '>commands',
        'description': 'Lists the commands that I can use',
        'usage': '',
        'action': (message) => {
            var response_message = commands().map(response => response.compare).join('\n')
            message.channel.send(`These are the commands that I know:\n${response_message}`)
        }
    },
    {
        'exact': true,
        'type': 'command',
        'compare': '>help',
        'description': 'Get more information on how to use the bot',
        'usage': '',
        'action': (message) => {
            message.channel.send(`Type '>commands' for a list of commands and '>usage <command>' for information on how to use it`)
        }
    },
    {
        'exact': true,
        'type': 'command',
        'compare': '>who',
        'description': 'Quick overview of my purpose',
        'usage': '',
        'action': (message) => {
            message.channel.send(`I am a bot! I do stupid things for stupid reasons.`)
        }
    },
    {
        'exact': true,
        'type': 'command',
        'compare': '>what',
        'description': 'Quick overview of my tasks',
        'usage': '',
        'action': (message) => {
            message.channel.send(`I have currently been tasked with monitoring Twitter for updates with certain words in them`)
        }
    },
    {
        'exact': false,
        'type': 'command',
        'compare': '>usage',
        'description': 'Explain how to use a command',
        'usage': '$usage <command>',
        'action': (message) => {
            var command_text = message.content.split(' ')[1]
            var commands_filtered = commands().filter(item => item.compare === command_text)
            if (commands_filtered.length == 0) {
                message.channel.send(`Could not find a command by that name`)
            } else {
                message.channel.send(`${commands_filtered[0].usage}`)
            }
        }
    },
    {
        'exact': true,
        'type': 'keyword',
        'compare': 'ping',
        'action': (message) => {
            message.channel.send('pong')
        }
    },
    {
        'exact': true,
        'type': 'keyword',
        'compare': 'Nate is...',
        'action': (message) => {
            message.channel.send('Great!')
        }
    },
    {
        'exact': true,
        'type': 'keyword',
        'compare': '1 2 3',
        'action': (message) => {
            message.channel.send('PRICING!')
        }
    },
    {
        'exact': false,
        'type': 'keyword',
        'compare': 'Dayne',
        'action': (message) => {
            message.channel.send(`I heard about him. He's VERY stinky.`)
        }
    },
    {
        'exact': false,
        'type': 'command',
        'compare': '>twitter_test',
        'description': 'Basic twitter search functionality - provide a twitter handle and a keyword list to search their recent tweets for that word. Will link the first one found.',
        'usage': '>twitter_test <twitter_handle> <keyword>...',
        'action': (message) => {
            var variables = message.content.split(' ')
            if (variables.length > 1) {
                twitter.find_recent_matching_tweets({ twitter_handle: variables[1], phrases_array: variables.splice(2, variables.length - 2), all_present: false })
                    .then((id_array) => {
                        if (id_array == undefined || id_array.length == 0) {
                            message.channel.send(`I'm sorry, I wasn't able to find any tweets like that`)
                        } else {
                            message.channel.send(twitter.build_status_link(id_array[0]))
                        }
                    })
                    .catch((err) => {
                        message.channel.send(`I erred out, man, idk. Tell Tyto to get his shit together.`)
                    })
            }
        }
    },
    {
        'exact': false,
        'type': 'command',
        'compare': '>monitors',
        'description': 'List all of the accounts being monitored and for what. Optionally, provide a twitter handle to filter to just that user',
        'usage': '>monitors <twitter_handle?>',
        'action': (message) => {
            var variables = message.content.split(' ')
            mongo.get_monitor_list((results) => {
                if (results.length < 1) {
                    if (variables[1] != undefined && variables[1] != null) {
                        message.channel.send(`There are currently no monitors on @${variables[1]}`);
                    } else {
                        message.channel.send(`There are currently no monitors for the server`)
                    }
                    return;
                }
                var return_message_base = variables.length > 1 ? `Monitors on ` : `I am watching:\n`
                var return_message = results.map(monitor => { return `@${monitor.twitter_handle} for: ${JSON.stringify(monitor.keywords)}` }).join('\n')
                message.channel.send(return_message_base + return_message)
            }, message.guild.id, variables[1]);
        }
    },
    {
        'exact': false,
        'type': 'command',
        'compare': '>add_monitor',
        'description': 'Add an account to monitor and the keywords to look for. Automatically tags the creator.',
        'usage': '>add_monitor <twitter_handle> <keyword>... <User Mention>... <Option>...',
        'options': {
            retweets: "true/false",
            all: "true/false"
        },
        'action': (message) => {
            var { words, options } = message_utils.parse(message.content)
            var phrases_array = words.splice(1, words.length - 1).filter(keyword => !keyword.match('@')) //phrases not including user mentions

            var user_arr = message.mentions.users.map(user => user.id)
            if (!user_arr.includes(message.author.id)) {
                user_arr.push(message.author.id)
            }

            mongo.insert_monitor({
                twitter_handle: words[0],
                keywords: phrases_array,
                all_present: false,
                guild_id: message.guild.id,
                users_listening: user_arr,
                options: { ...options }
            })
                .then(() => { message.channel.send(`Successfully created your requested monitor!`) })
                .catch(() => { message.channel.send(`I had an issue creating this monitor - No changes saved.`) })
                .finally(() => { mongo.insert_author(words[0], message.guild.id).then(result => { }).catch((err) => { console.log(`Error inserting author for monitor. ${err}`) }) })
        }
    },
    {
        'exact': false,
        'type': 'command',
        'compare': '>remove_monitor',
        'description': 'Removes all monitors for this twitter_handle on this server',
        'usage': '>remove_monitor <twitter_handle>',
        'action': (message) => {
            var variables = message.content.split(' ')
            if (variables.length < 1) {
                message.channel.send(`Usage: >remove_monitor <twitter_handle>`)
                return;
            }

            mongo.remove_monitor({
                twitter_handle: variables[1],
                guild_id: message.guild.id
            })
                .then((result) => { message.channel.send(`Deleted ${result.deletedCount} monitors on ${variables[1]}`) })
                .catch((err) => { message.channel.send(`I had an issue deleting monitors - No changes saved.`) })
        }
    },
    {
        'exact': false,
        'type': 'command',
        'compare': '>listen',
        'description': 'Add yourself to monitoring alerts for various twitter feeds',
        'usage': '>listen <twitter_handle>',
        'action': (message) => {
            var variables = message.content.split(' ')
            if (variables.length < 2) {
                message.channel.send(`You need to specify a twitter handle to listen for.`)
                return;
            }

            mongo.add_listener(variables[1], message.guild.id, message.author.id)
                .then((result) => {
                    if (result.modifiedCount == 0) {
                        message.channel.send(`There are either no monitors or none you aren't already listening to.`)
                    } else {
                        message.channel.send(`Successfully added you to ${result.modifiedCount} notifications for ${variables[1]}`)
                    }
                }).catch((err) => {
                    message.channel.send(`Ran into an error adding you as a listener.`)
                })
        }
    },
    {
        'exact': false,
        'type': 'command',
        'compare': '>unlisten',
        'description': 'remove yourself to monitoring alerts for a twitter feed',
        'usage': '>unlisten <twitter_handle>',
        'action': (message) => {
            var variables = message.content.split(' ')
            if (variables.length < 2) {
                message.channel.send(`You need to specify a twitter handle to listen for.`)
                return;
            }

            mongo.remove_listener(variables[1], message.guild.id, message.author.id)
                .then((result) => {
                    if (result.modifiedCount == 0) {
                        message.channel.send(`There are no monitors to remove you from.`)
                    } else {
                        message.channel.send(`Successfully removed you from ${result.modifiedCount} notifications for ${variables[1]}`)
                    }
                }).catch((err) => {
                    message.channel.send(`Ran into an error removing you as a listener.`)
                })
        }
    },
    {
        'exact': true,
        'type': 'command',
        'compare': '>listening',
        'description': 'List the alerts that you\'re currently tagged on',
        'usage': '>listening',
        'action': (message) => {
            mongo.get_listening((results) => {

                if (results.length < 1) {
                    message.channel.send(`You are not currently listening to monitors on this server.`)
                    return;
                }
                var return_message_base = `You are listening to:\n`
                var return_message = results.map(monitor => { return `@${monitor.twitter_handle} for: ${JSON.stringify(monitor.keywords)}` }).join('\n')
                message.channel.send(return_message_base + return_message)
            },
                message.author.id,
                message.guild.id)
        }
    },
    {
        'exact': true,
        'type': 'command',
        'compare': '>settings',
        'description': 'Returns the settings for the current guild, such as the default notification channel.',
        'usage': '>settings',
        'action': (message) => {
            var empty_message = `There are currently no settings saved for this server.`
            mongo.get_guild_settings(message.channel.guild.id)
                .then((results) => {
                    if (results.length > 0) {
                        message.channel.send(empty_message)
                    } else {
                        message.channel.send(`The default channel is <#${results.channel_id}>`)
                    }
                })
                .catch((err) => {
                    message.channel.send(`There was an issue retrieving the settings for this server.`)
                })
        }
    },
    {
        'exact': true,
        'type': 'command',
        'compare': '>set_channel',
        'description': 'Updates the notification channel for the server to the current one',
        'usage': '>set_channel',
        'action': (message) => {
            mongo.upsert_guild_settings(message.channel.guild.id, { 'channel_id': message.channel.id })
                .then((results) => {
                    message.channel.send(`Default channel successfully updated`)
                })
                .catch((err) => {
                    message.channel.send(`There was an error updating the default channel`)
                })
        }
    },
    {
        'exact': false,
        'type': 'command',
        'compare': '>JJBA',
        'description': 'Used to link JoJo themes! Try: Joseph, Giorno, Crusaders, Beatdown',
        'usage': '>JJBA <theme>',
        'action': (message) => {
            var variables = message.content.trim().split(' ')

            mongo.get_jojo_themes((themes_array) => {
                if (!themes_array || themes_array.length == 0) {
                    message.channel.send('Had an issue finding the themes... :\\')
                    return;
                }

                var chosen = variables[1]
                if (chosen == undefined || chosen == null) {
                    var theme_chosen = Math.floor(Math.random() * themes_array.length) //Get a random theme from the list provided
                    message.channel.send(themes_array[theme_chosen].link)
                } else {
                    var chosen_lower = chosen.toLowerCase()

                    if (chosen_lower === 'list') {
                        var response_string = 'Theme names that work are:\n'
                        themes_array.forEach(theme => { response_string += `${theme.name}\n` })
                        message.channel.send(response_string)
                    } else if (chosen_lower === 'beatdown') {
                        var beatdowns_array = themes_array.filter(theme => { return theme.beatdown })
                        var theme_chosen = Math.floor(Math.random() * beatdowns_array.length)
                        message.channel.send(beatdowns_array[theme_chosen].link)
                    } else {
                        var matching_themes_array = themes_array.filter(theme => { return theme.name === chosen_lower })

                        if (matching_themes_array.length <= 0) {
                            message.channel.send('I couldn\'t find a JoJo theme with that name')
                            return;
                        }

                        message.channel.send(matching_themes_array[0].link)
                    }
                }
            })
        }
    }
]

var commands = () => {
    return responses.filter(response => response.description)
}

module.exports = message_response