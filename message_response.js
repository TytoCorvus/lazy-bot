function message_response(message){
    responses.forEach(response => {
        if(response.exact){
            if(message.content === response.compare){
                response.action(message)
            }
        }
    })
}

var responses = [
    {
        "exact":true,
        "compare":"ping",
        "action":(message) => {
            message.channel.send("pong")
        }
    },
    {
        "exact":true,
        "compare":"Nate is...",
        "action":(message) => {
            message.channel.send("Great!")
        }
    }

]

module.exports = message_response