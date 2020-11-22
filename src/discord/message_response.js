var Twitter = require('../twitter/Twitter')
var Mongo_dao = require('../mongo/mongo_dao')
var twitter = new Twitter()

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
        'compare': '!commands',
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
        'compare': '!help',
        'description': 'Get more information on how to use the bot',
        'usage': '',
        'action': (message) => {
            message.channel.send(`Type '!commands' for a list of commands and '!usage <command>' for information on how to use it`)
        }
    },
    {
        'exact': true,
        'type': 'command',
        'compare': '!who',
        'description': 'Quick overview of my purpose',
        'usage': '',
        'action': (message) => {
            message.channel.send(`I am a bot! I do stupid things for stupid reasons.`)
        }
    },
    {
        'exact': true,
        'type': 'command',
        'compare': '!what',
        'description': 'Quick overview of my tasks',
        'usage': '',
        'action': (message) => {
            message.channel.send(`I have currently been tasked with monitoring Twitter for updates with certain words in them`)
        }
    },
    {
        'exact': false,
        'type': 'command',
        'compare': '!usage',
        'description': 'Explain how to use a command',
        'usage': '!usage <command>',
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
        'compare': '!twitter_test',
        'description': 'Basic twitter search functionality - provide a twitter handle and a keyword list to search their recent tweets for that word. Will link the first one found.',
        'usage': '!twitter_test <twitter_handle> <keyword>...',
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
        'compare': '!monitoring',
        'description': 'List all of the accounts being monitored and for what. Optionally, provide a twitter handle to filter to just that user',
        'usage': '!monitoring <twitter_handle?>',
        'action': (message) => {
            var variables = message.content.split(' ')
            var mongo = new Mongo_dao()
            mongo.get_monitor_list((results) => {
                if (results.length < 1) {
                    message.channel.send(`There are currently no monitors on @${variables[1]}`);
                    return;
                }
                var return_message_base = variables.length > 1 ? `Monitors on ` : `I am watching:\n`
                var return_message = results.map(monitor => { return `@${monitor.twitter_handle} for: ${JSON.stringify(monitor.keywords)}` }).join('\n')
                message.channel.send(return_message_base + return_message)
            }, variables[1]);
        }
    },
    {
        'exact': false,
        'type': 'command',
        'compare': '!add_monitor',
        'description': 'Add an account to monitor and the keywords to look for',
        'usage': '!add_monitor <twitter_handle> <keyword> <keyword>...',
        'action': (message) => {
            var variables = message.content.split(' ')
            var mongo = new Mongo_dao()
            mongo.insert_monitor({
                twitter_handle: variables[1],
                keywords: variables.splice(2, variables.length - 2),
                all_present: false
            })
                .then((result) => { message.channel.send(`I successfully created your requested monitor!`) })
                .catch((err) => { message.channel.send(`I had an issue creating this monitor - No changes saved.`) })

        }
    }
]

var commands = () => {
    return responses.filter(response => response.description)
}

module.exports = message_response