/**
 * Created by Hey on 20 Jul 2017
 */
var test = require('chai');
test.use(require('chai-moment'));
var format = require('string-format');
var moment = require('moment');
var sinon = require('../test-util/sinonTestHelper').sinon;
var testUtils = require('../test-util/testUtils');

var mockMongo = require('mongo-mock');
mockMongo.max_delay = 0;
var mockMongoClient = mockMongo.MongoClient;

var queryPersister = require('../queryPersister');
var mongoDbConnectionManager = require('../mongoDbConnectionManager');

describe("queryPersister", function () {
    "use strict";
    var COLLECTION_NAME = {"LATEST_QUERIES": "queries", "SEARCH_CACHE": "caches"};
    var mockDbConnection = mockMongoClient.connect("someHost");
    var stub = {};

    beforeEach(function () {
        stubMongoDbConnection();
    });

    afterEach(function () {
        moment.now = function () {
            return +new Date();
        };
        Object.keys(stub).forEach(function (key) {
            stub[key].restore();
        });
    });

    describe("persist", function () {
        it("should be able to persist query with creation timestamp", function () {
            //    given
            moment.now = function () {
                return new Date(mockCurrentTime);
            };
            var aQuery = "query", aSearchResult = "results", mockCurrentTime = "2013-02-04T22:44:30.652Z";
            var lastSearchCollection;

            //    when
            var promise = queryPersister.persist(aQuery, aSearchResult);

            //    then
            return promise.then(function (returnValue) {
                test.expect(returnValue).to.be.equal(aSearchResult);

                return initiateDbConnection()
                    .withCleanupAndErrorHandling()
                    .forCollection(COLLECTION_NAME.LATEST_QUERIES)
                    .performDbOperation(function (dbConnection) {
                        return dbConnection.then(function (collection) {
                            lastSearchCollection = collection;
                            return collection.findOne({
                                "query": aQuery,
                                "timestamp": moment(mockCurrentTime).toDate()
                            })
                        }).then(function (data) {
                            test.expect(data).to.be.not.null;
                            test.expect(data["query"]).to.equal(aQuery);
                        })
                    }).then(cleanUpCollection(COLLECTION_NAME.SEARCH_CACHE));
            });
        });

        it("should be able to persist cache of results with creation timestamp", function () {
            //    given
            moment.now = function () {
                return mockCurrentTimeInDate;
            };
            var aQuery = "query", aSearchResult = "results",
                mockCurrentTimeInDate = moment("2013-02-04T22:44:30.652Z").toDate();
            var searchCacheCollection;

            //    when
            var promise = queryPersister.persist(aQuery, aSearchResult);

            //    then
            return promise.then(function (returnValue) {
                test.expect(returnValue).to.be.equal(aSearchResult);

                return initiateDbConnection()
                    .withCleanupAndErrorHandling()
                    .forCollection(COLLECTION_NAME.SEARCH_CACHE)
                    .performDbOperation(function (dbConnection) {
                        return dbConnection.then(function (collection) {
                            searchCacheCollection = collection;
                            return collection.findOne({
                                "query": aQuery,
                                "result": aSearchResult,
                                "timestamp": mockCurrentTimeInDate
                            })
                        }).then(function (data) {
                            test.expect(data).to.be.not.null;
                            test.expect(data["query"]).to.equal(aQuery);
                            test.expect(data["result"]).to.equal(aSearchResult);
                            test.expect(moment(data["timestamp"])).to.be.sameMoment(moment(mockCurrentTimeInDate));
                        })
                    }).then(cleanUpCollection(COLLECTION_NAME.LATEST_QUERIES));
            });
        });
    });

    describe("latest", function () {
        it("should get latest search query terms from db", function () {
            //    given
            var lastSearchCollection;
            var lastSearch = {
                "query": "someQuery",
                "timestamp": "someTime"
            };

            return initiateDbConnection()
                .withCleanupAndErrorHandling()
                .purgeCollectionBeforeDbOperation()
                .forCollection(COLLECTION_NAME.LATEST_QUERIES)
                .performDbOperation(function (dbConnection) {
                    return dbConnection.then(function (collection) {
                        lastSearchCollection = collection;
                        return collection.insert(lastSearch);
                    }).then(function () {
                        //    when
                        return queryPersister.latest();
                    }).then(function (latest) {
                        //    then
                        // TODO: report bug for mongo-mock - projection to take away _id does not work
                        // test.expect(latest).to.be.deep.equal([lastSearch]);
                        assertReturnedLatestSearches(latest).to.be.similar.to([lastSearch]);

                        return lastSearchCollection.find(lastSearch).toArray();
                    }).then(function (data) {
                        assertReturnedLatestSearches(data).to.be.similar.to([lastSearch]);
                    });
                });
        });

        [
            {
                name: "should limit the number of latest search query terms from db to 10",
                latestSearchesJsonFileName: "someLatestSearches.json"
            },
            {
                name: "should, regardless of find order, limit the number of latest search query terms from db to 10 latest searches by timestamp",
                latestSearchesJsonFileName: "someOtherRandonlyOrderedLatestSearches.json"
            }
        ].forEach(function (testCase) {
            it(testCase.name, function () {
                //    given
                var lastSearches = require('./resources/' + testCase.latestSearchesJsonFileName), mongoCollection;

                return initiateDbConnection()
                    .withCleanupAndErrorHandling()
                    .purgeCollectionBeforeDbOperation()
                    .forCollection(COLLECTION_NAME.LATEST_QUERIES)
                    .performDbOperation(function (dbConnection) {
                        return dbConnection.then(function (collection) {
                            mongoCollection = collection;
                            var documents = collection.toJSON().documents;
                            lastSearches.forEach(function (search) {
                                documents.push(search)
                            });

                            //    when
                            return queryPersister.latest();
                        }).then(function (latest) {
                            //    then
                            var expectedReturnValue = require('./resources/expectedReturnedLatestSearches.json');
                            assertReturnedLatestSearches(latest).to.be.similar.to(expectedReturnValue);

                            return mongoCollection.find().toArray();
                        }).then(function (data) {
                            assertReturnedLatestSearches(data).to.be.similar.to(lastSearches);
                        });
                    });
            });
        });
    });

    describe("tryLoadCache", function () {
        it("should, given existing cache, tryLoadCache('query') and return promise", function () {
            //    given
            var handlerForCleanUp = {};
            var someQuery = "query", someResult = "result";
            return initiateDbConnection()
                .withCleanupAndErrorHandling()
                .purgeCollectionBeforeDbOperation()
                .forCollection(COLLECTION_NAME.SEARCH_CACHE)
                .performDbOperation(function (dbConnection) {
                    return dbConnection.then(function (collection) {
                        return collection.insertOne({
                            "query": someQuery,
                            "result": someResult,
                            "timestamp": new Date(2017, 7, 1)
                        });
                    }).then(function () {
                        //    when
                        return queryPersister.tryLoadCache(someQuery);
                    }).then(function (cache) {
                        //    then
                        test.expect(cache.result).to.equal(someResult);
                    });
                });
        });

        it("should, given non-existent cache, tryLoadCache('query') and return promise", function () {
            //    given
            var handlerForCleanUp = {};
            var someQuery = "query", someResult = "result";
            return initiateDbConnection()
                .withCleanupAndErrorHandling()
                .purgeCollectionBeforeDbOperation()
                .forCollection(COLLECTION_NAME.SEARCH_CACHE)
                .performDbOperation(function (dbConnection) {
                    return dbConnection.then(function () {
                        //    when
                        return queryPersister.tryLoadCache(someQuery);
                    }).then(function (cache) {
                        //    then
                        test.expect(cache).to.be.null;
                    });
                });
        });
    });

    function assertReturnedLatestSearches(latest) {
        test.expect(latest).to.be.an("Array");
        return {
            to: {
                be: {
                    similar: {
                        to: function (expected) {
                            test.expect(latest).to.have.length(expected.length);
                            expected.forEach(function (search, i) {
                                Object.keys(search).forEach(function (key) {
                                    test.expect(search[key]).to.deep.equal(latest[i][key]);
                                })
                            })
                        }
                    }
                }
            }
        };
    }

    function stubMongoDbConnection() {
        stub.mongoDbConnectionManager_getOrReuseMongoDbConnection = sinon.stub(mongoDbConnectionManager, "getOrReuseMongoDbConnection");
        stub.mongoDbConnectionManager_getOrReuseMongoDbConnection.returns(mockDbConnection);
    }

    function initiateDbConnection() {
        return {
            "withCleanupAndErrorHandling": function () {
                var handlerForCleanUp = {};
                var shouldPurgeBeforehand = false;

                function connectToDb() {
                    return mockDbConnection.then(function (db) {
                        handlerForCleanUp.db = db;
                        return db;
                    })
                }

                function closeDbAfterwardsAndCatchError(promise) {
                    return promise.then(function () {
                        handlerForCleanUp.db.close();
                    }).catch(function (err) {
                        throw err;
                    })
                }

                function addPerformDbOperationWrapper(dbOperation) {
                    return {
                        "performDbOperation": dbOperation
                    };
                }

                function cleanUpDatabaseIfCollectionIsDefined() {
                    // truncate if found
                    if (testUtils.isObjectDefined(handlerForCleanUp.collection)) {
                        var collectionAsJson = handlerForCleanUp.collection.toJSON();
                        if (testUtils.isObjectDefined(collectionAsJson.documents)) {
                            collectionAsJson.documents.length = 0;
                            // json.documents = [];
                        }
                    }
                }

                var termOperations = {
                    "forDb": function () {
                        return addPerformDbOperationWrapper(function (performDbOperationOn) {
                            return closeDbAfterwardsAndCatchError(performDbOperationOn(connectToDb()));
                        });
                    },
                    "forCollection": function (collectionName) {
                        return addPerformDbOperationWrapper(function (performDbOperationOn) {
                            return closeDbAfterwardsAndCatchError(performDbOperationOn(connectToDb().then(function (db) {
                                handlerForCleanUp.collection = db.collection(collectionName);

                                if (shouldPurgeBeforehand) {
                                    cleanUpDatabaseIfCollectionIsDefined();
                                }

                                return handlerForCleanUp.collection;
                            })).then(cleanUpDatabaseIfCollectionIsDefined));
                        });
                    }
                };
                var withFlag = Object.assign({}, termOperations);
                withFlag.purgeCollectionBeforeDbOperation = function () {
                    shouldPurgeBeforehand = true;
                    return termOperations;
                };

                return withFlag;
            }
        };
    }

    function cleanUpCollection(collectionName) {
        return function () {
            return initiateDbConnection()
                .withCleanupAndErrorHandling()
                .forCollection(collectionName)
                .performDbOperation(noOpDbOperation);
        };
    }

    function noOpDbOperation(collection) {
        return Promise.resolve(collection);
    }
});