const test = require('ava')
const Twitter = require('../Twitter')

var instance = new Twitter()

test('checkTwitterAPI', async t => {
    return instance.find_recent_matching_tweets({twitter_handle:'TytoCorvus', keywords:[]}).then(() => {t.pass()}).catch((err) => {console.log(err); t.fail(err)})
    //return instance.search_recent_tweets('TytoCorvus').then(() => {t.pass()}).catch((err) => {t.fail(err)})
})

test('checkTweetMatchesTest', t => {

    var sample_tweet = {
        "id": "12345",
        "text": "The quick brown fox jumped over the Lazy dog"
    }

    var phrases_array_none = {keywords:["shoe", "eye"]}
    var phrases_array_one = {keywords:["justice", "truth", "dog"]}
    var phrases_array_all = {keywords:["jumped", "quick", "over", "r t"], options:{all:true}}
    var phrases_array_case_sensetive_fail = {keywords:["lazy"], options:{caseSensitive: true}}
    var phrases_array_case_sensetive_pass = {keywords:["lazy"], options:{}}

    t.is(instance.tweet_matches(sample_tweet, phrases_array_none), false)
    t.is(instance.tweet_matches(sample_tweet, phrases_array_one), true)
    t.is(instance.tweet_matches(sample_tweet, phrases_array_all), false)
    t.is(instance.tweet_matches(sample_tweet, phrases_array_case_sensetive_fail), false)
    t.is(instance.tweet_matches(sample_tweet, phrases_array_case_sensetive_pass), true)
})

test('checkTweetMatchesOptionsTest', t => {

    var quoted_tweet = {
                            "id": "1",
                            "referenced_tweets": [
                                {
                                    "type": "quoted",
                                    "id": "1967248"
                                }
                            ],
                            "text": "The quick brown fox jumped over the lazy dog"
                        }

    var retweet =   {
                            "id": "2",
                            "referenced_tweets": [
                                {
                                    "type": "retweeted",
                                    "id": "1967248"
                                }
                            ],
                            "text": "The quick brown fox jumped over the lazy dog"
                        }

    var options_empty = {}
    var options_retweets = {retweets: true}

    //Default behavior is no retweets included
    t.is(instance.matches_options(quoted_tweet, options_empty), true)
    t.is(instance.matches_options(quoted_tweet, options_retweets), true)

    //Retweet should only be included if the option for retweets is specified
    t.is(instance.matches_options(retweet, options_empty), false)
    t.is(instance.matches_options(retweet, options_retweets), true)
})

test('filterToMatchingTweetsTest', t => {

    var response_body = {
        data: [
            {
                "id": "1",
                "text": "The quick brown fox jumped over the lazy dog"
            },
            {
                "id": "2",
                "text": "What is up dog"
            },
            {
                "id": "3",
                "text": "You say I lie, but I know it to be the truth. This conversation is over."
            },
            {
                "id": "4",
                "referenced_tweets": [
                    {
                        "type": "retweeted",
                        "id": "1967248"
                    }
                ],
                "text": "The quick brown fox jumped over the lazy dog"
            }
        ]
    }

    var phrases_array_match_simple = {keywords:["jumped", "quick", "over"]}
    var phrases_array_match_all = {keywords:["justice", "truth", "dog"], options:{all: true}}
    var phrases_array_match_any = {keywords:["justice", "truth", "dog"]}
    var phrases_array_match_with_options = {keywords:["jumped", "quick", "over"], options:{retweets: true, all: true}}

    //Require only one word in the phrase array to match - entry 1 and 3 both match, 4 is a retweet and filtered out
    t.is(instance.filter_to_matching_tweets(response_body, phrases_array_match_simple).length, 2)

    //Require all words to match the array, and none of the entries include 'justice', 'truth', and 'dog'. Return zero.
    t.is(instance.filter_to_matching_tweets(response_body, phrases_array_match_all).length, 0)

    //Require only one word in the phrase array to match - every entry has a word included in the list. Return all three. 
    t.is(instance.filter_to_matching_tweets(response_body, phrases_array_match_any).length, 3)

    //Should be 1 and 4, including the one that retweeted something
    t.is(instance.filter_to_matching_tweets(response_body, phrases_array_match_with_options).length, 2)
})

