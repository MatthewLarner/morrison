# morrison
Morrison protects your state by rejecting undesirable characters.

## Usage
```javascript
var morrison = require('morrison');

window.onload = function() {
    var settings = {
        validators: {
            '[data-validate=english]': /^[\x00-\x7F]+$/ // Don't allow any foreign characters in.
        }
    };

    morrison(settings);
};
```

Validator keys are element selectors and the value is a regex to restrict input.

Works for both keypress and paste.


```html
<input data-validate=english/>   <!-- Only allow english characters -->
```

## Example
npm run example
