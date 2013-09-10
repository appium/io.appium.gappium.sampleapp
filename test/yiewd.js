/*global beforeEach:true, afterEach:true, describe:true */

var yiewdBlock = require("./helpers/yiewdblock")
  , yit = yiewdBlock.yiewdIt
  , should = require("should")
  , path = require("path")
  , appPkg = "io.appium.gappium.sampleapp"
  , appAct = "HelloGappium"
  , delay = 3;

var describeGappium = yiewdBlock.describeForGappium(appPkg, appAct);

describeGappium("HelloGappium", function(h) {
    beforeEach(yiewdBlock.activateWebView(h));

    yit("should open the app", function*() {
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
    });
});
