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
        "action": (message) => {
            var variables = message.content.split(' ')
            if (variables.length > 1) {
                twitter.find_recent_matching_tweets({ twitter_handle: variables[1], phrases_array: [variables[2]], all_present: true })
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
        'action': (message) => {
            var variables = message.content.split(' ')
            var mongo = new Mongo_dao()
            mongo.get_monitor_list((results) => {
                var return_message_base = variables.length > 1 ? `Monitors on @${variables[1]}` : `I am watching:\n`
                var return_message = results.map(monitor => { return `@${monitor.twitter_handle} for: ${JSON.stringify(monitor.keywords)}` }).join('\n')
                message.channel.send(return_message_base + return_message)
            }, variables[1]);
        }
    }
]

module.exports = message_response