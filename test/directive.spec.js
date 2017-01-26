/* global beforeEach, afterEach, describe, it, inject, expect, module, spyOn, moment, angular */
describe('$moment', function () {
  'use strict'

    // So we don't have to worry about timezones for test runner's machine
  moment.defaultFormat = 'X'

  var $moment, $scope, $compile, $timeout, compile

  var momentInput = '<input type="moment" ng-model="date">'
  var momentInputWithPlaceholder = '<input placeholder="hi" type="moment" ng-model="date">'
  var momentInputFormat = '<input type="moment" ng-model="date" format="dateFormat">'
  var momentInputViewModelFormat = '<input type="moment" ng-model="date" view-format="dateViewFormat" model-format="dateModelFormat">'
  var momentInputMinMax = '<input type="moment" ng-model="date" min="dateMin" max="dateMax">'
  var momentInputStep = '<input type="moment" ng-model="date" step="dateStep">'

  var dateFormat1 = 'MM-DD-YYYY'
  // var dateFormat2 = 'YYYY-MM-DD'
  // var dateFormat3 = 'MM-YYYY-DD'
  // var monthFormat = 'MM-YYYY'

  var viewDate = '01/31/1986'
  var modelDate = '507542400'

  var todayModel = moment().format('X')
  var tomorrowModel = moment().add(1, 'day').format('X')
  var yesterdayModel = moment().subtract(1, 'day').format('X')

  var modelDateLowest = '307542400'
  var modelDateLower = '407542400'
  var modelDateHigher = '607542400'
  var modelDateHighest = '707542400'

  var viewDateLowest = '09/30/1979'
  var viewDateLower = '11/30/1982'
  var viewDateHigher = '04/02/1989'
  var viewDateHighest = '06/02/1992'

  var wheelUpEvent = ['mousewheel', { type: 'wheel', wheelDelta: 120, which: 1 }]
  var wheelDownEvent = ['mousewheel', { type: 'wheel', wheelDelta: -120, which: 1 }]
  var upKeyEvent = ['keydown', { type: 'keydown', which: 38 }]
  var downKeyEvent = ['keydown', { type: 'keydown', which: 40 }]

  beforeEach(angular.mock.module('$moment'))
  beforeEach(inject(function (_$moment_, _$rootScope_, _$compile_, _$timeout_) {
    $moment = _$moment_
    $scope = _$rootScope_.$new()
    $compile = _$compile_
    $timeout = _$timeout_
    compile = function (markup) {
      var elem = $compile(markup)($scope)
      $scope.$digest()
      return elem
    }
  }))

  describe('input directive', function () {
    it('should initialize only on inputs with an ngModelController', function () {
      var plainInput = compile('<input type="moment">')
      var momentInput = compile('<input type="moment" ng-model="date">')
      $scope.$apply("dateFormat = '" + modelDate + "'")
      expect(plainInput.attr('class').split(' ')).not.toContain('ng-valid-date')
      expect(momentInput.attr('class').split(' ')).toContain('ng-valid-date')
    })

    it('should set the placeholder value to match the view\'s format', function () {
      $scope.$apply("dateFormat = '" + dateFormat1 + "'")
      var input = compile(momentInput)
      expect(input.attr('placeholder')).toBe('MM/DD/YYYY')
    })

    it('should change the placeholder value to match a dynamic format', function () {
      var input = compile(momentInputFormat)
      $scope.$apply("dateFormat = '" + dateFormat1 + "'")
      expect(input.attr('placeholder')).toBe(dateFormat1)
    })

    it('should not change existing placeholder value', function () {
      var input = compile(momentInputWithPlaceholder)
      $scope.$apply("dateFormat = '" + dateFormat1 + "'")
      expect(input.attr('placeholder')).toBe('hi')
    })

    it('should format a model date for the view', function () {
      var input = compile(momentInput)
      $scope.$apply("date = '" + modelDate + "'")
      expect(input.val()).toBe(viewDate)
    })

    it('should format a view date for the model', function () {
      var input = compile(momentInput)
      var ctrl = input.controller('ngModel')
      ctrl.$setViewValue(viewDate)
      expect($scope.date).toBe(modelDate)
    })

    it('should invalidate an invalid view date', function () {
      var input = compile(momentInput)
      var ctrl = input.controller('ngModel')

      ctrl.$setViewValue('Purple monkey dishwasher')
      expect(ctrl.$error.date).toBe(true)
      expect($scope.date).toBeFalsy()

      ctrl.$setViewValue('01/32/1986')
      expect(ctrl.$error.date).toBe(true)
      expect($scope.date).toBeFalsy()
    })

    it('should reformat view/model based on view- and model-format attrs', function () {
      var input = compile(momentInputViewModelFormat)

        // Flip default view and model formats
      $scope.$apply("dateModelFormat = 'L'")
      $scope.$apply("dateViewFormat  = 'X'")
      $scope.$apply("date = '" + viewDate + "'")
      expect($scope.date).toBe(viewDate)
      expect(input.val()).toBe(modelDate)

        // Reset view format to default
      $scope.$apply("dateViewFormat = 'L'")
      $timeout.flush()
      expect(input.val()).toBe(viewDate)

        // Reset model format to default
      $scope.$apply("dateModelFormat = 'X'")
      expect($scope.date).toBe(modelDate)
    })

    it('should format the model if initialized after model is defined', function () {
      $scope.$apply("dateModelFormat = 'L'")
      $scope.$apply("dateViewFormat  = 'X'")
      $scope.$apply("date = '" + viewDate + "'")

      var input = compile(momentInputViewModelFormat)

      expect($scope.date).toBe(viewDate)
      expect(input.val()).toBe(modelDate)
    })

      // Model-side min/max tests

    it('should validate the model against min and max string values', function () {
      var input = compile(momentInputMinMax)
      var ctrl = input.controller('ngModel')

      $scope.$apply("date    = '" + modelDate + "'")
      $scope.$apply("dateMin = '" + modelDateLower + "'")
      $scope.$apply("dateMax = '" + modelDateHigher + "'")

      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBeFalsy()
      expect(input.val()).toBe(viewDate)

      $scope.$apply("date = '" + modelDateLowest + "'")
      expect(ctrl.$error.min).toBe(true)
      expect(ctrl.$error.max).toBeFalsy()
      expect(input.val()).toBe('')

      $scope.$apply("date = '" + modelDateHighest + "'")
      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBe(true)
      expect(input.val()).toBe('')

      $scope.$apply("date = '" + modelDate + "'")
      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBeFalsy()
      expect(input.val()).toBe(viewDate)
    })

    it('should validate the model against min/max if compiled after model is set', function () {
      $scope.$apply("date = '" + modelDateHighest + "'")
      $scope.$apply("dateMin = '" + modelDateLower + "'")
      $scope.$apply("dateMax = '" + modelDateHigher + "'")

      var input = compile(momentInputMinMax)
      var ctrl = input.controller('ngModel')

      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBe(true)
      expect(input.val()).toBe('')
      expect($scope.date).toBe(modelDateHighest)
    })

    it('should validate the model against min and max array values', function () {
      var input = compile(momentInputMinMax)
      var ctrl = input.controller('ngModel')

      $scope.$apply("date    = '" + modelDate + "'")
      $scope.$apply("dateMin = ['" + viewDateLower + "', 'MM-DD-YYYY'] ")
      $scope.$apply("dateMax = ['" + viewDateHigher + "', 'MM-DD-YYYY'] ")

      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBeFalsy()
      expect(input.val()).toBe(viewDate)

      $scope.$apply("date = '" + modelDateLowest + "'")
      expect(ctrl.$error.min).toBe(true)
      expect(ctrl.$error.max).toBeFalsy()
      expect(input.val()).toBe('')

      $scope.$apply("date = '" + modelDateHighest + "'")
      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBe(true)
      expect(input.val()).toBe('')

      $scope.$apply("date = '" + modelDate + "'")
      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBeFalsy()
      expect(input.val()).toBe(viewDate)
    })

      // View-side min/max tests

    it('should validate the view against min and max string values', function () {
      var input = compile(momentInputMinMax)
      var ctrl = input.controller('ngModel')

      $scope.$apply("dateMin = '" + modelDateLower + "'")
      $scope.$apply("dateMax = '" + modelDateHigher + "'")

      ctrl.$setViewValue(viewDateLowest)
      expect(ctrl.$error.min).toBe(true)
      expect(ctrl.$error.max).toBeFalsy()
      expect($scope.date).toBeFalsy()

      ctrl.$setViewValue(viewDateHighest)
      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBe(true)
      expect($scope.date).toBeFalsy()
    })

    it('should validate the view against min and max array values', function () {
      var input = compile(momentInputMinMax)
      var ctrl = input.controller('ngModel')

      $scope.$apply("dateMin = ['" + viewDateLower + "', 'MM-DD-YYYY'] ")
      $scope.$apply("dateMax = ['" + viewDateHigher + "', 'MM-DD-YYYY'] ")

      ctrl.$setViewValue(viewDateLowest)
      expect(ctrl.$error.min).toBe(true)
      expect(ctrl.$error.max).toBeFalsy()
      expect($scope.date).toBeFalsy()

      ctrl.$setViewValue(viewDateHighest)
      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBe(true)
      expect($scope.date).toBeFalsy()
    })

    it('should accept "today" keyword for min and max attrs', function () {
      var input = compile(momentInputMinMax)
      var ctrl = input.controller('ngModel')

      $scope.$apply("date    = '" + todayModel + "'")
      $scope.$apply("dateMin = 'today'")
      $scope.$apply("dateMax = 'today'")

      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBeFalsy()

      $scope.$apply("date = '" + yesterdayModel + "'")
      expect(ctrl.$error.min).toBe(true)
      expect(ctrl.$error.max).toBeFalsy()

      $scope.$apply("date = '" + tomorrowModel + "'")
      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBe(true)
    })

      // End view-size min/max tests

    it('should revalidate when min/max values change', function () {
      var input = compile(momentInputMinMax)
      var ctrl = input.controller('ngModel')

      $scope.$apply("date    = '" + modelDate + "'")
      $scope.$apply("dateMin = '" + modelDateLower + "'")
      $scope.$apply("dateMax = '" + modelDateHigher + "'")

      $scope.$apply("dateMin = '" + modelDateLowest + "'")
      $scope.$apply("dateMax = '" + modelDateLower + "'")

      $timeout.flush()
      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBe(true)
      expect(ctrl.$viewValue).toBeFalsy()

      $scope.$apply("dateMin = '" + modelDateHigher + "'")
      $scope.$apply("dateMax = '" + modelDateHighest + "'")

      $timeout.flush()
      expect(ctrl.$error.min).toBe(true)
      expect(ctrl.$error.max).toBeFalsy()
      expect(ctrl.$viewValue).toBeFalsy()

      $scope.$apply("dateMin = '" + modelDateLower + "'")
      $scope.$apply("dateMax = '" + modelDateHigher + "'")

      $timeout.flush()
      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBeFalsy()
      expect(ctrl.$viewValue).toBe(viewDate)
    })

    it('should revalidate when min/max and model values change', function () {
      var input = compile(momentInputMinMax)
      var ctrl = input.controller('ngModel')

      $scope.$apply("date    = '" + modelDateHigher + "'")
      $scope.$apply("dateMin = '" + modelDate + "'")
      $scope.$apply("dateMax = '" + modelDateHighest + "'")

      $scope.$apply(function () {
        $scope.date = modelDateLower
        $scope.dateMin = modelDateLowest
        $scope.dateMax = modelDate
      })

      $timeout.flush()

      expect(ctrl.$error.min).toBeFalsy()
      expect(ctrl.$error.max).toBeFalsy()
    })

      // Stepping

    it('should set value to today\'s date on up or down arrow keys, or mousewheel', function () {
      var input = compile(momentInput)
      var today = $moment().format('L')

      input.triggerHandler.apply(input, wheelUpEvent)
      expect(input.val()).toBe(today)

      $scope.$apply('date = undefined')
      input.triggerHandler.apply(input, wheelDownEvent)
      expect(input.val()).toBe(today)

      $scope.$apply('date = undefined')
      input.triggerHandler.apply(input, upKeyEvent)
      expect(input.val()).toBe(today)

      $scope.$apply('date = undefined')
      input.triggerHandler.apply(input, downKeyEvent)
      expect(input.val()).toBe(today)
    })

    it('should step by one day with a value', function () {
      var input = compile(momentInput)
      var ctrl = input.controller('ngModel')
      var today = $moment().format('L')
      var tomorrow = $moment().add(1, 'day').format('L')
      var yesterday = $moment().subtract(1, 'day').format('L')

      ctrl.$setViewValue(today)
      input.triggerHandler.apply(input, wheelUpEvent)
      expect(ctrl.$viewValue).toBe(tomorrow)

      input.triggerHandler.apply(input, downKeyEvent)
      input.triggerHandler.apply(input, downKeyEvent)
      expect(ctrl.$viewValue).toBe(yesterday)
    })

    it('should not step if readonly attribute exists', function () {
      var input = compile('<input type="moment" ng-model="date" readonly>')
      var ctrl = input.controller('ngModel')
      var today = $moment().format('L')
      // var tomorrow = $moment().add(1, 'day').format('L')
      // var yesterday = $moment().subtract(1, 'day').format('L')

      ctrl.$setViewValue(today)
      input.triggerHandler.apply(input, wheelUpEvent)
      expect(ctrl.$viewValue).toBe(today)
    })

    it('should step by one month if shift key is pressed', function () {
      var input = compile(momentInput)
      var ctrl = input.controller('ngModel')
      var monthStart = $moment().startOf('month').format('L')
      var nextMonth = $moment().startOf('month').add(1, 'month').format('L')
      var wheelUpShiftEvent = angular.copy(wheelUpEvent)
      var wheelDownShiftEvent = angular.copy(wheelDownEvent)

      wheelUpShiftEvent[1].shiftKey = true
      wheelDownShiftEvent[1].shiftKey = true

      ctrl.$setViewValue(monthStart)
      input.triggerHandler.apply(input, wheelUpShiftEvent)
      expect(ctrl.$viewValue).toBe(nextMonth)

      input.triggerHandler.apply(input, wheelDownShiftEvent)
      expect(ctrl.$viewValue).toBe(monthStart)
    })

    it('should not step if input view value is invalid', function () {
      var input = compile(momentInput)
      var ctrl = input.controller('ngModel')

      ctrl.$setViewValue('Purple monkey dishwasher')
      input.triggerHandler.apply(input, wheelUpEvent)
      expect(ctrl.$viewValue).toBe('Purple monkey dishwasher')
      expect($scope.date).toBeFalsy()
    })

    it('should not step if keydown event key isn\'t up, down, plus, or minus', function () {
      var input = compile(momentInput)
      var ctrl = input.controller('ngModel')
      var badKeyEvent = angular.copy(upKeyEvent)
      badKeyEvent[1].which = 39

      input.triggerHandler.apply(input, badKeyEvent)
      expect(ctrl.$viewValue).toBeFalsy()
      expect($scope.date).toBeFalsy()
    })

    it('should begin stepping at min when specified', function () {
      var input = compile(momentInputMinMax)
      var ctrl = input.controller('ngModel')

      $scope.$apply("dateMin = '" + modelDateLower + "'")
      $scope.$apply("dateMax = '" + modelDateHigher + "'")

      input.triggerHandler.apply(input, downKeyEvent)
      expect(ctrl.$viewValue).toBe(viewDateLower)

      $scope.$apply('date = undefined')
      input.triggerHandler.apply(input, upKeyEvent)
      expect(ctrl.$viewValue).toBe(viewDateLower)
    })

    it('should not allow stepping out of min/max bounds', function () {
      var input = compile(momentInputMinMax)
      var ctrl = input.controller('ngModel')

      $scope.$apply("date    = '" + modelDateLower + "'")
      $scope.$apply("dateMin = '" + modelDateLower + "'")
      $scope.$apply("dateMax = '" + modelDateHigher + "'")

      input.triggerHandler.apply(input, downKeyEvent)
      expect(ctrl.$viewValue).toBe(viewDateLower)

      $scope.$apply("date = '" + modelDateHigher + "'")
      input.triggerHandler.apply(input, upKeyEvent)
      expect(ctrl.$viewValue).toBe(viewDateHigher)
    })

    it('should step out-of-bounds date to within min and max bounds when inc. and dec., respectively', function () {
      var input = compile(momentInputMinMax)
      var ctrl = input.controller('ngModel')

      $scope.$apply("dateMin = '" + modelDateLower + "'")
      $scope.$apply("dateMax = '" + modelDateHigher + "'")

      ctrl.$setViewValue(viewDateLowest)
      input.triggerHandler.apply(input, upKeyEvent)
      expect(ctrl.$viewValue).toBe(viewDateLower)

      ctrl.$setViewValue(viewDateHighest)
      input.triggerHandler.apply(input, downKeyEvent)
      expect(ctrl.$viewValue).toBe(viewDateHigher)
    })

    it('should respect the step attribute and ignore pluralization of unit', function () {
      var input = compile(momentInputStep)
      var ctrl = input.controller('ngModel')
      var jan1 = $moment('01/01/2000').format('L')
      var feb1 = $moment('01/01/2000').add(1, 'month').format('L')

      ctrl.$setViewValue(jan1)

      $scope.$apply("dateStep = '1 month'")
      input.triggerHandler.apply(input, upKeyEvent)
      expect(ctrl.$viewValue).toBe(feb1)

      $scope.$apply("dateStep = '1 months'")
      input.triggerHandler.apply(input, downKeyEvent)
      expect(ctrl.$viewValue).toBe(jan1)
    })

    it('should fall back to default stepping if step attribute is invalid', function () {
      var input = compile(momentInputStep)
      var ctrl = input.controller('ngModel')
      var today = $moment().format('L')
      var tomorrow = $moment().add(1, 'day').format('L')

      input.triggerHandler.apply(input, upKeyEvent)
      $scope.$apply("dateStep = 'month 1'")

      input.triggerHandler.apply(input, upKeyEvent)
      expect(ctrl.$viewValue).toBe(tomorrow)

      $scope.$apply("dateStep = 'Purple monkey dishwasher'")
      input.triggerHandler.apply(input, downKeyEvent)
      expect(ctrl.$viewValue).toBe(today)
    })
  })
})
