/**
 * Created by Hey on 15 Jul 2017
 */
var test = require('chai');
var sinon = require('../test-util/sinonTestHelper').sinon;

var imageSearchService = require('../imageSearchService');
var pixabayImageSearcher = require('../pixabayImageSearcher');

describe("imageSearchService", function () {
    it("should return search results in searchAndPersist(:query)", sinon.test(function () {
        //    given
        var aResponseFromPixabay = require('./resources/aResponseFromPixabay.json');
        var expectedResult = require('./resources/expectedResultFor_aResponseFromPixabay.json');
        var stub_pixabayImageSearcher = this.stub(pixabayImageSearcher, 'search');
        var someQuery = "someQuery";
        stub_pixabayImageSearcher.withArgs(someQuery).returns(Promise.resolve(aResponseFromPixabay));

        //    when
        var promise = imageSearchService.searchAndPersist(someQuery);

        //    then
        return getPromiseThatAssertResultsAndThrowOnError(promise, expectedResult);
    }));

    it("should return search results with offset in searchAndPersist(:query, :offset)", sinon.test(function () {
        //    given
        var anotherResponseFromPixabay = require('./resources/anotherResponseFromPixabay.json');
        var expectedResult = require('./resources/expectedResultFor_anotherResponseFromPixabay.json');
        var stub_pixabayImageSearcher = this.stub(pixabayImageSearcher, 'search');
        var someQuery = "someQuery", someOffset = 2;
        stub_pixabayImageSearcher.withArgs(someQuery, someOffset).returns(Promise.resolve(anotherResponseFromPixabay));

        //    when
        var promise = imageSearchService.searchAndPersist(someQuery, someOffset);

        //    then
        return getPromiseThatAssertResultsAndThrowOnError(promise, expectedResult);
    }));

    function getPromiseThatAssertResultsAndThrowOnError(promise, anotherResponseFromPixabay) {
        return promise.then(function (actualResults) {
            test.expect(actualResults).to.deep.equal(anotherResponseFromPixabay);
        }).catch(function (err) {
            throw err;
        });
    }
});