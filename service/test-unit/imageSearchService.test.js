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
        var aResponseFromPixabay = require('./resources/aResponseFromPixabay.json');
        var stub_pixabayImageSearcher = this.stub(pixabayImageSearcher, 'search');
        stub_pixabayImageSearcher.withArgs("someQuery").returns(Promise.resolve(aResponseFromPixabay));

        //    when
        var promise = imageSearchService.searchAndPersist("someQuery");

        //    then
        return promise.then(function (actualResults) {
            test.expect(actualResults).to.deep.equal(aResponseFromPixabay);
        }).catch(function (err) {
            throw err;
        });
    }));
});