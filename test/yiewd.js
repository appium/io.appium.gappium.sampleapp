/*global beforeEach:true, afterEach:true, describe:true */

var yiewdBlock = require("./helpers/yiewdblock")
  , yit = yiewdBlock.yiewdIt
  , nativeSeq = yiewdBlock.nativeSequence
  , should = require("should")
  , path = require("path")
  , monocle = require("monocle-js")
  , o_O = monocle.o_O
  , _ = require("underscore")
  , appPkg = "io.appium.gappium.sampleapp"
  , appAct = "HelloGappium"
  , delay = 0.5;

var describeGappium = yiewdBlock.describeForGappium(appPkg, appAct);

describeGappium("HomeView", function(h) {
    beforeEach(yiewdBlock.activateWebView(h));

    yit("should display as initial view", function*() {
        yield h.driver.sleep(delay);

        var h1 = yield h.driver.elementByCssSelector('.topcoat-navigation-bar h1');
        should.exist(h1);

        var val = yield h1.text();
        val.should.equal("Employee Directory");
    });

    yit("should allow to search for employees", function*() {
        yield h.driver.sleep(delay);

        var el = yield h.driver.elementByCssSelector('.search-key');
        should.exist(el);
        yield h.driver.sleep(delay);

        yield el.sendKeys('james');
        yield h.driver.sleep(delay);
    });

    yit("should find five emplyoees for the letter j", function*() {
        yield h.driver.sleep(delay);

        var el = yield h.driver.elementByCssSelector('.search-key');
        should.exist(el);
        yield h.driver.sleep(delay);

        yield el.sendKeys('j');
        yield h.driver.sleep(delay);

        var employees = yield h.driver.elementsByCssSelector('.topcoat-list a');
        employees.length.should.equal(5);
/*
        yield employees[3].click();
        yield h.driver.sleep(delay);

        var options = yield h.driver.elementsByCssSelector('.actions a');
        options.length.should.equal(6);

        yield options[3].click();
        yield h.driver.sleep(delay);
*/
    });

    yit("should scroll down list of employees", function*() {
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
});

describeGappium("EmployeeView", function(h) {
    beforeEach(yiewdBlock.activateWebView(h));

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

    yit("should select James King and check his direct reports", function*() {
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

    yit("should open location map and dismiss modal dialog", function*() {
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
});
