var crel = require('crel'),
    doc = require('doc-js'),
    morrison = require('../'),
    validators = {
        '[data-validate=number]': /^\d*$|^\d*\.$|^\d*\.\d+$/,
        '[data-validate=integer]': /^\d*$/,
        '[data-validate=foo]': /^f$|^fo$|^foo$/,
        '[data-validate=english]': /^[\x00-\x7F]+$/
    };

var instructions = crel('div', {
        class: 'instructions'
    },
    crel('h3', 'Paste the following text into each of the inputs'),
    crel('label', '123.123.f1o0...o عربي Es gefällt mir')
);

var integers = crel('div', {
        class: 'example'
    },
    crel('input', {
        'data-validate': 'integer'
    }),
    crel('label', 'Only allow integer characters')
);

var numbers = crel('div', {
        class: 'example'
    },
    crel('input', {
        'data-validate': 'number'
    }),
    crel('label', 'Only allow number characters')
);

var foo = crel('div', {
        class: 'example'
    },
    crel('input', {
        'data-validate': 'foo'
    }),
    crel('label', 'Only allow the string "foo"')
);

var english = crel('div', {
        class: 'example'
    },
    crel('input', {
        'data-validate': 'english'
    }),
    crel('label', 'Only allow english characters')
);

doc.ready(function() {

    crel(document.body,
        instructions,
        integers,
        numbers,
        foo,
        english
    );

    morrison({
        validators: validators
    });
});
