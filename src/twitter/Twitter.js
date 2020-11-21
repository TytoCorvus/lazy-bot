var https = require('https')
var { StringDecoder } = require('string_decoder')
var querystring = require('querystring')
var twitter_vars = require('../../env_variables/twitter_vars')

const TWITTER_BEARER_TOKEN = twitter_vars.bearer_token
const TWITTER_HOSTNAME = 'api.twitter.com'
const SEARCH_PATH = '/2/tweets/search/recent'


class Twitter { 
    STATUS_URI_BASE = `twitter.com/i/web/status/`
};

Twitter.prototype.find_recent_matching_tweets = function (match_options) {
    var {twitter_handle, phrases_array, all_present} = match_options
    return new Promise((resolve, reject) => {
        Twitter.prototype.search_recent_tweets(twitter_handle, (data) => {
            resolve(this.filter_to_matching_tweets(JSON.parse(data), phrases_array, all_present).map(tweet => tweet.id))
        }, (err) => {
            reject(err)
        })
    })
}

Twitter.prototype.search_recent_tweets = function (twitter_handle, callback, errback) {
    new Promise((resolve, reject) => {

    var request_options = 
    {
        hostname: TWITTER_HOSTNAME,
        path: SEARCH_PATH + `?query=from:${twitter_handle }`,
        method: `GET`,
        headers: {
            Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`
        }
    }

    var request = https.request(request_options, (res) => {
        var decoder = new StringDecoder('utf8')
        var buffer = ''

        res.on('error', (err) => {
            reject(err)
        })
        res.on('data', (data) => {
            buffer += decoder.write(data)
        })
        res.on('end', () => {
            buffer += decoder.end()
            resolve(buffer)
        })
    })

    request.end()
    }).then((data) => {
        callback(data);
    }).catch((err) => {
        errback(err);
    })
}

Twitter.prototype.filter_to_matching_tweets = function (response_body, phrases_array, all_present) {
    return response_body.data.filter(tweet => this.tweet_matches(tweet, phrases_array, all_present))
}

Twitter.prototype.tweet_matches = function (tweet, phrases_array, all_present, case_sensetive = false) {
    var matches_required = all_present ? phrases_array.length : 1
    return matches_required <= phrases_array.filter(phrase => {
        var regex = case_sensetive ? phrase : new RegExp(phrase, 'i')
        return tweet.text.match(regex)}
        ).length
}

Twitter.prototype.build_status_link = function(tweet_id){
    return 'https://' + this.STATUS_URI_BASE + tweet_id
}

//Example usage for find_recent_matching_tweets
//var twitter = new Twitter()
// twitter.find_recent_matching_tweets({twitter_handle:'pokemon', phrases_array:['legendary', 'dragon'], all_present:false})
//     .then((arr) => {console.log(arr[0])})
//     .catch((err) => {console.log(`It didn't work :( \n ${err}`)})

module.exports = Twitter