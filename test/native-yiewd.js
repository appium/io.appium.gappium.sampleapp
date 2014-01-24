/*global beforeEach:true, afterEach:true, describe:true */

var yiewdBlock = require("./helpers/yiewdblock")
  , wd = require("yiewd")
  , nativeSeq = yiewdBlock.nativeSequence
  , should = require("should")
  , path = require("path")
  , monocle = require("monocle-js")
  , o_O = monocle.o_O
  , o_C = monocle.o_C
  , ts = (new Date()).getTime() - 1389223500000
  , _ = require("underscore")
  , appPkg = "io.appium.gappium.sampleapp"
  , appAct = "HelloGappium"
  , delay = 0.5
  , tests = []
  , defaultCaps = {
      browserName: ''
    , device: 'iPhone Simulator'
    , platform: 'Mac'
    , version: '6.0'
    }
  ;

var getCaps = function(tgt) {
    var version, platform, testName, webviewSupport, browserName, appPath, device, realDevice, appPath = null;
    var extraCaps = {};
    var env = typeof process.env.APPIUM_CORDOVA !== "undefined" ? process.env.APPIUM_CORDOVA : 'ios';
    if (typeof tgt !== "undefined") {
      env = tgt;
    }

    // export env APPIUM_CORDOVA="android" to run tests against android version
    if (env === "android") {
        device = "selendroid";
        appPath = "/Users/Sebastian/dev/src/js/gappium/src/io.appium.gappium.sampleapp/platforms/android/bin/HelloGappium-debug.apk"
        appPath = "sauce-storage:HelloGappium-debug.apk.zip";
        testName = "Gappium Android";
    } else {
        device = "ios";
        appPath = "/Users/Sebastian/dev/src/js/gappium/src/io.appium.gappium.sampleapp/platforms/ios/build/HelloGappium.app";
        appPath = "sauce-storage:HelloGappium.zip";
        testName = "Gappium iOS";
    }

    if (device === "ios") {
        device = realDevice = "iPhone Simulator";
        browserName = "iOS";
        platform = 'Mac'
        version = '6.0'
    } else if (device === "android") {
        browserName = realDevice = "Android";
    } else if (device === "selendroid") {
        browserName = realDevice = "Android";
        webviewSupport = true;
        platform = "linux";
        version = "4.2";
    } else if (device === "firefox" || device === "firefoxos") {
        browserName = realDevice = "Firefox";
    }

    var newExtraCaps = {
        name: testName,
        app: appPath,
        browserName: browserName,
        device: realDevice,
        webviewSupport: webviewSupport,
        build: ts,
        platform: platform,
        version: version
    };

    if (typeof appPkg !== "undefined") {
        newExtraCaps['app-package'] = appPkg;
        newExtraCaps['app-activity'] = "." + appAct;
        if (typeof appWaitAct !== "undefined") {
            newExtraCaps['app-wait-activity'] = appWaitAct;
        }
    }

    extraCaps = _.extend(extraCaps, newExtraCaps);
    return extraCaps;
};

var activateWebView = o_O(function*(helper) {
  var handles = null;
  try {
    handles = yield helper.driver.windowHandles();
  } catch (e) {
    yield helper.driver.sleep(10);
    handles = yield helper.driver.windowHandles();
  }
  for (var handle in handles) {
    var hdl = handles[handle];
    if (hdl.indexOf('WEBVIEW') > -1) {
      yield helper.driver.window(hdl);
      return;
    }
  }

  yield helper.driver.window(handles[0]);
});

var addTest = function(name, test) {
  var newTest = function(target) {
    return o_O(function*() {
      var caps = getCaps(target);
          caps['name'] = name;
      //console.log("Running " + name);
      var helper = { caps: caps, driver: wd.remote('ondemand.saucelabs.com', 80, process.env.SAUCE_USERNAME, process.env.SAUCE_ACCESS_KEY) };

      var newFnc = o_O(function*() {
        yield helper.driver.init(helper.caps);
        try {
          yield activateWebView(helper);
          yield o_O(test)(helper);
        } catch(e) {
          console.log(e);
        }
        yield helper.driver.quit();
      });

      yield newFnc();
    });
  };

  tests.push(newTest('android'));
  tests.push(newTest('ios'));
};

addTest("HomeView should display as initial view", function*(h) {
    yield h.driver.sleep(delay);

    var h1 = yield h.driver.elementByCssSelector('.topcoat-navigation-bar h1');
    should.exist(h1);

    var val = yield h1.text();
    val.should.equal("Employee Directory");
});

addTest("HomeView should allow to search for employees", function*(h) {
    yield h.driver.sleep(delay);

    var el = yield h.driver.elementByCssSelector('.search-key');
    should.exist(el);
    yield h.driver.sleep(delay);

    yield el.sendKeys('james');
    yield h.driver.sleep(delay);
});

addTest("HomeView should find five emplyoees for the letter j", function*(h) {
    yield h.driver.sleep(delay);

    var el = yield h.driver.elementByCssSelector('.search-key');
    should.exist(el);
    yield h.driver.sleep(delay);

    yield el.sendKeys('j');
    yield h.driver.sleep(delay);

    var employees = yield h.driver.elementsByCssSelector('.topcoat-list a');
    employees.length.should.equal(5);
});

addTest("HomeView should scroll down list of employees", function*(h) {
    yield h.driver.sleep(delay);

    var el = yield h.driver.elementByCssSelector('.search-key');
    should.exist(el);
    yield h.driver.sleep(delay);

    yield el.sendKeys(' ');
    yield h.driver.sleep(delay);

    yield nativeSeq(h, function*() {
        yield h.driver.flick(50, -180);
        yield h.driver.sleep(delay);
    });
});

var dismiss = o_O(function*(driver) {
    try {
        yield driver.acceptAlert();
    } catch (e) {
        var button = yield driver.elementById('button1');
        yield button.click();
    }
});

var getNames = o_O(function*(people) {
    var names = [];
    for (var report in people) {
        if (typeof report !== "string") {
            continue;
        }
        var name = yield people[report].text();
        names.push(name.split("\n")[0]);
    };

    return names;
});

addTest("EmployeeView should select James King and check his direct reports", function*(h) {
    yield h.driver.sleep(delay);

    var el = yield h.driver.elementByCssSelector('.search-key');
    should.exist(el);
    yield h.driver.sleep(delay);

    yield el.sendKeys("James King");
    yield h.driver.sleep(delay);

    var employees = yield h.driver.elementsByCssSelector('.topcoat-list a');
    employees.length.should.equal(1);
    yield h.driver.sleep(delay);

    yield employees[0].click();
    yield h.driver.sleep(delay);

    var option = yield h.driver.elementByPartialLinkText("View Direct Reports");
    yield option.click();
    yield h.driver.sleep(delay);

    var reports = yield h.driver.elementsByCssSelector('.topcoat-list a');
    reports.length.should.equal(4);
    yield h.driver.sleep(delay);

    var names = yield getNames(reports);
    var isect = _.intersection(names,
       ['Julie Taylor',
        'Eugene Lee',
        'John Williams',
        'Ray Moore']);
    isect.should.have.length(4);
    yield h.driver.sleep(delay);
});

addTest("EmployeeView should open location map and dismiss modal dialog", function*(h) {
    yield h.driver.sleep(delay);

    var el = yield h.driver.elementByCssSelector('.search-key');
    should.exist(el);
    yield h.driver.sleep(delay);

    yield el.sendKeys('j');
    yield h.driver.sleep(delay);

    var employees = yield h.driver.elementsByCssSelector('.topcoat-list a');
    employees.length.should.equal(5);

    yield employees[3].click();
    yield h.driver.sleep(delay);

    var options = yield h.driver.elementsByCssSelector('.actions a');
    options.length.should.equal(6);

    yield options[3].click();
    yield h.driver.sleep(delay);

    yield nativeSeq(h, function*() {
        yield dismiss(h.driver);
    });

    yield h.driver.sleep(delay);
});

(function(){
  console.log("Running " + tests.length + " tests");
  monocle.parallel(tests);
})();
