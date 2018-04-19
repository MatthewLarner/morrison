var crel = require('crel'),
    doc = require('doc-js'),
    morrison = require('../'),
    validators = {
        '[data-validate=number]': /^\d*$|^\d*\.$|^\d*\.\d+$/,
        '[data-validate=integer]': /^\d*$/,
        '[data-validate=foo]': /^f$|^fo$|^foo$/,
        '[data-validate=abn]': /^\d{0,2}\s?\d{0,3}\s?\d{0,3}\s?\d{0,3}$/
    };

var instructions = crel('div', {
        class: 'instructions'
    },
    crel('h3', 'Paste the following text into each of the inputs'),
    crel('label', '123.123.f1o0...o')
);

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

var foo = crel('div', {
        class: 'example'
    },
    crel('input', {
        'data-validate': 'foo'
    }),
    crel('label', 'foo only')
);

var abn = crel('div', {
        class: 'example'
    },
    crel('input', {
        'data-validate': 'abn'
    }),
    crel('label', 'abn only')
);


doc.ready(function() {

    crel(document.body,
        instructions,
        integers,
        numbers,
        foo,
        abn
    );

    morrison({
        validators: validators
    });
});
