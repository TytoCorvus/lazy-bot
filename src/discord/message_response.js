var Twitter = require('../twitter/Twitter')
var Mongo_dao = require('../mongo/mongo_dao')
var twitter = new Twitter()

function message_response(message) {
    responses.forEach(response => {
        if (response.exact) {
            if (message.content === response.compare) {
                response.action(message)
            }
        } else {
            if (message.content.match(response.compare)) {
                response.action(message)
            }
        }
    })
}

var responses = [
    {
        "exact": true,
        "compare": "ping",
        "action": (message) => {
            message.channel.send("pong")
        }
    },
    {
        "exact": true,
        "compare": "Nate is...",
        "action": (message) => {
            message.channel.send("Great!")
        }
    },
    {
        "exact": true,
        "compare": "1 2 3",
        "action": (message) => {
            message.channel.send("PRICING!")
        }
    },
    {
        "exact": false,
        "compare": "Dayne",
        "action": (message) => {
            message.channel.send("I heard about him. He's VERY stinky.")
        }
    },
    {
        "exact": false,
        "compare": "!twitter_test",
        "description": "Basic twitter search functionality - provide a twitter handle and a keyword list to search their recent tweets for that word. Will link the first one found.",
        "usage": "!twitter_test <twitter_handle> <keyword>...",
        "action": (message) => {
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

module.exports = message_response