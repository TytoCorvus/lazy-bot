var https = require('https')
var fs = require('fs')
var { StringDecoder } = require('string_decoder')
var querystring = require('querystring')
var twitter_vars = require('../../env_variables/twitter_vars')

const TWITTER_BEARER_TOKEN = twitter_vars.bearer_token;
const TWITTER_HOSTNAME = 'api.twitter.com'
const SEARCH_PATH = '/2/tweets/search/recent'

function search_recent_tweets(request, callback, errback) {
    return new Promise((resolve, reject) => {

        var request_options = {
            hostname: TWITTER_HOSTNAME,
            path: SEARCH_PATH + `?query=from:Pokemon`,
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
        console.log("We succeeded!");
        callback(data);
    }).catch((err) => {
        errback(err);
        console.log("We failed. :(");
    })
}

function find_matching_tweets(response_body, phrasesArray, allPresent) {

    var matching_string = "legendary";
    var tweets = JSON.parse(response_body).data.filter(tweet =>
        tweet.text.match(matching_string)
    )

    tweets.forEach(tweet => {


        console.log(tweet.text)
    }
}

function find_recent_matching_tweets(accountId, phrasesArray, allPresent) {

}


module.exports = find_recent_matching_tweets

search_recent_tweets({}, (response_body) => { find_matching_tweets(response_body) }, () => { console.log("We did indeed die somwehere along the way.") });



