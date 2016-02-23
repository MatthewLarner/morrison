var doc = require('doc-js'),
    setify = require('setify'),
    naturalSelection = require('natural-selection');

function constructInsertString(element, insertValue){
    var result = '',
        value = element.value;

    if(naturalSelection(element)) {
        var start = element.selectionStart,
            end = element.selectionEnd;

        result = value.slice(0, start) + insertValue + value.slice(end);
    } else {
        result = value + insertValue;
    }

    return result;
}

function validateInput(testString, regex) {
    var newRegex = new RegExp(regex);

    return !!testString.match(newRegex);
}

function validateKey(event, regex) {
    var newChar = String.fromCharCode(event.which),
        testString = constructInsertString(event.target, newChar);

    if(!validateInput(testString, regex)){
        event.preventDefault();
    }
}

function validatePaste(event, regex){
    event.preventDefault();

    var element = event.target,
        pastedData = event.clipboardData.getData('Text');

    pastedData = constructInsertString(element, pastedData);
    pastedData = pastedData.split('')
        .reduce(function(result, charater) {
            if(validateInput(result + charater, regex)){
                return result + charater;
            }

            return result;
        }, '');

    setify(element, pastedData);
}

var eventValidators = {
    'paste': validatePaste,
    'keypress': validateKey
};

module.exports = function(settings) {
    if(!settings || !(settings && settings.validators)) {
        throw('Settings object with validators required');
    }

    var parentElement = settings.parentElement || document,
        validators = settings.validators,
        selectors = Object.keys(validators).join(', ');

    function validateInput(event) {

        function getValidatorKey(validatorKey) {
            if(doc.is(event.target, validatorKey)) {
                return validatorKey;
            }
        }

        var validatorKey = Object.keys(validators).find(getValidatorKey),
            validator = eventValidators[event.type],
            regex = validators[validatorKey];

        if(!validator || !regex) {
            return;
        }

        validator(event, regex);
    }

    doc(parentElement).on('paste keypress', selectors, validateInput);
};
