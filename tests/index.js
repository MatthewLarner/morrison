var test = require('tape'),
    morrison = require('../');

test('morrison exists', function(t) {
    t.plan(2);

    t.ok(morrison, 'morrison exists');
    t.equal(typeof morrison, 'function', 'morrison is a function');
});
