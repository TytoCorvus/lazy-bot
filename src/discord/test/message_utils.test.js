var test = require('ava')
var MESSAGE_UTILS = require('../message_utils')

const utils = new MESSAGE_UTILS()

test('testTrimQuotes', (t) => {
    var apply = (variable) => { return utils.trimQuotes(variable) }

    var single_quote = '\'word\''
    var double_quotes = '\"word\"'

    t.is(apply(single_quote), 'word')
    t.is(apply(double_quotes), 'word')
})

test('testParseOptions', (t) => {
    var apply = (variable) => { return utils.parseOption(variable) }

    var basicOption = '--flag'
    t.deepEqual(apply(basicOption), ['flag', true])

    var basicOptionOneDash = '-flag'
    t.deepEqual(apply(basicOptionOneDash), ['flag', true])

    var basicOptionWithParam = '--flag=name'
    t.deepEqual(apply(basicOptionWithParam), ['flag', 'name'])

    var basicOptionWithQuotedParam = '--flag="Multiple word parameter"'
    t.deepEqual(apply(basicOptionWithQuotedParam), ['flag', "Multiple word parameter"])

    var basicOptionWithParam = '--flag=True'
    t.deepEqual(apply(basicOptionWithParam), ['flag', true])

    var basicOptionWithParam = '--flag="True"'
    t.deepEqual(apply(basicOptionWithParam), ['flag', "True"])

    var basicOptionWithParam = '--flag=false'
    t.deepEqual(apply(basicOptionWithParam), ['flag', false])

    var basicOptionWithParam = '--flag=5'
    t.deepEqual(apply(basicOptionWithParam), ['flag', 5])

    var basicOptionWithParam = '--flag=1.58096'
    t.deepEqual(apply(basicOptionWithParam), ['flag', 1.58096])
})

test('testParseCommand', (t) => {
    var apply = (variable) => { return utils.parseCommandToObject(utils.splitToArgsArray(variable)) }

    var testString = `>monitors twitterhandle "Watching for words" "Something" @TytoCorvus --retweets=false -head="Caught one"`
    var expectedResult = {
        command: '>monitors',
        words: ["twitterhandle", "Watching for words", "Something", "@TytoCorvus"],
        options: {
            retweets: false,
            head: "Caught one"
        }
    }

    t.deepEqual(apply(testString), expectedResult)
})
