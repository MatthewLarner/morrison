var crel = require('crel'),
    merge = require('merge'),
    morrison = require('../'),
    defaultValidators = morrison.defaultValidators(),
    validators = merge(defaultValidators, {
        '[data-validate=integer]': /^\d*$/
    });

window.onload = function() {
    var example1 = crel('div', {
            class: 'example'
        },
        crel('input', {
            'data-validate': 'integer'
        }),
        crel('label', 'Integers only')
    );

    document.body.appendChild(example1);

    morrison({
        validators: validators
    });
};
