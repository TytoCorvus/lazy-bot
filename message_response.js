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
    }

]

module.exports = message_response