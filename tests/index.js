var test = require('tape'),
    bar = require('../');

test('morrison exists', function(t) {
    t.plan(2);

    var testBar = bar;
    t.ok(testBar, 'morrison exists');
    t.equal(typeof testBar, 'function', 'morrison is a function');
});
