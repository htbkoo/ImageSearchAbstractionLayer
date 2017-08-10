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
            stubResponse.call(this, {
                query: someQuery,
                responseJsonFileName: 'aResponseFromPixabay.json',
                offset: 1
            }).andQueryPersist().andCachePersist();

            stubTryLoadCache.call(this, null).forAnyAngs();

            //    when
            var promise = imageSearchService.searchAndPersist(someQuery);

            //    then
            return getPromiseThatAssertResultsAndThrowOnError(promise, expectedResult);
        }));

        it("should return search results with offset in searchAndPersist(:query, :offset)", sinon.test(function () {
            //    given
            var someQuery = "someQuery", someOffset = 2;
            var expectedResult = require('./resources/expectedResultFor_anotherResponseFromPixabay.json');
            stubResponse.call(this, {
                query: someQuery,
                responseJsonFileName: 'anotherResponseFromPixabay.json',
                offset: someOffset
            }).andQueryPersist().andCachePersist();

            stubTryLoadCache.call(this, null).forAnyAngs();

            //    when
            var promise = imageSearchService.searchAndPersist(someQuery, someOffset);

            //    then
            return getPromiseThatAssertResultsAndThrowOnError(promise, expectedResult);
        }));
    });

    describe("persist", function () {
        it("should persist search query and cache in searchAndPersist(:query)", sinon.test(function () {
            //    given
            var someQuery = "someQuery", someOffset = 10;
            var expectedResult = require('./resources/expectedResultFor_aResponseFromPixabay.json');
            var mockSearchResponseFileName = 'aResponseFromPixabay.json';
            stubResponse.call(this, {
                query: someQuery,
                responseJsonFileName: mockSearchResponseFileName,
                offset: someOffset
            });
            var mockSearchResponse = require('./resources/' + mockSearchResponseFileName);
            var mock_queryPersister_persist = this.mock(queryPersister.persist);
            mock_queryPersister_persist.expects("query").once().withArgs(someQuery, mockSearchResponse).returns(mockSearchResponse);
            mock_queryPersister_persist.expects("cache").once().withArgs(someQuery, someOffset, mockSearchResponse).returns(mockSearchResponse);

            stubTryLoadCache.call(this, null).forAnyAngs();

            //    when
            var promise = imageSearchService.searchAndPersist(someQuery, someOffset);

            //    then
            return getPromiseThatAssertResultsAndThrowOnError(promise, expectedResult).then(function () {
                mock_queryPersister_persist.verify();
            });
        }));
    });

    describe("load from cache", function () {
        it("should load from cache if cache is found", sinon.test(function () {
            //    given
            var someQuery = "someQuery", someOffset = 5;
            var expectedResult = require('./resources/expectedResultFor_anotherResponseFromPixabay.json');
            var mockSearchResponse = require('./resources/anotherResponseFromPixabay.json');

            stubTryLoadCache.call(this, mockSearchResponse).withArgs(someQuery, someOffset);
            var stub_pixabayImageSearcher = this.stub(pixabayImageSearcher, 'search');
            stub_pixabayImageSearcher.returns(Promise.reject(new Error("should not fetch externally when cache is found")));

            var mock_queryPersister_persist = this.mock(queryPersister.persist);
            mock_queryPersister_persist.expects("query").once().withArgs(someQuery, mockSearchResponse).returns(mockSearchResponse);
            mock_queryPersister_persist.expects("cache").never();

            //    when
            var promise = imageSearchService.searchAndPersist(someQuery, someOffset);

            //    then
            return getPromiseThatAssertResultsAndThrowOnError(promise, expectedResult);
        }));
    });

    describe("latest", function () {
        it("should be able to get latest search queries", sinon.test(function () {
            //    given
            var stub_queryPersister = this.stub(queryPersister, 'latest');
            var mockLatestSearches = [{
                "query": "someQuery",
                "timestamp": "someTime"
            }];
            stub_queryPersister.withArgs().returns(Promise.resolve(mockLatestSearches));

            //    when
            var promise = imageSearchService.latest();

            //    then
            return promise.then(function (latestSearches) {
                test.expect(latestSearches).to.deep.equal(mockLatestSearches);
            });
        }));
    });

    function getPromiseThatAssertResultsAndThrowOnError(promise, anotherResponseFromPixabay) {
        return promise.then(function (actualResults) {
            test.expect(actualResults).to.deep.equal(anotherResponseFromPixabay);
        }).catch(function (err) {
            throw err;
        });
    }

    function stubResponse(param) {
        var outerThis = this;
        var aResponseFromPixabay = require('./resources/' + param.responseJsonFileName);
        var stub_pixabayImageSearcher = this.stub(pixabayImageSearcher, 'search');
        stub_pixabayImageSearcher.withArgs(param.query, param.offset).returns(Promise.resolve(aResponseFromPixabay));
        return {
            "andQueryPersist": function () {
                var stub_queryPersister = outerThis.stub(queryPersister.persist, 'query');
                stub_queryPersister.withArgs(param.query, aResponseFromPixabay).returns(aResponseFromPixabay);
                return {
                    "andCachePersist": function () {
                        var stub_queryPersister = outerThis.stub(queryPersister.persist, 'cache');
                        stub_queryPersister.withArgs(param.query, param.offset, aResponseFromPixabay).returns(aResponseFromPixabay);
                    }
                }
            }
        };
    }

    function stubTryLoadCache(mockCache) {
        var outterThis = this;
        var stub = this.stub(queryPersister, "tryLoadCache");
        return {
            "withArgs": function (someQuery, someOffset) {
                stub.withArgs(someQuery, someOffset).returns(Promise.resolve(mockCache));
                return stub;
            },
            "forAnyAngs": function () {
                stub.returns(Promise.resolve(mockCache));
                return stub;
            }
        }
    }
});