// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
  // If the message is "ping"
  if (message.content === 'ping') {
    // Send "pong" to the same channel
    message.channel.send('pong');
  }
});

client.on('message', message => {
    // If the message is "ping"
    if (message.content === 'Nate is...') {
      // Send "pong" to the same channel
      message.channel.send('Great!');
    }
});

client.on('message', message => {
// If the message is "ping"
if (message.content === 'Bodie is...') {
    // Send "pong" to the same channel
    message.channel.send('Awesome sauce');
}
});

client.on('message', message => {
    // If the message is "ping"
    if (message.content === 'Treat yo\' self!') {
        // Send "pong" to the same channel
        message.channel.send('Absolutely');
    }
});

client.on('message', message => {

    if(message.content === '!run'){
        var commands = [`!join`, `!play https://soundcloud.com/tyto-corvus/sets/pirate`, `!shuffle`, `!fs`]
        commands.forEach( command => {
            message.channel.send(command)
        })
    }
}
)

//Log our bot in using the token from https://discord.com/developers/applications
client.login('Nzc3NDIyMDg1MjQ4Nzc4MjYw.X7DMvA.vF4MqHbWwAOkqEq1D3bU6BpaGzY');