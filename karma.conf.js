// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/moment/moment.js',
      'src/index.js',
      'test/*.spec.js',
      'templates/*.html'
    ],
    exclude: [],

    preprocessors: {
      'src/index.js': ['webpack'],
      'templates/*.html': ['ng-html2js']
    },

    webpack: {
      externals: {
        angular: 'angular',
        moment: 'moment'
      },
      module: {},
      devtool: 'inline-source-map'
    },
    webpackMiddleware: {
      stats: 'minimal'
    },

    ngHtml2JsPreprocessor: {
      moduleName: 'templates'
    },

    reporters: ['progress', 'coverage'],
    port: 8080,
    logLevel: config.LOG_DEBUG,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true
  })
}
