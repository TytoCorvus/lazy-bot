const test = require('ava')
const Twitter = require('../Twitter')

var instance = new Twitter(true)

test('checkTwitterApiResponds', t => {
    instance.search_recent_tweets('canYouPetTheDog', () => {t.pass()}, (err) => {t.fail(err)})
})