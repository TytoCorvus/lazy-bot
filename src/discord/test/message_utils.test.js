var test = require('ava')
var MESSAGE_UTILS = require('../message_utils')

const utils = new MESSAGE_UTILS()

test('testParseOption', (t) => {
    var apply = (variable) => {return utils.parse_option_from_word(variable)}
    var option_string_simple = '.option'
    t.is(apply(option_string_simple), 'option')

    var option_string_incorrect = 'noOptionCharacter'
    t.is(utils.parse_option_from_word(option_string_incorrect), false)

    var option_string_with_value = '.option=true'
    t.is(utils.parse_option_from_word(option_string_with_value), 'option')
})

test('testParseValue', (t) => {
    var no_value = '.option'
    t.is(utils.parse_value_from_word(no_value), false)

    var true_value = '.option=true'
    t.is(utils.parse_value_from_word(true_value), true)

    var false_value_with_caps = '.option=FalSE'
    t.is(utils.parse_value_from_word(false_value_with_caps), false)

    var value_with_spaces = '.option=Magikarp is evolving!'
    t.is(utils.parse_value_from_word(value_with_spaces), 'Magikarp')
    
    var value_with_some_numbers = '.option=123abc123'
    t.is(utils.parse_value_from_word(value_with_some_numbers), '123abc123')

    var value_as_int = '.option=100'
    t.is(utils.parse_value_from_word(value_as_int), 100)

    var value_as_float = '.option=49.99'
    t.is(utils.parse_value_from_word(value_as_float), 49.99)
})

test('testParseCommand', (t) => {
    
})