var mongo = require('./mongo/mongo_dao')
var Twitter = require('./twitter/Twitter')
var { update_period_ms } = require('../env_variables/twitter_vars')

var twitter = new Twitter();

function start_intervals(discord_client) {
    generate_twitter_links(discord_client)

    var monitor_interval = setInterval(() => {
        generate_twitter_links(discord_client)
    }, update_period_ms)
}

function generate_twitter_links(discord_client) {
    mongo.get_all_monitors((monitor_list) => {

        monitor_list.forEach((monitor) => {
            twitter.find_recent_matching_tweets(monitor)
                .then((tweets) => {
                    tweets.forEach((tweet_id) => {
                        mongo.get_reported_tweets(monitor.twitter_handle, monitor.guild_id)
                            .then((tweets_reported) => {
                                if (tweets_reported != undefined && tweets_reported != null && !tweets_reported.includes(tweet_id)) {
                                    var twitter_link = twitter.build_status_link(tweet_id)

                                    mongo.get_guild_settings(monitor.guild_id)
                                        .then((settings) => {
                                            discord_client.channels.fetch(settings.channel_id).then((discord_channel) => {
                                                discord_channel.send(`${reference_users(monitor.users_listening)}\n${twitter_link}`)
                                                report_tweet(monitor.twitter_handle, tweet_id, monitor.guild_id).catch((err) => { reject(err) })
                                            }).catch(err => {
                                                console.log(`Error fetching the discord channel: ${err}`)
                                            })
                                        }).catch(err => { console.log(`Error getting the guild settings: ${err}`) })
                                }
                            })
                            .catch((err) => { console.log(`Error getting reported tweets from ${monitor.twitter_handle}: ${err} `) })
                    })
                })
                .catch((err) => { console.log(`There was an error finding recent tweets: ${err}`) })
        })
    })
}

function report_tweet(author, tweet_id, guild_id) {
    return new Promise((resolve, reject) => {
        mongo.insert_reported_tweet({ twitter_handle: author, 'tweet_id': tweet_id }, guild_id)
            .then((result) => { })
            .catch((err) => console.log(`Had an issue inserting reported tweet ${tweet_id} from ${author}`))
    })
}

function reference_users(user_ids) {
    return user_ids.map(user_id => `<@${user_id}>`).join(' ')
}

module.exports = start_intervals;