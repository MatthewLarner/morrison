var doc = require('doc-js'),
    inputPatternRestrictor = require('input-pattern-restrictor');

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
            regex = validators[validatorKey];

        if(!regex) {
            return;
        }

        inputPatternRestrictor(event, regex);
    }

    doc(parentElement).on('paste keypress', selectors, validateInput);
};
