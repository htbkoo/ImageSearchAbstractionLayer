/**
 * Created by Hey on 15 Jul 2017
 */
var test = require('chai');
var sinon = require('../test-util/sinonTestHelper').sinon;

var imageSearchService = require('../imageSearchService');
var queryPersister = require('../queryPersister');
var pixabayImageSearcher = require('../pixabayImageSearcher');

describe("imageSearchService", function () {
    describe("search", function () {
        it("should return search results in searchAndPersist(:query)", sinon.test(function () {
            //    given
            var someQuery = "someQuery";
            var expectedResult = require('./resources/expectedResultFor_aResponseFromPixabay.json');
            stubResponses.call(this, someQuery, 'aResponseFromPixabay.json');

            //    when
            var promise = imageSearchService.searchAndPersist(someQuery);

            //    then
            return getPromiseThatAssertResultsAndThrowOnError(promise, expectedResult);
        }));

        it("should return search results with offset in searchAndPersist(:query, :offset)", sinon.test(function () {
            //    given
            var someQuery = "someQuery", someOffset = 2;
            var expectedResult = require('./resources/expectedResultFor_anotherResponseFromPixabay.json');
            stubResponses.call(this, someQuery, 'anotherResponseFromPixabay.json');

            //    when
            var promise = imageSearchService.searchAndPersist(someQuery, someOffset);

            //    then
            return getPromiseThatAssertResultsAndThrowOnError(promise, expectedResult);
        }));
    });

    describe("persist", function () {
        it("should persist search query in searchAndPersist(:query)", sinon.test(function () {
            //    given
            var someQuery = "someQuery";
            var expectedResult = require('./resources/expectedResultFor_aResponseFromPixabay.json');
            stubResponses.call(this, someQuery, 'aResponseFromPixabay.json');

            //    when
            var promise = imageSearchService.searchAndPersist(someQuery);

            //    then
            return getPromiseThatAssertResultsAndThrowOnError(promise, expectedResult);
        }));
    });

    function getPromiseThatAssertResultsAndThrowOnError(promise, anotherResponseFromPixabay) {
        return promise.then(function (actualResults) {
            test.expect(actualResults).to.deep.equal(anotherResponseFromPixabay);
        }).catch(function (err) {
            throw err;
        });
    }

    function stubResponses(query, responseJsonFileName) {
        var aResponseFromPixabay = require('./resources/' + responseJsonFileName);
        var stub_pixabayImageSearcher = this.stub(pixabayImageSearcher, 'search');
        stub_pixabayImageSearcher.withArgs(query).returns(Promise.resolve(aResponseFromPixabay));
        var stub_queryPersister = this.stub(queryPersister, 'persist');
        stub_queryPersister.withArgs(query, aResponseFromPixabay).returns(aResponseFromPixabay);
    }
});