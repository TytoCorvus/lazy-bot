var https = require('https')
var fs = require('fs')
var { StringDecoder } = require('string_decoder')
var querystring = require('querystring')
var twitter_vars = require('../../env_variables/twitter_vars')

const TWITTER_BEARER_TOKEN = twitter_vars.bearer_token;
const TWITTER_HOSTNAME = 'api.twitter.com'
const SEARCH_PATH = '/2/tweets/search/recent'

function search_recent_tweets() {
    return new Promise((resolve, reject) => {

        var request_options = {
            hostname: TWITTER_HOSTNAME,
            path: SEARCH_PATH + `?query=from:realDonaldTrump`,
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

    }).then((data) => { console.log("We succeeded!"); console.log(data); }).catch((err) => { console.log("We failed. :("); console.log(err) })
}


search_recent_tweets();



