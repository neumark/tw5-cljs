/*eslint camelcase: 0*/

/* Browserstack valid configurations:
 *      https://www.browserstack.com/automate/capabilities
 *      https://www.browserstack.com/app-automate/capabilities#test-configuration-capabilities
 * Browser version histories: 
 * Chrome: https://en.wikipedia.org/wiki/Google_Chrome_version_history
 * Safari: https://en.wikipedia.org/wiki/Safari_version_history
 */

const ALL = {
      samsungGalaxyS5: {
        base: 'BrowserStack',
        os: 'android',
        os_version: '4.4',
        browser: 'android',
        device: 'Samsung Galaxy S5',
      },
      iphone_x: {
        base: 'BrowserStack',
        device: 'iPhone X',
        os: 'ios',
        os_version: '11.0',
        supported: true
      },
      firefox_65_windows: {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: '65.0',
        os: 'Windows',
        os_version: '10',
        supported: true
      },
      chrome_56_osx: {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: '56.0',
        os: 'OS X',
        os_version: 'Sierra',
      },
      chrome_65_osx: { // oldest version which works, released 2018-3-6
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: '65.0',
        os: 'OS X',
        os_version: 'Sierra', // Also verified with Mojave
        supported: true
      },
      safari_12_osx: {
        base: 'BrowserStack',
        browser: 'Safari',
        browser_version: '12.0',
        os: 'OS X',
        os_version: 'Mojave',
        supported: true
      },
      ie_14_windows: {
        base: 'BrowserStack',
        os: 'Windows',
        os_version: '10',
        browser: 'Edge',
        browser_version: '18.0',
        supported: true
      },
      ie_11_windows: {
        base: 'BrowserStack',
        os: 'Windows',
        os_version: '10',
        browser: 'IE',
        browser_version: '11.0',
        supported: true
      },
      firefox_52_windows: {
        base: 'BrowserStack',
        os: 'Windows',
        os_version: '10',
        browser: 'Firefox',
        browser_version: '52.0',
      },
      chrome_53_windows: {
        base: 'BrowserStack',
        os: 'Windows',
        os_version: '10',
        browser: 'Chrome',
        browser_version: '53.0',
      }
};

const filter = (predicate) => {
    const result = {};
    Object.keys(ALL).forEach((key) => {
        const value = ALL[key];
        if (predicate(value)) {
            result[key] = value;
        }
    });
    return result;
};

const ENVS = {
    ALL,
    SUPPORTED: filter(x => x.supported),
    OSX: filter(x => x.os === 'OS X'),
    WINDOWS: filter(x => x.os === 'Windows'),
    FIREFOX: filter(x => x.browser === 'Firefox'),
    MSIE: filter(x => x.browser === 'IE'),
    EDGE: filter(x => x.browser === 'Edge'),
    IPHONE: filter(x => x.os === 'ios'),
    ANDROID: filter(x => x.os === 'android')
};

const browserConfig =  {
  browserstack: {
    user: process.env.BROWSERSTACK_USER,
    key: process.env.BROWSERSTACK_KEY,
    envs: (process.env.BROWSERSTACK_ENVS && ENVS[process.env.BROWSERSTACK_ENVS]) ? ENVS[process.env.BROWSERSTACK_ENVS] : ENVS['SUPPORTED']}
};

module.exports = browserConfig;
