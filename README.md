# morrison
Morrison protects your state by rejecting undesirable characters.

![morrison](http://newsroom.unsw.edu.au/sites/default/files/styles/full_width/public/thumbnails/image/scott_morrison_outburst_1_4_1.jpg?itok=bO00uSkk "Title")


## Usage
```javascript
var morrison = require('morrison');

window.onload = function() {
    var settings = {
        validators: {
            '[data-validate=number]': /^\d*$|^\d*\.$|^\d*\.\d+$/,
            '[data-validate=integer]': /^\d*$/,
            '[data-validate=foo]': /^f$|^fo$|^foo$/
        }
    };

    morrison(settings);
};
```

Validator keys are element selectors and the value is a regex to restrict input.

Works for both keypress and paste.



```html
<input data-validate=number/>   <!-- Only allow numbers -->
<input data-validate=integer/>  <!-- Only allow integers -->
<input data-validate=foo/>      <!-- Only allow foo -->
```

## Example
npm run example
