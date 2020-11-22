var Twitter = require('../twitter/Twitter')
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
    }

]

module.exports = message_response