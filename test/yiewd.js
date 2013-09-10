/*global beforeEach:true, afterEach:true, describe:true */

var yiewdBlock = require("./helpers/yiewdblock")
  , should = require("should")
  , path = require("path")
  , appPkg = "io.appium.gappium.sampleapp"
  , appAct = "HelloGappium"
  , delay = 1;

var desc = yiewdBlock.describeForGappium(appPkg, appAct);

desc("HelloGappium", function(h) {
    beforeEach(yiewdBlock.activateWebView(h));

    it("should open the app", function(done) {
        h.driver.run(function*() {
            try {
                var el = yield this.elementByCssSelector('.search-key');
                should.exist(el);
                yield this.sleep(delay);

                yield el.sendKeys('j');
                yield this.sleep(delay);

                var employees = yield this.elementsByCssSelector('.topcoat-list a');
                employees.length.should.equal(5);

                yield employees[3].click();
                yield this.sleep(delay);

                var options = yield this.elementsByCssSelector('.actions a');
                options.length.should.equal(6);

                yield options[3].click();
                yield this.sleep(delay);
            } catch (e) {
                return done(e);
            }

            return done();
        });
    });
});
