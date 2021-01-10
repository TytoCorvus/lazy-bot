var https = require('https')
var { StringDecoder } = require('string_decoder')
var twitter_vars = require('../../env_variables/twitter_vars')

const TWITTER_BEARER_TOKEN = twitter_vars.bearer_token

class Twitter { 

    TARGET_HOST = 'api.twitter.com'
    SEARCH_PATH = '/2/tweets/search/recent'
    STATUS_PATH = `/i/web/status/`
    FILTER_OPTION_DEFAULTS = {
        retweets: false,
        all: false,
        caseSensitive: false 
    }
};

Twitter.prototype.find_recent_matching_tweets = function (match_options) {
    var {twitter_handle} = match_options
    return new Promise((resolve, reject) => {
        this.search_recent_tweets(twitter_handle)
            .then(
                (data) => {resolve(this.filter_to_matching_tweets(JSON.parse(data), match_options).map(tweet => tweet.id))
            })
            .catch((err) => {
                reject(err)
            })
    })
}

Twitter.prototype.search_recent_tweets = function (twitter_handle) {
    return new Promise((resolve, reject) => {
        var request_options = 
        {
            hostname: this.TARGET_HOST,
            path: this.SEARCH_PATH + `?query=from:${twitter_handle}&tweet.fields=referenced_tweets`,
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
    })
}

Twitter.prototype.filter_to_matching_tweets = function (response_body, match_options) {
    if(response_body.data == undefined || response_body.data == null){
        return []
    }

    return response_body.data.filter(tweet => this.matches_options(tweet, match_options.options ? match_options.options : {})).filter(tweet => this.tweet_matches(tweet, match_options))
}

Twitter.prototype.tweet_matches = function (tweet, match_options) {
    var {keywords, options} = match_options
    var matches_required = options && options.all ? keywords.length : 1
    return matches_required <= keywords.filter(phrase => {
        var separators = `[.,!?'"\\s]`
       
        var regex_left = `^${phrase}${separators}`
        var regex_middle = `${separators}${phrase}${separators}`
        var regex_right = `${separators}${phrase}\$`

        var sensetize = (regex_base) => {return (options && options.caseSensitive ? new RegExp(regex_base) : new RegExp(regex_base, 'i'))}
        var regex_arr = [regex_left, regex_middle, regex_right].map(sensetize)

        return regex_arr.filter(regex => tweet.text.match(regex)).length > 0   //tweet.text.match(regex)
        }).length
}

Twitter.prototype.matches_options = function(tweet, supplied_options) {
    if(!supplied_options.retweets && tweet.referenced_tweets){
        var retweet_arr = tweet.referenced_tweets.filter(rt => rt.type == 'retweeted')
        if(retweet_arr.length > 0){
            return false
        }
    }
    return true
}

Twitter.prototype.build_status_link = function(tweet_id){
    return 'https://twitter.com' + this.STATUS_PATH + tweet_id
}

module.exports = Twitter

