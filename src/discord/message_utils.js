
class MESSAGE_UTILS{
    OPTION_CHAR = '.'
    OPTION_REGEX = /\.([^=\s$]+)/
    VALUE_REGEX = /=([^\s]+)/
}

MESSAGE_UTILS.prototype.parse_command_from_parts = function (message_text) {
    var results = {
        command: '',
        options: {},
        text: [],
        users: []
    }

    results.command = message_text.match(/^>[a-zA-Z_]+\s?/)[0]
    if(!results.command)
        return false

    message_text.match(`(${this.OPTION_CHAR}.+`).forEach( option => {
        var option_name = parse_option_from_word(option)
        var option_value = this.parse_value_from_word(option)
        results.options[option_name] = option_value
    })

    return results
}

MESSAGE_UTILS.prototype.parse_option_from_word = function (option_text) {
    var regex_result = option_text.match(this.OPTION_REGEX)
    return regex_result == null ? false : regex_result[1]
}

MESSAGE_UTILS.prototype.parse_value_from_word = function (option_text) {
    var regex_result = option_text.match(this.VALUE_REGEX)

    if(regex_result == null){
        return false
    }

    var value = regex_result[1]
    var lower_case = value.toLowerCase()
    
    if(lower_case === 'true')
        return true;
    if(lower_case === 'false')
        return false;

    if(isNaN(Number(value))){
        return value
    } else {
        return Number(value)
    }
}

module.exports = MESSAGE_UTILS