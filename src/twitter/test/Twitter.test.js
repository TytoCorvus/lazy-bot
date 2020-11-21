const test = require('ava')
const Twitter = require('../Twitter')

var instance = new Twitter()

test('checkTweetMatchesTest', t => {

    var sample_tweet = {
        "id": 12345,
        "text": "The quick brown fox jumped over the Lazy dog"
    }

    var phrases_array_none = ["shoe", "eye"]
    var phrases_array_one = ["justice", "truth", "dog"]
    var phrases_array_all = ["jump", "quick", "over", "r t"]
    var phrases_array_case_sensetive = ["lazy"]

    t.is(instance.tweet_matches(sample_tweet, phrases_array_none, false), false)
    t.is(instance.tweet_matches(sample_tweet, phrases_array_none, true), false)

    t.is(instance.tweet_matches(sample_tweet, phrases_array_one, false), true)
    t.is(instance.tweet_matches(sample_tweet, phrases_array_one, true), false)

    t.is(instance.tweet_matches(sample_tweet, phrases_array_all, false), true)
    t.is(instance.tweet_matches(sample_tweet, phrases_array_all, true), true)

    t.is(instance.tweet_matches(sample_tweet, phrases_array_case_sensetive, true), true)
    t.is(instance.tweet_matches(sample_tweet, phrases_array_case_sensetive, true, true), false)
})

test('filterToMatchingTweetsTest', t => {

    var response_body = {
        data: [
            {
                "id": 1,
                "text": "The quick brown fox jumped over the lazy dog"
            },
            {
                "id": 2,
                "text": "What is up dog"
            },
            {
                "id": 3,
                "text": "You say I lie, but I know it to be the truth. This conversation is over."
            }
        ]
    }

    var phrases_array_match_one = ["jump", "quick", "over"]
    var phrases_array_match_all = ["justice", "truth", "dog"]

    //Require all words in the phrase array to match - only one should be returned.
    t.is(instance.filter_to_matching_tweets(response_body, phrases_array_match_one, true).length, 1)

    //Require only one word in the phrase array to match - entry 1 and 3 both match
    t.is(instance.filter_to_matching_tweets(response_body, phrases_array_match_one, false).length, 2)

    //Require all words to match the array, and none of the entries include 'justice', 'truth', and 'dog'. Return zero.
    t.is(instance.filter_to_matching_tweets(response_body, phrases_array_match_all, true).length, 0)

    //Require only one word in the phrase array to match - every entry has a word included in the list. Return all three. 
    t.is(instance.filter_to_matching_tweets(response_body, phrases_array_match_all, false).length, 3)
})