// Import the discord.js module
const Discord = require('discord.js');
const { clientToken } = require('./env_variables/discord_vars')
const message_response = require('./src/discord/message_response')

// Create an instance of a Discord client
const client = new Discord.Client();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('*Yawns*\n.\n.\n.\nI\'m up, I\'m up.');
});

client.on('message', message_response)

//Log our bot in using the token from https://discord.com/developers/applications
client.login(clientToken);