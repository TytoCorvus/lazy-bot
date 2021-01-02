
var { parseArgsStringToArgv } = require('string-argv')

class MESSAGE_UTILS {
    OPTION_CHAR = '-'
    MENTION_CHAR = '@'
    QUOTES_REGEX = /^["'].*["']$/
}

MESSAGE_UTILS.prototype.parse = function (argsString){
    return this.parseCommandToObject(this.splitToArgsArray(argsString))
}

    MESSAGE_UTILS.prototype.splitToArgsArray = function (argsString) {
    return parseArgsStringToArgv(argsString)
}

    MESSAGE_UTILS.prototype.parseCommandToObject = function (argsArray) {
    var commandObject = {
    command: argsArray.splice(0, 1)[0],
    words: [],
    options: {
}
}

    argsArray.forEach(token => {
    if (token.includes(this.OPTION_CHAR)) {
    var optionArray = this.parseOption(token)
    commandObject.options[optionArray[0]] = optionArray[1]

} else {
    commandObject.words.push(this.assignTypeToToken(token))
}
})

    return commandObject
}

    MESSAGE_UTILS.prototype.parseOption = function (option) {
    if (option.includes('=')) {
    // It's got a value tagged on to it - we'll parse it
    var split = option.split('=')
    return [split[0].substring(split[0].lastIndexOf(this.OPTION_CHAR) + 1), this.trimQuotes(split[1])]
} else {
    // The default value we will parse for the option name is 'true'
    return [option.substring(option.lastIndexOf(this.OPTION_CHAR) + 1), true]
}
}

    MESSAGE_UTILS.prototype.trimQuotes = function (phrase) {
    if (phrase.match(this.QUOTES_REGEX)) {
    return phrase.substring(1,  phrase.length  - 1);
}
    return this.assignTypeToToken(phrase)
}

    MESSAGE_UTILS.prototype.assignTypeToToken = function(token) {

        var lower_case = token.toLowerCase()
    
    if(lower_case === 'true')
        return true;
    if(lower_case === 'false')
        return false;

    if(isNaN(Number(token))){
        return token
    } else {
        return Number(token)
    }


    }

module.exports = MESSAGE_UTILS