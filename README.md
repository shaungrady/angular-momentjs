Angular Moment.js Module
================

An AngularJS module to add Moment.js functionality to Angular. No jQuery necessary!

## Features at a Glance
* `$moment` service for configuring module-wide settings, such as the default model and view date formats.
* `input[type=moment]` directive for validating dates and translating date formats from the view to the model and back. Additionally, the directive adds support for specifying a `min` and `max` date as well as stepping dates with your mouse wheel or keyboard (up, down, plus, or minus). 

More features are planned, including a suite of filters and a date picker.

## Requirements
* [Moment.js] [1] (v2.5.0+)
* [AngularJS] [2] (v1.2.0+)

[1]: http://momentjs.com/
[2]: http://angularjs.org/

## Installing
After including the module script on your page, declare `angular-momentjs` as a dependency:
```
angular.module('myApp', ['angular-momentjs']);
```

## Usage

### Directive
``` html
<input type="moment"
       ng-model="{string}"
       [format="{string}"]
       [model-format="{string}"]
       [view-format="{string}"]
       [min="{expression}"]
       [max="{expression}"]
       [step="{string}"]>
</input>
```

#### Parameters

| Param                    | Type        | Default | Details |
| ---                      | ---         | ---     | ---     |
| format *(optional)*      | String      | &mdash; | Specify a single Moment format for both the model and view values. Overridden if `modelFormat` or `viewFormat` is set. Sets `date` validation error key if the date is invalid. |
| modelFormat *(optional)* | String      | `$moment.$defaultModelFormat` | Specify a Moment format for the model value. Sets `date` validation error key if the model date is invalid. |
| viewFormat *(optional)*  | String      | `$moment.$defaultViewFormat`  | Specify a Moment format for the view value. Sets `date` validation error key if the view date is invalid. |
| min *(optional)*         | Expression  | &mdash; | Sets `min` validation error key if the date value is before the `min` date. Expected value is a date string or an array of a date string and a Moment format to parse it with. |
| max *(optional)*         | Expression  | &mdash; | Sets `max` validation error key if the date value is after the `max` date. Expected value is a date string or an array of a date string and a Moment format to parse it with. |
| step *(optional)*        | String      | `1 day` | Specify a quantity and a unit of time to step the date by on mouse wheel up/down, up/down arrow keys, or plus/minus keys. Pressing shift causes the date to step by one greater or lesser unit of time. |

Note that all parameters can be bound data-bound and dynamic. If `modelFormat` is changed, the view value will be reparsed to provide the new format for the model value, and conversely if `viewFormat` is changed.



