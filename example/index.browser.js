(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var crel = require('crel'),
    doc = require('doc-js'),
    morrison = require('../'),
    validators = {
        '[data-validate=number]': /^\d*$|^\d*\.$|^\d*\.\d+$/,
        '[data-validate=integer]': /^\d*$/,
        '[data-validate=foo]': /^f$|^fo$|^foo$/
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

doc.ready(function() {

    crel(document.body,
        instructions,
        integers,
        numbers,
        foo
    );

    morrison({
        validators: validators
    });
});

},{"../":2,"crel":3,"doc-js":5}],2:[function(require,module,exports){
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
    if(!settings || !settings.validators) {
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

},{"doc-js":5,"natural-selection":9,"setify":10}],3:[function(require,module,exports){
//Copyright (C) 2012 Kory Nunn

//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*

    This code is not formatted for readability, but rather run-speed and to assist compilers.

    However, the code's intention should be transparent.

    *** IE SUPPORT ***

    If you require this library to work in IE7, add the following after declaring crel.

    var testDiv = document.createElement('div'),
        testLabel = document.createElement('label');

    testDiv.setAttribute('class', 'a');
    testDiv['className'] !== 'a' ? crel.attrMap['class'] = 'className':undefined;
    testDiv.setAttribute('name','a');
    testDiv['name'] !== 'a' ? crel.attrMap['name'] = function(element, value){
        element.id = value;
    }:undefined;


    testLabel.setAttribute('for', 'a');
    testLabel['htmlFor'] !== 'a' ? crel.attrMap['for'] = 'htmlFor':undefined;



*/

(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.crel = factory();
    }
}(this, function () {
    var fn = 'function',
        obj = 'object',
        nodeType = 'nodeType',
        textContent = 'textContent',
        setAttribute = 'setAttribute',
        attrMapString = 'attrMap',
        isNodeString = 'isNode',
        isElementString = 'isElement',
        d = typeof document === obj ? document : {},
        isType = function(a, type){
            return typeof a === type;
        },
        isNode = typeof Node === fn ? function (object) {
            return object instanceof Node;
        } :
        // in IE <= 8 Node is an object, obviously..
        function(object){
            return object &&
                isType(object, obj) &&
                (nodeType in object) &&
                isType(object.ownerDocument,obj);
        },
        isElement = function (object) {
            return crel[isNodeString](object) && object[nodeType] === 1;
        },
        isArray = function(a){
            return a instanceof Array;
        },
        appendChild = function(element, child) {
          if(!crel[isNodeString](child)){
              child = d.createTextNode(child);
          }
          element.appendChild(child);
        };


    function crel(){
        var args = arguments, //Note: assigned to a variable to assist compilers. Saves about 40 bytes in closure compiler. Has negligable effect on performance.
            element = args[0],
            child,
            settings = args[1],
            childIndex = 2,
            argumentsLength = args.length,
            attributeMap = crel[attrMapString];

        element = crel[isElementString](element) ? element : d.createElement(element);
        // shortcut
        if(argumentsLength === 1){
            return element;
        }

        if(!isType(settings,obj) || crel[isNodeString](settings) || isArray(settings)) {
            --childIndex;
            settings = null;
        }

        // shortcut if there is only one child that is a string
        if((argumentsLength - childIndex) === 1 && isType(args[childIndex], 'string') && element[textContent] !== undefined){
            element[textContent] = args[childIndex];
        }else{
            for(; childIndex < argumentsLength; ++childIndex){
                child = args[childIndex];

                if(child == null){
                    continue;
                }

                if (isArray(child)) {
                  for (var i=0; i < child.length; ++i) {
                    appendChild(element, child[i]);
                  }
                } else {
                  appendChild(element, child);
                }
            }
        }

        for(var key in settings){
            if(!attributeMap[key]){
                element[setAttribute](key, settings[key]);
            }else{
                var attr = attributeMap[key];
                if(typeof attr === fn){
                    attr(element, settings[key]);
                }else{
                    element[setAttribute](attr, settings[key]);
                }
            }
        }

        return element;
    }

    // Used for mapping one kind of attribute to the supported version of that in bad browsers.
    crel[attrMapString] = {};

    crel[isElementString] = isElement;

    crel[isNodeString] = isNode;

    return crel;
}));

},{}],4:[function(require,module,exports){
var doc = {
    document: typeof document !== 'undefined' ? document : null,
    setDocument: function(d){
        this.document = d;
    }
};

var arrayProto = [],
    isList = require('./isList'),
    getTargets = require('./getTargets')(doc.document),
    getTarget = require('./getTarget')(doc.document),
    space = ' ';


///[README.md]

function isIn(array, item){
    for(var i = 0; i < array.length; i++) {
        if(item === array[i]){
            return true;
        }
    }
}

/**

    ## .find

    finds elements that match the query within the scope of target

        //fluent
        doc(target).find(query);

        //legacy
        doc.find(target, query);
*/

function find(target, query){
    target = getTargets(target);
    if(query == null){
        return target;
    }

    if(isList(target)){
        var results = [];
        for (var i = 0; i < target.length; i++) {
            var subResults = doc.find(target[i], query);
            for(var j = 0; j < subResults.length; j++) {
                if(!isIn(results, subResults[j])){
                    results.push(subResults[j]);
                }
            }
        }
        return results;
    }

    return target ? target.querySelectorAll(query) : [];
}

/**

    ## .findOne

    finds the first element that matches the query within the scope of target

        //fluent
        doc(target).findOne(query);

        //legacy
        doc.findOne(target, query);
*/

function findOne(target, query){
    target = getTarget(target);
    if(query == null){
        return target;
    }

    if(isList(target)){
        var result;
        for (var i = 0; i < target.length; i++) {
            result = findOne(target[i], query);
            if(result){
                break;
            }
        }
        return result;
    }

    return target ? target.querySelector(query) : null;
}

/**

    ## .closest

    recurses up the DOM from the target node, checking if the current element matches the query

        //fluent
        doc(target).closest(query);

        //legacy
        doc.closest(target, query);
*/

function closest(target, query){
    target = getTarget(target);

    if(isList(target)){
        target = target[0];
    }

    while(
        target &&
        target.ownerDocument &&
        !is(target, query)
    ){
        target = target.parentNode;
    }

    return target === doc.document && target !== query ? null : target;
}

/**

    ## .is

    returns true if the target element matches the query

        //fluent
        doc(target).is(query);

        //legacy
        doc.is(target, query);
*/

function is(target, query){
    target = getTarget(target);

    if(isList(target)){
        target = target[0];
    }

    if(!target.ownerDocument || typeof query !== 'string'){
        return target === query;
    }

    if(target === query){
        return true;
    }

    var parentless = !target.parentNode;

    if(parentless){
        // Give the element a parent so that .querySelectorAll can be used
        document.createDocumentFragment().appendChild(target);
    }

    var result = arrayProto.indexOf.call(find(target.parentNode, query), target) >= 0;

    if(parentless){
        target.parentNode.removeChild(target);
    }

    return result;
}

/**

    ## .addClass

    adds classes to the target (space separated string or array)

        //fluent
        doc(target).addClass(query);

        //legacy
        doc.addClass(target, query);
*/

function addClass(target, classes){
    target = getTargets(target);

    if(isList(target)){
        for (var i = 0; i < target.length; i++) {
            addClass(target[i], classes);
        }
        return this;
    }
    if(!classes){
        return this;
    }

    var classes = Array.isArray(classes) ? classes : classes.split(space),
        currentClasses = target.classList ? null : target.className.split(space);

    for(var i = 0; i < classes.length; i++){
        var classToAdd = classes[i];
        if(!classToAdd || classToAdd === space){
            continue;
        }
        if(target.classList){
            target.classList.add(classToAdd);
        } else if(!currentClasses.indexOf(classToAdd)>=0){
            currentClasses.push(classToAdd);
        }
    }
    if(!target.classList){
        target.className = currentClasses.join(space);
    }
    return this;
}

/**

    ## .removeClass

    removes classes from the target (space separated string or array)

        //fluent
        doc(target).removeClass(query);

        //legacy
        doc.removeClass(target, query);
*/

function removeClass(target, classes){
    target = getTargets(target);

    if(isList(target)){
        for (var i = 0; i < target.length; i++) {
            removeClass(target[i], classes);
        }
        return this;
    }

    if(!classes){
        return this;
    }

    var classes = Array.isArray(classes) ? classes : classes.split(space),
        currentClasses = target.classList ? null : target.className.split(space);

    for(var i = 0; i < classes.length; i++){
        var classToRemove = classes[i];
        if(!classToRemove || classToRemove === space){
            continue;
        }
        if(target.classList){
            target.classList.remove(classToRemove);
            continue;
        }
        var removeIndex = currentClasses.indexOf(classToRemove);
        if(removeIndex >= 0){
            currentClasses.splice(removeIndex, 1);
        }
    }
    if(!target.classList){
        target.className = currentClasses.join(space);
    }
    return this;
}

function addEvent(settings){
    var target = getTarget(settings.target);
    if(target){
        target.addEventListener(settings.event, settings.callback, false);
    }else{
        console.warn('No elements matched the selector, so no events were bound.');
    }
}

/**

    ## .on

    binds a callback to a target when a DOM event is raised.

        //fluent
        doc(target/proxy).on(events, target[optional], callback);

    note: if a target is passed to the .on function, doc's target will be used as the proxy.

        //legacy
        doc.on(events, target, query, proxy[optional]);
*/

function on(events, target, callback, proxy){

    proxy = getTargets(proxy);

    if(!proxy){
        target = getTargets(target);
        // handles multiple targets
        if(isList(target)){
            var multiRemoveCallbacks = [];
            for (var i = 0; i < target.length; i++) {
                multiRemoveCallbacks.push(on(events, target[i], callback, proxy));
            }
            return function(){
                while(multiRemoveCallbacks.length){
                    multiRemoveCallbacks.pop();
                }
            };
        }
    }

    // handles multiple proxies
    // Already handles multiple proxies and targets,
    // because the target loop calls this loop.
    if(isList(proxy)){
        var multiRemoveCallbacks = [];
        for (var i = 0; i < proxy.length; i++) {
            multiRemoveCallbacks.push(on(events, target, callback, proxy[i]));
        }
        return function(){
            while(multiRemoveCallbacks.length){
                multiRemoveCallbacks.pop();
            }
        };
    }

    var removeCallbacks = [];

    if(typeof events === 'string'){
        events = events.split(space);
    }

    for(var i = 0; i < events.length; i++){
        var eventSettings = {};
        if(proxy){
            if(proxy === true){
                proxy = doc.document;
            }
            eventSettings.target = proxy;
            eventSettings.callback = function(event){
                var closestTarget = closest(event.target, target);
                if(closestTarget){
                    callback(event, closestTarget);
                }
            };
        }else{
            eventSettings.target = target;
            eventSettings.callback = callback;
        }

        eventSettings.event = events[i];

        addEvent(eventSettings);

        removeCallbacks.push(eventSettings);
    }

    return function(){
        while(removeCallbacks.length){
            var removeCallback = removeCallbacks.pop();
            getTarget(removeCallback.target).removeEventListener(removeCallback.event, removeCallback.callback);
        }
    }
}

/**

    ## .off

    removes events assigned to a target.

        //fluent
        doc(target/proxy).off(events, target[optional], callback);

    note: if a target is passed to the .on function, doc's target will be used as the proxy.

        //legacy
        doc.off(events, target, callback, proxy);
*/

function off(events, target, callback, proxy){
    if(isList(target)){
        for (var i = 0; i < target.length; i++) {
            off(events, target[i], callback, proxy);
        }
        return this;
    }
    if(proxy instanceof Array){
        for (var i = 0; i < proxy.length; i++) {
            off(events, target, callback, proxy[i]);
        }
        return this;
    }

    if(typeof events === 'string'){
        events = events.split(space);
    }

    if(typeof callback !== 'function'){
        proxy = callback;
        callback = null;
    }

    proxy = proxy ? getTarget(proxy) : doc.document;

    var targets = typeof target === 'string' ? find(target, proxy) : [target];

    for(var targetIndex = 0; targetIndex < targets.length; targetIndex++){
        var currentTarget = targets[targetIndex];

        for(var i = 0; i < events.length; i++){
            currentTarget.removeEventListener(events[i], callback);
        }
    }
    return this;
}

/**

    ## .append

    adds elements to a target

        //fluent
        doc(target).append(children);

        //legacy
        doc.append(target, children);
*/

function append(target, children){
    var target = getTarget(target),
        children = getTarget(children);

    if(isList(target)){
        target = target[0];
    }

    if(isList(children)){
        for (var i = 0; i < children.length; i++) {
            append(target, children[i]);
        }
        return;
    }

    target.appendChild(children);
}

/**

    ## .prepend

    adds elements to the front of a target

        //fluent
        doc(target).prepend(children);

        //legacy
        doc.prepend(target, children);
*/

function prepend(target, children){
    var target = getTarget(target),
        children = getTarget(children);

    if(isList(target)){
        target = target[0];
    }

    if(isList(children)){
        //reversed because otherwise the would get put in in the wrong order.
        for (var i = children.length -1; i; i--) {
            prepend(target, children[i]);
        }
        return;
    }

    target.insertBefore(children, target.firstChild);
}

/**

    ## .isVisible

    checks if an element or any of its parents display properties are set to 'none'

        //fluent
        doc(target).isVisible();

        //legacy
        doc.isVisible(target);
*/

function isVisible(target){
    var target = getTarget(target);
    if(!target){
        return;
    }
    if(isList(target)){
        var i = -1;

        while (target[i++] && isVisible(target[i])) {}
        return target.length >= i;
    }
    while(target.parentNode && target.style.display !== 'none'){
        target = target.parentNode;
    }

    return target === doc.document;
}

/**

    ## .indexOfElement

    returns the index of the element within it's parent element.

        //fluent
        doc(target).indexOfElement();

        //legacy
        doc.indexOfElement(target);

*/

function indexOfElement(target) {
    target = getTargets(target);
    if(!target){
        return;
    }

    if(isList(target)){
        target = target[0];
    }

    var i = -1;

    var parent = target.parentElement;

    if(!parent){
        return i;
    }

    while(parent.children[++i] !== target){}

    return i;
}


/**

    ## .ready

    call a callback when the document is ready.

    returns -1 if there is no parentElement on the target.

        //fluent
        doc().ready(callback);

        //legacy
        doc.ready(callback);
*/

function ready(callback){
    if(doc.document && (doc.document.readyState === 'complete' || doc.document.readyState === 'interactive')){
        callback();
    }else if(window.attachEvent){
        document.attachEvent("onreadystatechange", callback);
        window.attachEvent("onLoad",callback);
    }else if(document.addEventListener){
        document.addEventListener("DOMContentLoaded",callback,false);
    }
}

doc.find = find;
doc.findOne = findOne;
doc.closest = closest;
doc.is = is;
doc.addClass = addClass;
doc.removeClass = removeClass;
doc.off = off;
doc.on = on;
doc.append = append;
doc.prepend = prepend;
doc.isVisible = isVisible;
doc.ready = ready;
doc.indexOfElement = indexOfElement;

module.exports = doc;
},{"./getTarget":6,"./getTargets":7,"./isList":8}],5:[function(require,module,exports){
var doc = require('./doc'),
    isList = require('./isList'),
    getTargets = require('./getTargets')(doc.document),
    flocProto = [];

function Floc(items){
    this.push.apply(this, items);
}
Floc.prototype = flocProto;
flocProto.constructor = Floc;

function floc(target){
    var instance = getTargets(target);

    if(!isList(instance)){
        if(instance){
            instance = [instance];
        }else{
            instance = [];
        }
    }
    return new Floc(instance);
}

var returnsSelf = 'addClass removeClass append prepend'.split(' ');

for(var key in doc){
    if(typeof doc[key] === 'function'){
        floc[key] = doc[key];
        flocProto[key] = (function(key){
            var instance = this;
            // This is also extremely dodgy and fast
            return function(a,b,c,d,e,f){
                var result = doc[key](this, a,b,c,d,e,f);

                if(result !== doc && isList(result)){
                    return floc(result);
                }
                if(returnsSelf.indexOf(key) >=0){
                    return instance;
                }
                return result;
            };
        }(key));
    }
}
flocProto.on = function(events, target, callback){
    var proxy = this;
    if(typeof target === 'function'){
        callback = target;
        target = this;
        proxy = null;
    }
    doc.on(events, target, callback, proxy);
    return this;
};

flocProto.off = function(events, target, callback){
    var reference = this;
    if(typeof target === 'function'){
        callback = target;
        target = this;
        reference = null;
    }
    doc.off(events, target, callback, reference);
    return this;
};

flocProto.ready = function(callback){
    doc.ready(callback);
    return this;
};

flocProto.addClass = function(className){
    doc.addClass(this, className);
    return this;
};

flocProto.removeClass = function(className){
    doc.removeClass(this, className);
    return this;
};

module.exports = floc;
},{"./doc":4,"./getTargets":7,"./isList":8}],6:[function(require,module,exports){
var singleId = /^#\w+$/;

module.exports = function(document){
    return function getTarget(target){
        if(typeof target === 'string'){
            if(singleId.exec(target)){
                return document.getElementById(target.slice(1));
            }
            return document.querySelector(target);
        }

        return target;
    };
};
},{}],7:[function(require,module,exports){

var singleClass = /^\.\w+$/,
    singleId = /^#\w+$/,
    singleTag = /^\w+$/;

module.exports = function(document){
    return function getTargets(target){
        if(typeof target === 'string'){
            if(singleId.exec(target)){
                // If you have more than 1 of the same id in your page,
                // thats your own stupid fault.
                return [document.getElementById(target.slice(1))];
            }
            if(singleTag.exec(target)){
                return document.getElementsByTagName(target);
            }
            if(singleClass.exec(target)){
                return document.getElementsByClassName(target.slice(1));
            }
            return document.querySelectorAll(target);
        }

        return target;
    };
};
},{}],8:[function(require,module,exports){
module.exports = function isList(object){
    return object != null && typeof object === 'object' && 'length' in object && !('nodeType' in object) && object.self != object; // in IE8, window.self is window, but it is not === window, but it is == window......... WTF!?
}
},{}],9:[function(require,module,exports){
var supportedTypes = ['text', 'search', 'tel', 'url', 'password'];

module.exports = function(element){
    return !!(element.setSelectionRange && ~supportedTypes.indexOf(element.type));
};

},{}],10:[function(require,module,exports){
var naturalSelection = require('natural-selection');

module.exports = function(element, value){
    var canSet = naturalSelection(element) && element === document.activeElement;

    if (canSet) {
        var start = element.selectionStart,
            end = element.selectionEnd;

        element.value = value;
        element.setSelectionRange(start, end);
    } else {
        element.value = value;
    }
};

},{"natural-selection":9}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL2luZGV4LmpzIiwiaW5kZXguanMiLCJub2RlX21vZHVsZXMvY3JlbC9jcmVsLmpzIiwibm9kZV9tb2R1bGVzL2RvYy1qcy9kb2MuanMiLCJub2RlX21vZHVsZXMvZG9jLWpzL2ZsdWVudC5qcyIsIm5vZGVfbW9kdWxlcy9kb2MtanMvZ2V0VGFyZ2V0LmpzIiwibm9kZV9tb2R1bGVzL2RvYy1qcy9nZXRUYXJnZXRzLmpzIiwibm9kZV9tb2R1bGVzL2RvYy1qcy9pc0xpc3QuanMiLCJub2RlX21vZHVsZXMvbmF0dXJhbC1zZWxlY3Rpb24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvc2V0aWZ5L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY3JlbCA9IHJlcXVpcmUoJ2NyZWwnKSxcbiAgICBkb2MgPSByZXF1aXJlKCdkb2MtanMnKSxcbiAgICBtb3JyaXNvbiA9IHJlcXVpcmUoJy4uLycpLFxuICAgIHZhbGlkYXRvcnMgPSB7XG4gICAgICAgICdbZGF0YS12YWxpZGF0ZT1udW1iZXJdJzogL15cXGQqJHxeXFxkKlxcLiR8XlxcZCpcXC5cXGQrJC8sXG4gICAgICAgICdbZGF0YS12YWxpZGF0ZT1pbnRlZ2VyXSc6IC9eXFxkKiQvLFxuICAgICAgICAnW2RhdGEtdmFsaWRhdGU9Zm9vXSc6IC9eZiR8XmZvJHxeZm9vJC9cbiAgICB9O1xuXG52YXIgaW5zdHJ1Y3Rpb25zID0gY3JlbCgnZGl2Jywge1xuICAgICAgICBjbGFzczogJ2luc3RydWN0aW9ucydcbiAgICB9LFxuICAgIGNyZWwoJ2gzJywgJ1Bhc3RlIHRoZSBmb2xsb3dpbmcgdGV4dCBpbnRvIGVhY2ggb2YgdGhlIGlucHV0cycpLFxuICAgIGNyZWwoJ2xhYmVsJywgJzEyMy4xMjMuZjFvMC4uLm8nKVxuKTtcblxudmFyIGludGVnZXJzID0gY3JlbCgnZGl2Jywge1xuICAgICAgICBjbGFzczogJ2V4YW1wbGUnXG4gICAgfSxcbiAgICBjcmVsKCdpbnB1dCcsIHtcbiAgICAgICAgJ2RhdGEtdmFsaWRhdGUnOiAnaW50ZWdlcidcbiAgICB9KSxcbiAgICBjcmVsKCdsYWJlbCcsICdJbnRlZ2VycyBvbmx5Jylcbik7XG5cbnZhciBudW1iZXJzID0gY3JlbCgnZGl2Jywge1xuICAgICAgICBjbGFzczogJ2V4YW1wbGUnXG4gICAgfSxcbiAgICBjcmVsKCdpbnB1dCcsIHtcbiAgICAgICAgJ2RhdGEtdmFsaWRhdGUnOiAnbnVtYmVyJ1xuICAgIH0pLFxuICAgIGNyZWwoJ2xhYmVsJywgJ051bWJlcnMgb25seScpXG4pO1xuXG52YXIgZm9vID0gY3JlbCgnZGl2Jywge1xuICAgICAgICBjbGFzczogJ2V4YW1wbGUnXG4gICAgfSxcbiAgICBjcmVsKCdpbnB1dCcsIHtcbiAgICAgICAgJ2RhdGEtdmFsaWRhdGUnOiAnZm9vJ1xuICAgIH0pLFxuICAgIGNyZWwoJ2xhYmVsJywgJ2ZvbyBvbmx5Jylcbik7XG5cbmRvYy5yZWFkeShmdW5jdGlvbigpIHtcblxuICAgIGNyZWwoZG9jdW1lbnQuYm9keSxcbiAgICAgICAgaW5zdHJ1Y3Rpb25zLFxuICAgICAgICBpbnRlZ2VycyxcbiAgICAgICAgbnVtYmVycyxcbiAgICAgICAgZm9vXG4gICAgKTtcblxuICAgIG1vcnJpc29uKHtcbiAgICAgICAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xuICAgIH0pO1xufSk7XG4iLCJ2YXIgZG9jID0gcmVxdWlyZSgnZG9jLWpzJyksXG4gICAgc2V0aWZ5ID0gcmVxdWlyZSgnc2V0aWZ5JyksXG4gICAgbmF0dXJhbFNlbGVjdGlvbiA9IHJlcXVpcmUoJ25hdHVyYWwtc2VsZWN0aW9uJyk7XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdEluc2VydFN0cmluZyhlbGVtZW50LCBpbnNlcnRWYWx1ZSl7XG4gICAgdmFyIHJlc3VsdCA9ICcnLFxuICAgICAgICB2YWx1ZSA9IGVsZW1lbnQudmFsdWU7XG5cbiAgICBpZihuYXR1cmFsU2VsZWN0aW9uKGVsZW1lbnQpKSB7XG4gICAgICAgIHZhciBzdGFydCA9IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsXG4gICAgICAgICAgICBlbmQgPSBlbGVtZW50LnNlbGVjdGlvbkVuZDtcblxuICAgICAgICByZXN1bHQgPSB2YWx1ZS5zbGljZSgwLCBzdGFydCkgKyBpbnNlcnRWYWx1ZSArIHZhbHVlLnNsaWNlKGVuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWUgKyBpbnNlcnRWYWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUlucHV0KHRlc3RTdHJpbmcsIHJlZ2V4KSB7XG4gICAgdmFyIG5ld1JlZ2V4ID0gbmV3IFJlZ0V4cChyZWdleCk7XG5cbiAgICByZXR1cm4gISF0ZXN0U3RyaW5nLm1hdGNoKG5ld1JlZ2V4KTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVLZXkoZXZlbnQsIHJlZ2V4KSB7XG4gICAgdmFyIG5ld0NoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LndoaWNoKSxcbiAgICAgICAgdGVzdFN0cmluZyA9IGNvbnN0cnVjdEluc2VydFN0cmluZyhldmVudC50YXJnZXQsIG5ld0NoYXIpO1xuXG4gICAgaWYoIXZhbGlkYXRlSW5wdXQodGVzdFN0cmluZywgcmVnZXgpKXtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlUGFzdGUoZXZlbnQsIHJlZ2V4KXtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQsXG4gICAgICAgIHBhc3RlZERhdGEgPSBldmVudC5jbGlwYm9hcmREYXRhLmdldERhdGEoJ1RleHQnKTtcblxuICAgIHBhc3RlZERhdGEgPSBjb25zdHJ1Y3RJbnNlcnRTdHJpbmcoZWxlbWVudCwgcGFzdGVkRGF0YSk7XG4gICAgcGFzdGVkRGF0YSA9IHBhc3RlZERhdGEuc3BsaXQoJycpXG4gICAgICAgIC5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBjaGFyYXRlcikge1xuICAgICAgICAgICAgaWYodmFsaWRhdGVJbnB1dChyZXN1bHQgKyBjaGFyYXRlciwgcmVnZXgpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0ICsgY2hhcmF0ZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sICcnKTtcblxuICAgIHNldGlmeShlbGVtZW50LCBwYXN0ZWREYXRhKTtcbn1cblxudmFyIGV2ZW50VmFsaWRhdG9ycyA9IHtcbiAgICAncGFzdGUnOiB2YWxpZGF0ZVBhc3RlLFxuICAgICdrZXlwcmVzcyc6IHZhbGlkYXRlS2V5XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG4gICAgaWYoIXNldHRpbmdzIHx8ICFzZXR0aW5ncy52YWxpZGF0b3JzKSB7XG4gICAgICAgIHRocm93KCdTZXR0aW5ncyBvYmplY3Qgd2l0aCB2YWxpZGF0b3JzIHJlcXVpcmVkJyk7XG4gICAgfVxuXG4gICAgdmFyIHBhcmVudEVsZW1lbnQgPSBzZXR0aW5ncy5wYXJlbnRFbGVtZW50IHx8IGRvY3VtZW50LFxuICAgICAgICB2YWxpZGF0b3JzID0gc2V0dGluZ3MudmFsaWRhdG9ycyxcbiAgICAgICAgc2VsZWN0b3JzID0gT2JqZWN0LmtleXModmFsaWRhdG9ycykuam9pbignLCAnKTtcblxuICAgIGZ1bmN0aW9uIHZhbGlkYXRlSW5wdXQoZXZlbnQpIHtcblxuICAgICAgICBmdW5jdGlvbiBnZXRWYWxpZGF0b3JLZXkodmFsaWRhdG9yS2V5KSB7XG4gICAgICAgICAgICBpZihkb2MuaXMoZXZlbnQudGFyZ2V0LCB2YWxpZGF0b3JLZXkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRvcktleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB2YWxpZGF0b3JLZXkgPSBPYmplY3Qua2V5cyh2YWxpZGF0b3JzKS5maW5kKGdldFZhbGlkYXRvcktleSksXG4gICAgICAgICAgICB2YWxpZGF0b3IgPSBldmVudFZhbGlkYXRvcnNbZXZlbnQudHlwZV0sXG4gICAgICAgICAgICByZWdleCA9IHZhbGlkYXRvcnNbdmFsaWRhdG9yS2V5XTtcblxuICAgICAgICBpZighdmFsaWRhdG9yIHx8ICFyZWdleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFsaWRhdG9yKGV2ZW50LCByZWdleCk7XG4gICAgfVxuXG4gICAgZG9jKHBhcmVudEVsZW1lbnQpLm9uKCdwYXN0ZSBrZXlwcmVzcycsIHNlbGVjdG9ycywgdmFsaWRhdGVJbnB1dCk7XG59O1xuIiwiLy9Db3B5cmlnaHQgKEMpIDIwMTIgS29yeSBOdW5uXHJcblxyXG4vL1Blcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcblxyXG4vL1RoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuLy9USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuXHJcbi8qXHJcblxyXG4gICAgVGhpcyBjb2RlIGlzIG5vdCBmb3JtYXR0ZWQgZm9yIHJlYWRhYmlsaXR5LCBidXQgcmF0aGVyIHJ1bi1zcGVlZCBhbmQgdG8gYXNzaXN0IGNvbXBpbGVycy5cclxuXHJcbiAgICBIb3dldmVyLCB0aGUgY29kZSdzIGludGVudGlvbiBzaG91bGQgYmUgdHJhbnNwYXJlbnQuXHJcblxyXG4gICAgKioqIElFIFNVUFBPUlQgKioqXHJcblxyXG4gICAgSWYgeW91IHJlcXVpcmUgdGhpcyBsaWJyYXJ5IHRvIHdvcmsgaW4gSUU3LCBhZGQgdGhlIGZvbGxvd2luZyBhZnRlciBkZWNsYXJpbmcgY3JlbC5cclxuXHJcbiAgICB2YXIgdGVzdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG4gICAgICAgIHRlc3RMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcblxyXG4gICAgdGVzdERpdi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2EnKTtcclxuICAgIHRlc3REaXZbJ2NsYXNzTmFtZSddICE9PSAnYScgPyBjcmVsLmF0dHJNYXBbJ2NsYXNzJ10gPSAnY2xhc3NOYW1lJzp1bmRlZmluZWQ7XHJcbiAgICB0ZXN0RGl2LnNldEF0dHJpYnV0ZSgnbmFtZScsJ2EnKTtcclxuICAgIHRlc3REaXZbJ25hbWUnXSAhPT0gJ2EnID8gY3JlbC5hdHRyTWFwWyduYW1lJ10gPSBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZSl7XHJcbiAgICAgICAgZWxlbWVudC5pZCA9IHZhbHVlO1xyXG4gICAgfTp1bmRlZmluZWQ7XHJcblxyXG5cclxuICAgIHRlc3RMYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsICdhJyk7XHJcbiAgICB0ZXN0TGFiZWxbJ2h0bWxGb3InXSAhPT0gJ2EnID8gY3JlbC5hdHRyTWFwWydmb3InXSA9ICdodG1sRm9yJzp1bmRlZmluZWQ7XHJcblxyXG5cclxuXHJcbiovXHJcblxyXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcclxuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByb290LmNyZWwgPSBmYWN0b3J5KCk7XHJcbiAgICB9XHJcbn0odGhpcywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGZuID0gJ2Z1bmN0aW9uJyxcclxuICAgICAgICBvYmogPSAnb2JqZWN0JyxcclxuICAgICAgICBub2RlVHlwZSA9ICdub2RlVHlwZScsXHJcbiAgICAgICAgdGV4dENvbnRlbnQgPSAndGV4dENvbnRlbnQnLFxyXG4gICAgICAgIHNldEF0dHJpYnV0ZSA9ICdzZXRBdHRyaWJ1dGUnLFxyXG4gICAgICAgIGF0dHJNYXBTdHJpbmcgPSAnYXR0ck1hcCcsXHJcbiAgICAgICAgaXNOb2RlU3RyaW5nID0gJ2lzTm9kZScsXHJcbiAgICAgICAgaXNFbGVtZW50U3RyaW5nID0gJ2lzRWxlbWVudCcsXHJcbiAgICAgICAgZCA9IHR5cGVvZiBkb2N1bWVudCA9PT0gb2JqID8gZG9jdW1lbnQgOiB7fSxcclxuICAgICAgICBpc1R5cGUgPSBmdW5jdGlvbihhLCB0eXBlKXtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNOb2RlID0gdHlwZW9mIE5vZGUgPT09IGZuID8gZnVuY3Rpb24gKG9iamVjdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0IGluc3RhbmNlb2YgTm9kZTtcclxuICAgICAgICB9IDpcclxuICAgICAgICAvLyBpbiBJRSA8PSA4IE5vZGUgaXMgYW4gb2JqZWN0LCBvYnZpb3VzbHkuLlxyXG4gICAgICAgIGZ1bmN0aW9uKG9iamVjdCl7XHJcbiAgICAgICAgICAgIHJldHVybiBvYmplY3QgJiZcclxuICAgICAgICAgICAgICAgIGlzVHlwZShvYmplY3QsIG9iaikgJiZcclxuICAgICAgICAgICAgICAgIChub2RlVHlwZSBpbiBvYmplY3QpICYmXHJcbiAgICAgICAgICAgICAgICBpc1R5cGUob2JqZWN0Lm93bmVyRG9jdW1lbnQsb2JqKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzRWxlbWVudCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNyZWxbaXNOb2RlU3RyaW5nXShvYmplY3QpICYmIG9iamVjdFtub2RlVHlwZV0gPT09IDE7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc0FycmF5ID0gZnVuY3Rpb24oYSl7XHJcbiAgICAgICAgICAgIHJldHVybiBhIGluc3RhbmNlb2YgQXJyYXk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhcHBlbmRDaGlsZCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNoaWxkKSB7XHJcbiAgICAgICAgICBpZighY3JlbFtpc05vZGVTdHJpbmddKGNoaWxkKSl7XHJcbiAgICAgICAgICAgICAgY2hpbGQgPSBkLmNyZWF0ZVRleHROb2RlKGNoaWxkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoY2hpbGQpO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWwoKXtcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cywgLy9Ob3RlOiBhc3NpZ25lZCB0byBhIHZhcmlhYmxlIHRvIGFzc2lzdCBjb21waWxlcnMuIFNhdmVzIGFib3V0IDQwIGJ5dGVzIGluIGNsb3N1cmUgY29tcGlsZXIuIEhhcyBuZWdsaWdhYmxlIGVmZmVjdCBvbiBwZXJmb3JtYW5jZS5cclxuICAgICAgICAgICAgZWxlbWVudCA9IGFyZ3NbMF0sXHJcbiAgICAgICAgICAgIGNoaWxkLFxyXG4gICAgICAgICAgICBzZXR0aW5ncyA9IGFyZ3NbMV0sXHJcbiAgICAgICAgICAgIGNoaWxkSW5kZXggPSAyLFxyXG4gICAgICAgICAgICBhcmd1bWVudHNMZW5ndGggPSBhcmdzLmxlbmd0aCxcclxuICAgICAgICAgICAgYXR0cmlidXRlTWFwID0gY3JlbFthdHRyTWFwU3RyaW5nXTtcclxuXHJcbiAgICAgICAgZWxlbWVudCA9IGNyZWxbaXNFbGVtZW50U3RyaW5nXShlbGVtZW50KSA/IGVsZW1lbnQgOiBkLmNyZWF0ZUVsZW1lbnQoZWxlbWVudCk7XHJcbiAgICAgICAgLy8gc2hvcnRjdXRcclxuICAgICAgICBpZihhcmd1bWVudHNMZW5ndGggPT09IDEpe1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCFpc1R5cGUoc2V0dGluZ3Msb2JqKSB8fCBjcmVsW2lzTm9kZVN0cmluZ10oc2V0dGluZ3MpIHx8IGlzQXJyYXkoc2V0dGluZ3MpKSB7XHJcbiAgICAgICAgICAgIC0tY2hpbGRJbmRleDtcclxuICAgICAgICAgICAgc2V0dGluZ3MgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc2hvcnRjdXQgaWYgdGhlcmUgaXMgb25seSBvbmUgY2hpbGQgdGhhdCBpcyBhIHN0cmluZ1xyXG4gICAgICAgIGlmKChhcmd1bWVudHNMZW5ndGggLSBjaGlsZEluZGV4KSA9PT0gMSAmJiBpc1R5cGUoYXJnc1tjaGlsZEluZGV4XSwgJ3N0cmluZycpICYmIGVsZW1lbnRbdGV4dENvbnRlbnRdICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBlbGVtZW50W3RleHRDb250ZW50XSA9IGFyZ3NbY2hpbGRJbmRleF07XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGZvcig7IGNoaWxkSW5kZXggPCBhcmd1bWVudHNMZW5ndGg7ICsrY2hpbGRJbmRleCl7XHJcbiAgICAgICAgICAgICAgICBjaGlsZCA9IGFyZ3NbY2hpbGRJbmRleF07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoY2hpbGQgPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkoY2hpbGQpKSB7XHJcbiAgICAgICAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaSA8IGNoaWxkLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwZW5kQ2hpbGQoZWxlbWVudCwgY2hpbGRbaV0pO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBhcHBlbmRDaGlsZChlbGVtZW50LCBjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvcih2YXIga2V5IGluIHNldHRpbmdzKXtcclxuICAgICAgICAgICAgaWYoIWF0dHJpYnV0ZU1hcFtrZXldKXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnRbc2V0QXR0cmlidXRlXShrZXksIHNldHRpbmdzW2tleV0pO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHZhciBhdHRyID0gYXR0cmlidXRlTWFwW2tleV07XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgYXR0ciA9PT0gZm4pe1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dHIoZWxlbWVudCwgc2V0dGluZ3Nba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50W3NldEF0dHJpYnV0ZV0oYXR0ciwgc2V0dGluZ3Nba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZWQgZm9yIG1hcHBpbmcgb25lIGtpbmQgb2YgYXR0cmlidXRlIHRvIHRoZSBzdXBwb3J0ZWQgdmVyc2lvbiBvZiB0aGF0IGluIGJhZCBicm93c2Vycy5cclxuICAgIGNyZWxbYXR0ck1hcFN0cmluZ10gPSB7fTtcclxuXHJcbiAgICBjcmVsW2lzRWxlbWVudFN0cmluZ10gPSBpc0VsZW1lbnQ7XHJcblxyXG4gICAgY3JlbFtpc05vZGVTdHJpbmddID0gaXNOb2RlO1xyXG5cclxuICAgIHJldHVybiBjcmVsO1xyXG59KSk7XHJcbiIsInZhciBkb2MgPSB7XHJcbiAgICBkb2N1bWVudDogdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyA/IGRvY3VtZW50IDogbnVsbCxcclxuICAgIHNldERvY3VtZW50OiBmdW5jdGlvbihkKXtcclxuICAgICAgICB0aGlzLmRvY3VtZW50ID0gZDtcclxuICAgIH1cclxufTtcclxuXHJcbnZhciBhcnJheVByb3RvID0gW10sXHJcbiAgICBpc0xpc3QgPSByZXF1aXJlKCcuL2lzTGlzdCcpLFxyXG4gICAgZ2V0VGFyZ2V0cyA9IHJlcXVpcmUoJy4vZ2V0VGFyZ2V0cycpKGRvYy5kb2N1bWVudCksXHJcbiAgICBnZXRUYXJnZXQgPSByZXF1aXJlKCcuL2dldFRhcmdldCcpKGRvYy5kb2N1bWVudCksXHJcbiAgICBzcGFjZSA9ICcgJztcclxuXHJcblxyXG4vLy9bUkVBRE1FLm1kXVxyXG5cclxuZnVuY3Rpb24gaXNJbihhcnJheSwgaXRlbSl7XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZihpdGVtID09PSBhcnJheVtpXSl7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcblxyXG4gICAgIyMgLmZpbmRcclxuXHJcbiAgICBmaW5kcyBlbGVtZW50cyB0aGF0IG1hdGNoIHRoZSBxdWVyeSB3aXRoaW4gdGhlIHNjb3BlIG9mIHRhcmdldFxyXG5cclxuICAgICAgICAvL2ZsdWVudFxyXG4gICAgICAgIGRvYyh0YXJnZXQpLmZpbmQocXVlcnkpO1xyXG5cclxuICAgICAgICAvL2xlZ2FjeVxyXG4gICAgICAgIGRvYy5maW5kKHRhcmdldCwgcXVlcnkpO1xyXG4qL1xyXG5cclxuZnVuY3Rpb24gZmluZCh0YXJnZXQsIHF1ZXJ5KXtcclxuICAgIHRhcmdldCA9IGdldFRhcmdldHModGFyZ2V0KTtcclxuICAgIGlmKHF1ZXJ5ID09IG51bGwpe1xyXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoaXNMaXN0KHRhcmdldCkpe1xyXG4gICAgICAgIHZhciByZXN1bHRzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXJnZXQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHN1YlJlc3VsdHMgPSBkb2MuZmluZCh0YXJnZXRbaV0sIHF1ZXJ5KTtcclxuICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHN1YlJlc3VsdHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGlmKCFpc0luKHJlc3VsdHMsIHN1YlJlc3VsdHNbal0pKXtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goc3ViUmVzdWx0c1tqXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhcmdldCA/IHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKHF1ZXJ5KSA6IFtdO1xyXG59XHJcblxyXG4vKipcclxuXHJcbiAgICAjIyAuZmluZE9uZVxyXG5cclxuICAgIGZpbmRzIHRoZSBmaXJzdCBlbGVtZW50IHRoYXQgbWF0Y2hlcyB0aGUgcXVlcnkgd2l0aGluIHRoZSBzY29wZSBvZiB0YXJnZXRcclxuXHJcbiAgICAgICAgLy9mbHVlbnRcclxuICAgICAgICBkb2ModGFyZ2V0KS5maW5kT25lKHF1ZXJ5KTtcclxuXHJcbiAgICAgICAgLy9sZWdhY3lcclxuICAgICAgICBkb2MuZmluZE9uZSh0YXJnZXQsIHF1ZXJ5KTtcclxuKi9cclxuXHJcbmZ1bmN0aW9uIGZpbmRPbmUodGFyZ2V0LCBxdWVyeSl7XHJcbiAgICB0YXJnZXQgPSBnZXRUYXJnZXQodGFyZ2V0KTtcclxuICAgIGlmKHF1ZXJ5ID09IG51bGwpe1xyXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoaXNMaXN0KHRhcmdldCkpe1xyXG4gICAgICAgIHZhciByZXN1bHQ7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXJnZXQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gZmluZE9uZSh0YXJnZXRbaV0sIHF1ZXJ5KTtcclxuICAgICAgICAgICAgaWYocmVzdWx0KXtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhcmdldCA/IHRhcmdldC5xdWVyeVNlbGVjdG9yKHF1ZXJ5KSA6IG51bGw7XHJcbn1cclxuXHJcbi8qKlxyXG5cclxuICAgICMjIC5jbG9zZXN0XHJcblxyXG4gICAgcmVjdXJzZXMgdXAgdGhlIERPTSBmcm9tIHRoZSB0YXJnZXQgbm9kZSwgY2hlY2tpbmcgaWYgdGhlIGN1cnJlbnQgZWxlbWVudCBtYXRjaGVzIHRoZSBxdWVyeVxyXG5cclxuICAgICAgICAvL2ZsdWVudFxyXG4gICAgICAgIGRvYyh0YXJnZXQpLmNsb3Nlc3QocXVlcnkpO1xyXG5cclxuICAgICAgICAvL2xlZ2FjeVxyXG4gICAgICAgIGRvYy5jbG9zZXN0KHRhcmdldCwgcXVlcnkpO1xyXG4qL1xyXG5cclxuZnVuY3Rpb24gY2xvc2VzdCh0YXJnZXQsIHF1ZXJ5KXtcclxuICAgIHRhcmdldCA9IGdldFRhcmdldCh0YXJnZXQpO1xyXG5cclxuICAgIGlmKGlzTGlzdCh0YXJnZXQpKXtcclxuICAgICAgICB0YXJnZXQgPSB0YXJnZXRbMF07XHJcbiAgICB9XHJcblxyXG4gICAgd2hpbGUoXHJcbiAgICAgICAgdGFyZ2V0ICYmXHJcbiAgICAgICAgdGFyZ2V0Lm93bmVyRG9jdW1lbnQgJiZcclxuICAgICAgICAhaXModGFyZ2V0LCBxdWVyeSlcclxuICAgICl7XHJcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhcmdldCA9PT0gZG9jLmRvY3VtZW50ICYmIHRhcmdldCAhPT0gcXVlcnkgPyBudWxsIDogdGFyZ2V0O1xyXG59XHJcblxyXG4vKipcclxuXHJcbiAgICAjIyAuaXNcclxuXHJcbiAgICByZXR1cm5zIHRydWUgaWYgdGhlIHRhcmdldCBlbGVtZW50IG1hdGNoZXMgdGhlIHF1ZXJ5XHJcblxyXG4gICAgICAgIC8vZmx1ZW50XHJcbiAgICAgICAgZG9jKHRhcmdldCkuaXMocXVlcnkpO1xyXG5cclxuICAgICAgICAvL2xlZ2FjeVxyXG4gICAgICAgIGRvYy5pcyh0YXJnZXQsIHF1ZXJ5KTtcclxuKi9cclxuXHJcbmZ1bmN0aW9uIGlzKHRhcmdldCwgcXVlcnkpe1xyXG4gICAgdGFyZ2V0ID0gZ2V0VGFyZ2V0KHRhcmdldCk7XHJcblxyXG4gICAgaWYoaXNMaXN0KHRhcmdldCkpe1xyXG4gICAgICAgIHRhcmdldCA9IHRhcmdldFswXTtcclxuICAgIH1cclxuXHJcbiAgICBpZighdGFyZ2V0Lm93bmVyRG9jdW1lbnQgfHwgdHlwZW9mIHF1ZXJ5ICE9PSAnc3RyaW5nJyl7XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldCA9PT0gcXVlcnk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYodGFyZ2V0ID09PSBxdWVyeSl7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHBhcmVudGxlc3MgPSAhdGFyZ2V0LnBhcmVudE5vZGU7XHJcblxyXG4gICAgaWYocGFyZW50bGVzcyl7XHJcbiAgICAgICAgLy8gR2l2ZSB0aGUgZWxlbWVudCBhIHBhcmVudCBzbyB0aGF0IC5xdWVyeVNlbGVjdG9yQWxsIGNhbiBiZSB1c2VkXHJcbiAgICAgICAgZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLmFwcGVuZENoaWxkKHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJlc3VsdCA9IGFycmF5UHJvdG8uaW5kZXhPZi5jYWxsKGZpbmQodGFyZ2V0LnBhcmVudE5vZGUsIHF1ZXJ5KSwgdGFyZ2V0KSA+PSAwO1xyXG5cclxuICAgIGlmKHBhcmVudGxlc3Mpe1xyXG4gICAgICAgIHRhcmdldC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcblxyXG4gICAgIyMgLmFkZENsYXNzXHJcblxyXG4gICAgYWRkcyBjbGFzc2VzIHRvIHRoZSB0YXJnZXQgKHNwYWNlIHNlcGFyYXRlZCBzdHJpbmcgb3IgYXJyYXkpXHJcblxyXG4gICAgICAgIC8vZmx1ZW50XHJcbiAgICAgICAgZG9jKHRhcmdldCkuYWRkQ2xhc3MocXVlcnkpO1xyXG5cclxuICAgICAgICAvL2xlZ2FjeVxyXG4gICAgICAgIGRvYy5hZGRDbGFzcyh0YXJnZXQsIHF1ZXJ5KTtcclxuKi9cclxuXHJcbmZ1bmN0aW9uIGFkZENsYXNzKHRhcmdldCwgY2xhc3Nlcyl7XHJcbiAgICB0YXJnZXQgPSBnZXRUYXJnZXRzKHRhcmdldCk7XHJcblxyXG4gICAgaWYoaXNMaXN0KHRhcmdldCkpe1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFyZ2V0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGFkZENsYXNzKHRhcmdldFtpXSwgY2xhc3Nlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgaWYoIWNsYXNzZXMpe1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjbGFzc2VzID0gQXJyYXkuaXNBcnJheShjbGFzc2VzKSA/IGNsYXNzZXMgOiBjbGFzc2VzLnNwbGl0KHNwYWNlKSxcclxuICAgICAgICBjdXJyZW50Q2xhc3NlcyA9IHRhcmdldC5jbGFzc0xpc3QgPyBudWxsIDogdGFyZ2V0LmNsYXNzTmFtZS5zcGxpdChzcGFjZSk7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIHZhciBjbGFzc1RvQWRkID0gY2xhc3Nlc1tpXTtcclxuICAgICAgICBpZighY2xhc3NUb0FkZCB8fCBjbGFzc1RvQWRkID09PSBzcGFjZSl7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0YXJnZXQuY2xhc3NMaXN0KXtcclxuICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoY2xhc3NUb0FkZCk7XHJcbiAgICAgICAgfSBlbHNlIGlmKCFjdXJyZW50Q2xhc3Nlcy5pbmRleE9mKGNsYXNzVG9BZGQpPj0wKXtcclxuICAgICAgICAgICAgY3VycmVudENsYXNzZXMucHVzaChjbGFzc1RvQWRkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZighdGFyZ2V0LmNsYXNzTGlzdCl7XHJcbiAgICAgICAgdGFyZ2V0LmNsYXNzTmFtZSA9IGN1cnJlbnRDbGFzc2VzLmpvaW4oc3BhY2UpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbi8qKlxyXG5cclxuICAgICMjIC5yZW1vdmVDbGFzc1xyXG5cclxuICAgIHJlbW92ZXMgY2xhc3NlcyBmcm9tIHRoZSB0YXJnZXQgKHNwYWNlIHNlcGFyYXRlZCBzdHJpbmcgb3IgYXJyYXkpXHJcblxyXG4gICAgICAgIC8vZmx1ZW50XHJcbiAgICAgICAgZG9jKHRhcmdldCkucmVtb3ZlQ2xhc3MocXVlcnkpO1xyXG5cclxuICAgICAgICAvL2xlZ2FjeVxyXG4gICAgICAgIGRvYy5yZW1vdmVDbGFzcyh0YXJnZXQsIHF1ZXJ5KTtcclxuKi9cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZUNsYXNzKHRhcmdldCwgY2xhc3Nlcyl7XHJcbiAgICB0YXJnZXQgPSBnZXRUYXJnZXRzKHRhcmdldCk7XHJcblxyXG4gICAgaWYoaXNMaXN0KHRhcmdldCkpe1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFyZ2V0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKHRhcmdldFtpXSwgY2xhc3Nlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCFjbGFzc2VzKXtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2xhc3NlcyA9IEFycmF5LmlzQXJyYXkoY2xhc3NlcykgPyBjbGFzc2VzIDogY2xhc3Nlcy5zcGxpdChzcGFjZSksXHJcbiAgICAgICAgY3VycmVudENsYXNzZXMgPSB0YXJnZXQuY2xhc3NMaXN0ID8gbnVsbCA6IHRhcmdldC5jbGFzc05hbWUuc3BsaXQoc3BhY2UpO1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICB2YXIgY2xhc3NUb1JlbW92ZSA9IGNsYXNzZXNbaV07XHJcbiAgICAgICAgaWYoIWNsYXNzVG9SZW1vdmUgfHwgY2xhc3NUb1JlbW92ZSA9PT0gc3BhY2Upe1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGFyZ2V0LmNsYXNzTGlzdCl7XHJcbiAgICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzVG9SZW1vdmUpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlbW92ZUluZGV4ID0gY3VycmVudENsYXNzZXMuaW5kZXhPZihjbGFzc1RvUmVtb3ZlKTtcclxuICAgICAgICBpZihyZW1vdmVJbmRleCA+PSAwKXtcclxuICAgICAgICAgICAgY3VycmVudENsYXNzZXMuc3BsaWNlKHJlbW92ZUluZGV4LCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZighdGFyZ2V0LmNsYXNzTGlzdCl7XHJcbiAgICAgICAgdGFyZ2V0LmNsYXNzTmFtZSA9IGN1cnJlbnRDbGFzc2VzLmpvaW4oc3BhY2UpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZEV2ZW50KHNldHRpbmdzKXtcclxuICAgIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoc2V0dGluZ3MudGFyZ2V0KTtcclxuICAgIGlmKHRhcmdldCl7XHJcbiAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoc2V0dGluZ3MuZXZlbnQsIHNldHRpbmdzLmNhbGxiYWNrLCBmYWxzZSk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ05vIGVsZW1lbnRzIG1hdGNoZWQgdGhlIHNlbGVjdG9yLCBzbyBubyBldmVudHMgd2VyZSBib3VuZC4nKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcblxyXG4gICAgIyMgLm9uXHJcblxyXG4gICAgYmluZHMgYSBjYWxsYmFjayB0byBhIHRhcmdldCB3aGVuIGEgRE9NIGV2ZW50IGlzIHJhaXNlZC5cclxuXHJcbiAgICAgICAgLy9mbHVlbnRcclxuICAgICAgICBkb2ModGFyZ2V0L3Byb3h5KS5vbihldmVudHMsIHRhcmdldFtvcHRpb25hbF0sIGNhbGxiYWNrKTtcclxuXHJcbiAgICBub3RlOiBpZiBhIHRhcmdldCBpcyBwYXNzZWQgdG8gdGhlIC5vbiBmdW5jdGlvbiwgZG9jJ3MgdGFyZ2V0IHdpbGwgYmUgdXNlZCBhcyB0aGUgcHJveHkuXHJcblxyXG4gICAgICAgIC8vbGVnYWN5XHJcbiAgICAgICAgZG9jLm9uKGV2ZW50cywgdGFyZ2V0LCBxdWVyeSwgcHJveHlbb3B0aW9uYWxdKTtcclxuKi9cclxuXHJcbmZ1bmN0aW9uIG9uKGV2ZW50cywgdGFyZ2V0LCBjYWxsYmFjaywgcHJveHkpe1xyXG5cclxuICAgIHByb3h5ID0gZ2V0VGFyZ2V0cyhwcm94eSk7XHJcblxyXG4gICAgaWYoIXByb3h5KXtcclxuICAgICAgICB0YXJnZXQgPSBnZXRUYXJnZXRzKHRhcmdldCk7XHJcbiAgICAgICAgLy8gaGFuZGxlcyBtdWx0aXBsZSB0YXJnZXRzXHJcbiAgICAgICAgaWYoaXNMaXN0KHRhcmdldCkpe1xyXG4gICAgICAgICAgICB2YXIgbXVsdGlSZW1vdmVDYWxsYmFja3MgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXJnZXQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIG11bHRpUmVtb3ZlQ2FsbGJhY2tzLnB1c2gob24oZXZlbnRzLCB0YXJnZXRbaV0sIGNhbGxiYWNrLCBwcm94eSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgd2hpbGUobXVsdGlSZW1vdmVDYWxsYmFja3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICBtdWx0aVJlbW92ZUNhbGxiYWNrcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaGFuZGxlcyBtdWx0aXBsZSBwcm94aWVzXHJcbiAgICAvLyBBbHJlYWR5IGhhbmRsZXMgbXVsdGlwbGUgcHJveGllcyBhbmQgdGFyZ2V0cyxcclxuICAgIC8vIGJlY2F1c2UgdGhlIHRhcmdldCBsb29wIGNhbGxzIHRoaXMgbG9vcC5cclxuICAgIGlmKGlzTGlzdChwcm94eSkpe1xyXG4gICAgICAgIHZhciBtdWx0aVJlbW92ZUNhbGxiYWNrcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJveHkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbXVsdGlSZW1vdmVDYWxsYmFja3MucHVzaChvbihldmVudHMsIHRhcmdldCwgY2FsbGJhY2ssIHByb3h5W2ldKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB3aGlsZShtdWx0aVJlbW92ZUNhbGxiYWNrcy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgbXVsdGlSZW1vdmVDYWxsYmFja3MucG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByZW1vdmVDYWxsYmFja3MgPSBbXTtcclxuXHJcbiAgICBpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJyl7XHJcbiAgICAgICAgZXZlbnRzID0gZXZlbnRzLnNwbGl0KHNwYWNlKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICB2YXIgZXZlbnRTZXR0aW5ncyA9IHt9O1xyXG4gICAgICAgIGlmKHByb3h5KXtcclxuICAgICAgICAgICAgaWYocHJveHkgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgcHJveHkgPSBkb2MuZG9jdW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZXZlbnRTZXR0aW5ncy50YXJnZXQgPSBwcm94eTtcclxuICAgICAgICAgICAgZXZlbnRTZXR0aW5ncy5jYWxsYmFjayA9IGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgICAgIHZhciBjbG9zZXN0VGFyZ2V0ID0gY2xvc2VzdChldmVudC50YXJnZXQsIHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICBpZihjbG9zZXN0VGFyZ2V0KXtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhldmVudCwgY2xvc2VzdFRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGV2ZW50U2V0dGluZ3MudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICAgICAgICBldmVudFNldHRpbmdzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBldmVudFNldHRpbmdzLmV2ZW50ID0gZXZlbnRzW2ldO1xyXG5cclxuICAgICAgICBhZGRFdmVudChldmVudFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgcmVtb3ZlQ2FsbGJhY2tzLnB1c2goZXZlbnRTZXR0aW5ncyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgd2hpbGUocmVtb3ZlQ2FsbGJhY2tzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIHZhciByZW1vdmVDYWxsYmFjayA9IHJlbW92ZUNhbGxiYWNrcy5wb3AoKTtcclxuICAgICAgICAgICAgZ2V0VGFyZ2V0KHJlbW92ZUNhbGxiYWNrLnRhcmdldCkucmVtb3ZlRXZlbnRMaXN0ZW5lcihyZW1vdmVDYWxsYmFjay5ldmVudCwgcmVtb3ZlQ2FsbGJhY2suY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcblxyXG4gICAgIyMgLm9mZlxyXG5cclxuICAgIHJlbW92ZXMgZXZlbnRzIGFzc2lnbmVkIHRvIGEgdGFyZ2V0LlxyXG5cclxuICAgICAgICAvL2ZsdWVudFxyXG4gICAgICAgIGRvYyh0YXJnZXQvcHJveHkpLm9mZihldmVudHMsIHRhcmdldFtvcHRpb25hbF0sIGNhbGxiYWNrKTtcclxuXHJcbiAgICBub3RlOiBpZiBhIHRhcmdldCBpcyBwYXNzZWQgdG8gdGhlIC5vbiBmdW5jdGlvbiwgZG9jJ3MgdGFyZ2V0IHdpbGwgYmUgdXNlZCBhcyB0aGUgcHJveHkuXHJcblxyXG4gICAgICAgIC8vbGVnYWN5XHJcbiAgICAgICAgZG9jLm9mZihldmVudHMsIHRhcmdldCwgY2FsbGJhY2ssIHByb3h5KTtcclxuKi9cclxuXHJcbmZ1bmN0aW9uIG9mZihldmVudHMsIHRhcmdldCwgY2FsbGJhY2ssIHByb3h5KXtcclxuICAgIGlmKGlzTGlzdCh0YXJnZXQpKXtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhcmdldC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBvZmYoZXZlbnRzLCB0YXJnZXRbaV0sIGNhbGxiYWNrLCBwcm94eSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgaWYocHJveHkgaW5zdGFuY2VvZiBBcnJheSl7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm94eS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBvZmYoZXZlbnRzLCB0YXJnZXQsIGNhbGxiYWNrLCBwcm94eVtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKXtcclxuICAgICAgICBldmVudHMgPSBldmVudHMuc3BsaXQoc3BhY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJyl7XHJcbiAgICAgICAgcHJveHkgPSBjYWxsYmFjaztcclxuICAgICAgICBjYWxsYmFjayA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJveHkgPSBwcm94eSA/IGdldFRhcmdldChwcm94eSkgOiBkb2MuZG9jdW1lbnQ7XHJcblxyXG4gICAgdmFyIHRhcmdldHMgPSB0eXBlb2YgdGFyZ2V0ID09PSAnc3RyaW5nJyA/IGZpbmQodGFyZ2V0LCBwcm94eSkgOiBbdGFyZ2V0XTtcclxuXHJcbiAgICBmb3IodmFyIHRhcmdldEluZGV4ID0gMDsgdGFyZ2V0SW5kZXggPCB0YXJnZXRzLmxlbmd0aDsgdGFyZ2V0SW5kZXgrKyl7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRUYXJnZXQgPSB0YXJnZXRzW3RhcmdldEluZGV4XTtcclxuXHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudHNbaV0sIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuLyoqXHJcblxyXG4gICAgIyMgLmFwcGVuZFxyXG5cclxuICAgIGFkZHMgZWxlbWVudHMgdG8gYSB0YXJnZXRcclxuXHJcbiAgICAgICAgLy9mbHVlbnRcclxuICAgICAgICBkb2ModGFyZ2V0KS5hcHBlbmQoY2hpbGRyZW4pO1xyXG5cclxuICAgICAgICAvL2xlZ2FjeVxyXG4gICAgICAgIGRvYy5hcHBlbmQodGFyZ2V0LCBjaGlsZHJlbik7XHJcbiovXHJcblxyXG5mdW5jdGlvbiBhcHBlbmQodGFyZ2V0LCBjaGlsZHJlbil7XHJcbiAgICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KHRhcmdldCksXHJcbiAgICAgICAgY2hpbGRyZW4gPSBnZXRUYXJnZXQoY2hpbGRyZW4pO1xyXG5cclxuICAgIGlmKGlzTGlzdCh0YXJnZXQpKXtcclxuICAgICAgICB0YXJnZXQgPSB0YXJnZXRbMF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYoaXNMaXN0KGNoaWxkcmVuKSl7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBhcHBlbmQodGFyZ2V0LCBjaGlsZHJlbltpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY2hpbGRyZW4pO1xyXG59XHJcblxyXG4vKipcclxuXHJcbiAgICAjIyAucHJlcGVuZFxyXG5cclxuICAgIGFkZHMgZWxlbWVudHMgdG8gdGhlIGZyb250IG9mIGEgdGFyZ2V0XHJcblxyXG4gICAgICAgIC8vZmx1ZW50XHJcbiAgICAgICAgZG9jKHRhcmdldCkucHJlcGVuZChjaGlsZHJlbik7XHJcblxyXG4gICAgICAgIC8vbGVnYWN5XHJcbiAgICAgICAgZG9jLnByZXBlbmQodGFyZ2V0LCBjaGlsZHJlbik7XHJcbiovXHJcblxyXG5mdW5jdGlvbiBwcmVwZW5kKHRhcmdldCwgY2hpbGRyZW4pe1xyXG4gICAgdmFyIHRhcmdldCA9IGdldFRhcmdldCh0YXJnZXQpLFxyXG4gICAgICAgIGNoaWxkcmVuID0gZ2V0VGFyZ2V0KGNoaWxkcmVuKTtcclxuXHJcbiAgICBpZihpc0xpc3QodGFyZ2V0KSl7XHJcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0WzBdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGlzTGlzdChjaGlsZHJlbikpe1xyXG4gICAgICAgIC8vcmV2ZXJzZWQgYmVjYXVzZSBvdGhlcndpc2UgdGhlIHdvdWxkIGdldCBwdXQgaW4gaW4gdGhlIHdyb25nIG9yZGVyLlxyXG4gICAgICAgIGZvciAodmFyIGkgPSBjaGlsZHJlbi5sZW5ndGggLTE7IGk7IGktLSkge1xyXG4gICAgICAgICAgICBwcmVwZW5kKHRhcmdldCwgY2hpbGRyZW5baV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGFyZ2V0Lmluc2VydEJlZm9yZShjaGlsZHJlbiwgdGFyZ2V0LmZpcnN0Q2hpbGQpO1xyXG59XHJcblxyXG4vKipcclxuXHJcbiAgICAjIyAuaXNWaXNpYmxlXHJcblxyXG4gICAgY2hlY2tzIGlmIGFuIGVsZW1lbnQgb3IgYW55IG9mIGl0cyBwYXJlbnRzIGRpc3BsYXkgcHJvcGVydGllcyBhcmUgc2V0IHRvICdub25lJ1xyXG5cclxuICAgICAgICAvL2ZsdWVudFxyXG4gICAgICAgIGRvYyh0YXJnZXQpLmlzVmlzaWJsZSgpO1xyXG5cclxuICAgICAgICAvL2xlZ2FjeVxyXG4gICAgICAgIGRvYy5pc1Zpc2libGUodGFyZ2V0KTtcclxuKi9cclxuXHJcbmZ1bmN0aW9uIGlzVmlzaWJsZSh0YXJnZXQpe1xyXG4gICAgdmFyIHRhcmdldCA9IGdldFRhcmdldCh0YXJnZXQpO1xyXG4gICAgaWYoIXRhcmdldCl7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYoaXNMaXN0KHRhcmdldCkpe1xyXG4gICAgICAgIHZhciBpID0gLTE7XHJcblxyXG4gICAgICAgIHdoaWxlICh0YXJnZXRbaSsrXSAmJiBpc1Zpc2libGUodGFyZ2V0W2ldKSkge31cclxuICAgICAgICByZXR1cm4gdGFyZ2V0Lmxlbmd0aCA+PSBpO1xyXG4gICAgfVxyXG4gICAgd2hpbGUodGFyZ2V0LnBhcmVudE5vZGUgJiYgdGFyZ2V0LnN0eWxlLmRpc3BsYXkgIT09ICdub25lJyl7XHJcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhcmdldCA9PT0gZG9jLmRvY3VtZW50O1xyXG59XHJcblxyXG4vKipcclxuXHJcbiAgICAjIyAuaW5kZXhPZkVsZW1lbnRcclxuXHJcbiAgICByZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCB3aXRoaW4gaXQncyBwYXJlbnQgZWxlbWVudC5cclxuXHJcbiAgICAgICAgLy9mbHVlbnRcclxuICAgICAgICBkb2ModGFyZ2V0KS5pbmRleE9mRWxlbWVudCgpO1xyXG5cclxuICAgICAgICAvL2xlZ2FjeVxyXG4gICAgICAgIGRvYy5pbmRleE9mRWxlbWVudCh0YXJnZXQpO1xyXG5cclxuKi9cclxuXHJcbmZ1bmN0aW9uIGluZGV4T2ZFbGVtZW50KHRhcmdldCkge1xyXG4gICAgdGFyZ2V0ID0gZ2V0VGFyZ2V0cyh0YXJnZXQpO1xyXG4gICAgaWYoIXRhcmdldCl7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGlzTGlzdCh0YXJnZXQpKXtcclxuICAgICAgICB0YXJnZXQgPSB0YXJnZXRbMF07XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGkgPSAtMTtcclxuXHJcbiAgICB2YXIgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XHJcblxyXG4gICAgaWYoIXBhcmVudCl7XHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICB9XHJcblxyXG4gICAgd2hpbGUocGFyZW50LmNoaWxkcmVuWysraV0gIT09IHRhcmdldCl7fVxyXG5cclxuICAgIHJldHVybiBpO1xyXG59XHJcblxyXG5cclxuLyoqXHJcblxyXG4gICAgIyMgLnJlYWR5XHJcblxyXG4gICAgY2FsbCBhIGNhbGxiYWNrIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5LlxyXG5cclxuICAgIHJldHVybnMgLTEgaWYgdGhlcmUgaXMgbm8gcGFyZW50RWxlbWVudCBvbiB0aGUgdGFyZ2V0LlxyXG5cclxuICAgICAgICAvL2ZsdWVudFxyXG4gICAgICAgIGRvYygpLnJlYWR5KGNhbGxiYWNrKTtcclxuXHJcbiAgICAgICAgLy9sZWdhY3lcclxuICAgICAgICBkb2MucmVhZHkoY2FsbGJhY2spO1xyXG4qL1xyXG5cclxuZnVuY3Rpb24gcmVhZHkoY2FsbGJhY2spe1xyXG4gICAgaWYoZG9jLmRvY3VtZW50ICYmIChkb2MuZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyB8fCBkb2MuZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2ludGVyYWN0aXZlJykpe1xyXG4gICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICB9ZWxzZSBpZih3aW5kb3cuYXR0YWNoRXZlbnQpe1xyXG4gICAgICAgIGRvY3VtZW50LmF0dGFjaEV2ZW50KFwib25yZWFkeXN0YXRlY2hhbmdlXCIsIGNhbGxiYWNrKTtcclxuICAgICAgICB3aW5kb3cuYXR0YWNoRXZlbnQoXCJvbkxvYWRcIixjYWxsYmFjayk7XHJcbiAgICB9ZWxzZSBpZihkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKXtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGNhbGxiYWNrLGZhbHNlKTtcclxuICAgIH1cclxufVxyXG5cclxuZG9jLmZpbmQgPSBmaW5kO1xyXG5kb2MuZmluZE9uZSA9IGZpbmRPbmU7XHJcbmRvYy5jbG9zZXN0ID0gY2xvc2VzdDtcclxuZG9jLmlzID0gaXM7XHJcbmRvYy5hZGRDbGFzcyA9IGFkZENsYXNzO1xyXG5kb2MucmVtb3ZlQ2xhc3MgPSByZW1vdmVDbGFzcztcclxuZG9jLm9mZiA9IG9mZjtcclxuZG9jLm9uID0gb247XHJcbmRvYy5hcHBlbmQgPSBhcHBlbmQ7XHJcbmRvYy5wcmVwZW5kID0gcHJlcGVuZDtcclxuZG9jLmlzVmlzaWJsZSA9IGlzVmlzaWJsZTtcclxuZG9jLnJlYWR5ID0gcmVhZHk7XHJcbmRvYy5pbmRleE9mRWxlbWVudCA9IGluZGV4T2ZFbGVtZW50O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkb2M7IiwidmFyIGRvYyA9IHJlcXVpcmUoJy4vZG9jJyksXHJcbiAgICBpc0xpc3QgPSByZXF1aXJlKCcuL2lzTGlzdCcpLFxyXG4gICAgZ2V0VGFyZ2V0cyA9IHJlcXVpcmUoJy4vZ2V0VGFyZ2V0cycpKGRvYy5kb2N1bWVudCksXHJcbiAgICBmbG9jUHJvdG8gPSBbXTtcclxuXHJcbmZ1bmN0aW9uIEZsb2MoaXRlbXMpe1xyXG4gICAgdGhpcy5wdXNoLmFwcGx5KHRoaXMsIGl0ZW1zKTtcclxufVxyXG5GbG9jLnByb3RvdHlwZSA9IGZsb2NQcm90bztcclxuZmxvY1Byb3RvLmNvbnN0cnVjdG9yID0gRmxvYztcclxuXHJcbmZ1bmN0aW9uIGZsb2ModGFyZ2V0KXtcclxuICAgIHZhciBpbnN0YW5jZSA9IGdldFRhcmdldHModGFyZ2V0KTtcclxuXHJcbiAgICBpZighaXNMaXN0KGluc3RhbmNlKSl7XHJcbiAgICAgICAgaWYoaW5zdGFuY2Upe1xyXG4gICAgICAgICAgICBpbnN0YW5jZSA9IFtpbnN0YW5jZV07XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGluc3RhbmNlID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBGbG9jKGluc3RhbmNlKTtcclxufVxyXG5cclxudmFyIHJldHVybnNTZWxmID0gJ2FkZENsYXNzIHJlbW92ZUNsYXNzIGFwcGVuZCBwcmVwZW5kJy5zcGxpdCgnICcpO1xyXG5cclxuZm9yKHZhciBrZXkgaW4gZG9jKXtcclxuICAgIGlmKHR5cGVvZiBkb2Nba2V5XSA9PT0gJ2Z1bmN0aW9uJyl7XHJcbiAgICAgICAgZmxvY1trZXldID0gZG9jW2tleV07XHJcbiAgICAgICAgZmxvY1Byb3RvW2tleV0gPSAoZnVuY3Rpb24oa2V5KXtcclxuICAgICAgICAgICAgdmFyIGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICAgICAgLy8gVGhpcyBpcyBhbHNvIGV4dHJlbWVseSBkb2RneSBhbmQgZmFzdFxyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oYSxiLGMsZCxlLGYpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGRvY1trZXldKHRoaXMsIGEsYixjLGQsZSxmKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihyZXN1bHQgIT09IGRvYyAmJiBpc0xpc3QocmVzdWx0KSl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZsb2MocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKHJldHVybnNTZWxmLmluZGV4T2Yoa2V5KSA+PTApe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfShrZXkpKTtcclxuICAgIH1cclxufVxyXG5mbG9jUHJvdG8ub24gPSBmdW5jdGlvbihldmVudHMsIHRhcmdldCwgY2FsbGJhY2spe1xyXG4gICAgdmFyIHByb3h5ID0gdGhpcztcclxuICAgIGlmKHR5cGVvZiB0YXJnZXQgPT09ICdmdW5jdGlvbicpe1xyXG4gICAgICAgIGNhbGxiYWNrID0gdGFyZ2V0O1xyXG4gICAgICAgIHRhcmdldCA9IHRoaXM7XHJcbiAgICAgICAgcHJveHkgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgZG9jLm9uKGV2ZW50cywgdGFyZ2V0LCBjYWxsYmFjaywgcHJveHkpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5mbG9jUHJvdG8ub2ZmID0gZnVuY3Rpb24oZXZlbnRzLCB0YXJnZXQsIGNhbGxiYWNrKXtcclxuICAgIHZhciByZWZlcmVuY2UgPSB0aGlzO1xyXG4gICAgaWYodHlwZW9mIHRhcmdldCA9PT0gJ2Z1bmN0aW9uJyl7XHJcbiAgICAgICAgY2FsbGJhY2sgPSB0YXJnZXQ7XHJcbiAgICAgICAgdGFyZ2V0ID0gdGhpcztcclxuICAgICAgICByZWZlcmVuY2UgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgZG9jLm9mZihldmVudHMsIHRhcmdldCwgY2FsbGJhY2ssIHJlZmVyZW5jZSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbmZsb2NQcm90by5yZWFkeSA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcclxuICAgIGRvYy5yZWFkeShjYWxsYmFjayk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbmZsb2NQcm90by5hZGRDbGFzcyA9IGZ1bmN0aW9uKGNsYXNzTmFtZSl7XHJcbiAgICBkb2MuYWRkQ2xhc3ModGhpcywgY2xhc3NOYW1lKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZmxvY1Byb3RvLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24oY2xhc3NOYW1lKXtcclxuICAgIGRvYy5yZW1vdmVDbGFzcyh0aGlzLCBjbGFzc05hbWUpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZsb2M7IiwidmFyIHNpbmdsZUlkID0gL14jXFx3KyQvO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvY3VtZW50KXtcbiAgICByZXR1cm4gZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCl7XG4gICAgICAgIGlmKHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgIGlmKHNpbmdsZUlkLmV4ZWModGFyZ2V0KSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldC5zbGljZSgxKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9O1xufTsiLCJcbnZhciBzaW5nbGVDbGFzcyA9IC9eXFwuXFx3KyQvLFxuICAgIHNpbmdsZUlkID0gL14jXFx3KyQvLFxuICAgIHNpbmdsZVRhZyA9IC9eXFx3KyQvO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvY3VtZW50KXtcbiAgICByZXR1cm4gZnVuY3Rpb24gZ2V0VGFyZ2V0cyh0YXJnZXQpe1xuICAgICAgICBpZih0eXBlb2YgdGFyZ2V0ID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICBpZihzaW5nbGVJZC5leGVjKHRhcmdldCkpe1xuICAgICAgICAgICAgICAgIC8vIElmIHlvdSBoYXZlIG1vcmUgdGhhbiAxIG9mIHRoZSBzYW1lIGlkIGluIHlvdXIgcGFnZSxcbiAgICAgICAgICAgICAgICAvLyB0aGF0cyB5b3VyIG93biBzdHVwaWQgZmF1bHQuXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXQuc2xpY2UoMSkpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHNpbmdsZVRhZy5leGVjKHRhcmdldCkpe1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoc2luZ2xlQ2xhc3MuZXhlYyh0YXJnZXQpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSh0YXJnZXQuc2xpY2UoMSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGFyZ2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0xpc3Qob2JqZWN0KXtcclxuICAgIHJldHVybiBvYmplY3QgIT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiAnbGVuZ3RoJyBpbiBvYmplY3QgJiYgISgnbm9kZVR5cGUnIGluIG9iamVjdCkgJiYgb2JqZWN0LnNlbGYgIT0gb2JqZWN0OyAvLyBpbiBJRTgsIHdpbmRvdy5zZWxmIGlzIHdpbmRvdywgYnV0IGl0IGlzIG5vdCA9PT0gd2luZG93LCBidXQgaXQgaXMgPT0gd2luZG93Li4uLi4uLi4uIFdURiE/XHJcbn0iLCJ2YXIgc3VwcG9ydGVkVHlwZXMgPSBbJ3RleHQnLCAnc2VhcmNoJywgJ3RlbCcsICd1cmwnLCAncGFzc3dvcmQnXTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbGVtZW50KXtcbiAgICByZXR1cm4gISEoZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSAmJiB+c3VwcG9ydGVkVHlwZXMuaW5kZXhPZihlbGVtZW50LnR5cGUpKTtcbn07XG4iLCJ2YXIgbmF0dXJhbFNlbGVjdGlvbiA9IHJlcXVpcmUoJ25hdHVyYWwtc2VsZWN0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWxlbWVudCwgdmFsdWUpe1xuICAgIHZhciBjYW5TZXQgPSBuYXR1cmFsU2VsZWN0aW9uKGVsZW1lbnQpICYmIGVsZW1lbnQgPT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICBpZiAoY2FuU2V0KSB7XG4gICAgICAgIHZhciBzdGFydCA9IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsXG4gICAgICAgICAgICBlbmQgPSBlbGVtZW50LnNlbGVjdGlvbkVuZDtcblxuICAgICAgICBlbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbn07XG4iXX0=
