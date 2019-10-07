var browserConfig = require('./browserconfig.js');
var baseKarmaConfigSetter = require('./karma.conf.js')

var karmaConfig = function(config) {
  let originalConfig;
  baseKarmaConfigSetter({
      set: (configObj) => {
        originalConfig = configObj
    }
  });
  config.set(Object.assign(originalConfig, {
    singleRun: true,
    browserNoActivityTimeout: 400000,
    browserDisconnectTolerance: 1,
    browserDisconnectTimeout: 10000, // ms
    reporters: ['dots', 'BrowserStack'],
    browsers: Object.keys(browserConfig.browserstack.envs),
    browserStack: {
      username: browserConfig.browserstack.user,
      accessKey: browserConfig.browserstack.key,
      build: 'MiniIframeRPC build',
      name: 'MiniIframeRPC',
      project: 'MiniIframeRPC',
    },
    customLaunchers: browserConfig.browserstack.envs,
  }));
};

module.exports = karmaConfig;
