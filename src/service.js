import angular from 'angular'
import moment from 'moment'

export default function $momentProvider () {
  // Strict parsing has trouble in Moment.js v2.3—2.5 with short tokens
  // E.g. 1-31-2000, M-D-YYYY is invalid.
  var config = {
    $$pickerTemplates: {},
    $strictView: true,
    $strictModel: true,
    $defaultViewFormat: 'L',
    $defaultModelFormat: moment.defaultFormat,
    $parseFormat: $parseFormat
  }

  // For parsing locale-dependent date formats (L, LL, etc.)
  function $parseFormat (format) {
    format = format || ''
    if (format.match(/l/i)) { return moment().lang()._longDateFormat[format] || format }
    return format
  }

  this.defaultViewFormat = function (format) {
    if (angular.isString(format)) { config.$defaultViewFormat = format }
    return this
  }

  this.defaultModelFormat = function (format) {
    if (angular.isString(format)) { config.$defaultModelFormat = format }
    return this
  }

  this.strictView = function (bool) {
    if (typeof bool === 'boolean') { config.$strictView = bool }
    return this
  }

  this.strictModel = function (bool) {
    if (typeof bool === 'boolean') { config.$strictModel = bool }
    return this
  }

  this.definePickerTemplate = function (template) {
    if (angular.isObject(template) && template.name && template.url) {
      config.$$pickerTemplates[template.name] = {
        url: template.url,
        unit: template.unit || 'days'
      }
    }
    return this
  }

  this.$get = function () {
    if (angular.isDefined(moment.$strictView)) { return moment }
    try {
      Object.defineProperty(moment, '$strictView', {
        value: config.$strictView
      })
      Object.defineProperty(moment, '$strictModel', {
        value: config.$strictModel
      })
      Object.defineProperty(moment, '$defaultViewFormat', {
        value: config.$defaultViewFormat
      })
      Object.defineProperty(moment, '$defaultModelFormat', {
        value: config.$defaultModelFormat
      })
      Object.defineProperty(moment, '$parseFormat', {
        value: config.$parseFormat
      })
      Object.defineProperty(moment, '$$pickerTemplates', {
        value: angular.copy(config.$$pickerTemplates),
        writable: true
      })
    } catch (err) { angular.extend(moment, config) }
    return moment
  }
}
