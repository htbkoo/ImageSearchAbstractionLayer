/**
 * Created by Hey on 15 Jul 2017
 */
var test = require('chai');
var sinon = require('../test-util/sinonTestHelper').sinon;

var imageSearchService = require('../imageSearchService');
var pixabayImageSearcher = require('../pixabayImageSearcher');

describe("imageSearchService", function () {
    it("should return search results in searchAndPersist", sinon.test(function () {
        //    given
        var someResults = {
            "keyA": "valueA",
            "keyB": "valueB"
        };
        var stub_pixabayImageSearcher = this.stub(pixabayImageSearcher, 'search');
        stub_pixabayImageSearcher.withArgs("someQuery").returns(Promise.resolve(someResults));

        //    when
        var promise = imageSearchService.searchAndPersist("someQuery");

        //    then
        return promise.then(function (actualResults) {
            test.expect(actualResults).to.deep.equal(someResults);
        }).catch(function (err) {
            throw err;
        });
    }));
});