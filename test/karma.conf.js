module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: ['jasmine'],
    port: 9876,
    colors: true,
    singleRun: true,
    reporters: ['mocha'],
    files: [
      '*.spec.js',
      '*.spec.ts',
      {pattern: 'iframe.js', included: false, watched: true},
      {pattern: '*.html', included: false, watched: false}
    ],
    proxies: {
        "/app/": '/base/app/'
    },
    preprocessors: {
      '*.spec.js': ['webpack'],
      '*.spec.ts': ['webpack'],
      'iframe.js': ['webpack']
    },
    webpack: webpackConfig,
    browsers: ['Chrome'],
    customLaunchers: {
      'Chrome_Desktop' : {
        base: 'Chrome',
        options: {
          viewportSize: {
            width: 1000,
            height: 1000,
          },
        },
      },
    },
  });
};
