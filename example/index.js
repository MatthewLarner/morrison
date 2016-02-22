var crel = require('crel'),
    morrison = require('../'),
    validators = {
        '[data-validate=email]': /^[^@]*$|^[^@]+@[^@]*$/,
        '[data-validate=number]': /^\d*$|^\d*\.$|^\d*\.\d+$/,
        '[data-validate=integer]': /^\d*$/
    };

var integers = crel('div', {
        class: 'example'
    },
    crel('input', {
        'data-validate': 'integer'
    }),
    crel('label', 'Integers only')
);

var numbers = crel('div', {
        class: 'example'
    },
    crel('input', {
        'data-validate': 'number'
    }),
    crel('label', 'Numbers only')
);

window.onload = function() {

    crel(document.body,
        integers,
        numbers
    );

    morrison({
        validators: validators
    });
};
