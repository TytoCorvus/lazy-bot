var https = require('https')
var { StringDecoder } = require('string_decoder')
var twitter_vars = require('../../env_variables/twitter_vars')

const TWITTER_BEARER_TOKEN = twitter_vars.bearer_token
//const TWITTER_HOSTNAME = 'api.twitter.com'

class Twitter { 
    constructor(isDevEnv = false){
        if(isDevEnv){
            this.TARGET_HOST = 'api.twitter.com'
        } else {
            this.TARGET_HOST = 'api.twitter.com'
        }
    }

    SEARCH_PATH = '/2/tweets/search/recent'
    STATUS_PATH = `/i/web/status/`
};

Twitter.prototype.find_recent_matching_tweets = function (match_options) {
    var {twitter_handle, keywords, all_present} = match_options
    return new Promise((resolve, reject) => {
        Twitter.prototype.search_recent_tweets(twitter_handle, (data) => {
            resolve(this.filter_to_matching_tweets(JSON.parse(data), keywords, all_present).map(tweet => tweet.id))
        }, (err) => {
            reject(err)
        })
    })
}

Twitter.prototype.search_recent_tweets = function (twitter_handle, callback, errback) {
    new Promise((resolve, reject) => {

    var request_options = 
    {
        hostname: this.TARGET_HOST,
        path: this.SEARCH_PATH + `?query=from:${twitter_handle }&tweet.fields=referenced_tweets`,
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
    if(response_body.data == undefined || response_body.data == null){
        return []
    }
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
    return 'https://' + this.TARGET_HOST + this.STATUS_PATH + tweet_id
}

module.exports = Twitter

