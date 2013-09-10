/*global beforeEach:true, afterEach:true, describe:true */
"use strict";

var wd = require("yiewd")
    , _ = require("underscore")
    , path = require("path")
    , should = require("should")
    , monocle = require("monocle-js")
    , o_O = monocle.o_O
    , o_C = monocle.o_C
    , defaultHost = '127.0.0.1'
    , defaultPort = process.env.APPIUM_PORT || 4723
    , defaultCaps = {
        browserName: ''
        , device: 'iPhone Simulator'
        , platform: 'Mac'
        , version: '6.0'
        //, newCommandTimeout: 60
      };

var yiewdBlock = function(tests, host, port, caps, extraCaps) {
  host = (typeof host === "undefined" || host === null) ? _.clone(defaultHost) : host;
  port = (typeof port === "undefined" || port === null) ? _.clone(defaultPort) : port;
  caps = (typeof caps === "undefined" || caps === null) ? _.clone(defaultCaps) : caps;
  caps = _.extend(caps, typeof extraCaps === "undefined" ? {} : extraCaps);
  var driverHolder = {driver: null, sessionId: null};
  var expectConnError = extraCaps && extraCaps.expectConnError;

  beforeEach(function(done) {
    driverHolder.driver = wd.remote(host, port);
    driverHolder.driver.run(function*() {
      yield driverHolder.driver.init(caps);
      driverHolder.driver.sessionId = driverHolder.driver.sessionID;
      done();
    });
  });

  afterEach(function(done) {
    driverHolder.driver.run(function*() {
      yield driverHolder.driver.quit();
      done();
    });
  });

  tests(driverHolder);
};

var describeWithDriver = function(desc, tests, host, port, caps, extraCaps, timeout, onlyify) {
  var descFn;
  if (onlyify) {
    descFn = describe.only;
  } else {
    descFn = describe;
  }
  descFn(desc, function() {
    if (typeof timeout !== "undefined") {
      this.timeout(timeout);
    }
    yiewdBlock(tests, host, port, caps, extraCaps, onlyify);
  });
};

var describeForGappium = function(appPkg, appAct, appWaitAct) {
    var browserName, appPath, device, realDevice, appPath = null;

    // export env APPIUM_CORDOVA="android" to run tests against android version
    if (typeof process.env.APPIUM_CORDOVA !== "typeof" && process.env.APPIUM_CORDOVA === "android") {
        device = "selendroid";
        appPath = path.resolve(__dirname, "../../platforms/android/bin/" + appAct + "-debug.apk");
        
    } else {
        device = "ios";
        appPath = path.resolve(__dirname, "../../platforms/ios/build/" + appAct + ".app");
    }

    if (device === "ios") {
        realDevice = "iPhone Simulator";
        browserName = "iOS";
    } else if (device === "android") {
        browserName = realDevice = "Android";
    } else if (device === "selendroid") {
        browserName = realDevice = "Selendroid";
    } else if (device === "firefox" || device === "firefoxos") {
        browserName = realDevice = "Firefox";
    }

    return function(desc, tests, host, port, caps, extraCaps) {
        if (typeof extraCaps === "undefined") {
            extraCaps = {};
        }
        var newExtraCaps = {
            app: appPath,
            browserName: browserName,
            device: realDevice
        };
        if (typeof appPkg !== "undefined") {
            newExtraCaps['app-package'] = appPkg;
            newExtraCaps['app-activity'] = appAct;
            if (typeof appWaitAct !== "undefined") {
                newExtraCaps['app-wait-activity'] = appWaitAct;
            }
        }
        extraCaps = _.extend(extraCaps, newExtraCaps);
        return describeWithDriver(desc, tests, host, port, caps, extraCaps);
    };
};

var activateWebView = function(h) {
  // unify (ios vs selendroid) web view selection
  return function(done) {
    h.driver.run(function*() {
      try {
        var handles = null;
        try {
          handles = yield this.windowHandles();
        } catch (e) {
          yield this.sleep(2);
          handles = yield this.windowHandles();
        }
        for (var handle in handles) {
          var hdl = handles[handle];
          if (hdl.indexOf('WEBVIEW') > -1) {
            yield this.window(hdl);
            return done();
          }
        }

        yield this.window(handles[0]);
      } catch (e) {
        return done(e);
      };
      return done();
    });
  };
};

var nativeSequence = o_O(function*(h, seq) {
    var deactivateWebView = o_O(function*() {
        var handles = yield h.driver.windowHandles();
        var hdl = handles[handle];
        for (var handle in handles) {
          var hdl = handles[handle];
          if (hdl.indexOf('NATIVE') > -1) {
            yield h.driver.window(hdl);
            return;
          }
        }

        yield h.driver.execute("mobile: leaveWebView");
    });

    try {
        yield deactivateWebView();

        yield o_O(seq)();

        var cb = o_C();
        activateWebView(h)(cb);
        yield cb;
    } catch(e) {
        throw e;
    }
});

var yiewdIt = function(desc, gnrtr) {
    it(desc, function(done) {
        var res = monocle.run(function*() {
            try {
                yield o_O(gnrtr)();
            } catch (e) {
                return done(e);
            }
            return done();
        });
    });
};

module.exports.describeForGappium = describeForGappium;
module.exports.activateWebView = activateWebView;
module.exports.yiewdIt = yiewdIt;
module.exports.nativeSequence = nativeSequence;
