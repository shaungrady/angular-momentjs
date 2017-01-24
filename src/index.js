import angular from 'angular'

import service from './service'
import filter from './filter'
import inputDirective from './directive_input'
import inputPickerDirective from './directive_inputPicker'
import pickerDirective from './directive_picker'

export default angular
  .module('$moment', [])
  .provider('$moment', service)
  .filter('momentFormat', filter)
  .directive('input', inputDirective)
  .directive('inputPicker', inputPickerDirective)
  .directive('momentPicker', pickerDirective)
  .name
