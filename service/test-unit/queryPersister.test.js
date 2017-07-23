/**
 * Created by Hey on 20 Jul 2017
 */
var test = require('chai');
var format = require('string-format');
var moment = require('moment');
var sinon = require('../test-util/sinonTestHelper').sinon;

var mockMongo = require('mongo-mock');
mockMongo.max_delay = 0;
var mockMongoClient = mockMongo.MongoClient;

var queryPersister = require('../queryPersister');
var mongoDbConnectionManager = require('../mongoDbConnectionManager');

describe("queryPersister", function () {
    "use strict";
    var COLLECTION_NAME_LATEST_QUERIES = 'queries';
    var mockDbConnection = mockMongoClient.connect("someHost");
    var stub = {};

    beforeEach(function(){
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

            //    when
            var promise = queryPersister.persist(aQuery, aSearchResult);

            //    then
            var handlerForCleanUp = {};
            return promise.then(function (returnValue) {
                test.expect(returnValue).to.be.equal(aSearchResult);

                return mockDbConnection;
            }).then(function (db) {
                handlerForCleanUp.db = db;

                var collection = db.collection(COLLECTION_NAME_LATEST_QUERIES);
                handlerForCleanUp.collection = collection;
                return collection.findOne({
                    "query": aQuery,
                    "timestamp": mockCurrentTime
                })
            }).then(function (data) {
                test.expect(data).to.be.not.null;
                test.expect(data["query"]).to.equal(aQuery);
            }).then(function () {
                // truncate
                handlerForCleanUp.collection.toJSON().documents.length = 0;
                handlerForCleanUp.db.close();
            }).catch(function (err) {
                throw err;
            });
        });
    });

    describe("latest", function () {
        it("should get latest search query terms from db", function () {
            //    given
            var handlerForCleanUp = {};
            var lastSearch = {
                "query": "someQuery",
                "timestamp": "someTime"
            };

            return mockDbConnection.then(function (db) {
                handlerForCleanUp.db = db;
                var collection = db.collection(COLLECTION_NAME_LATEST_QUERIES);
                handlerForCleanUp.collection = collection;
                handlerForCleanUp.collection.toJSON().documents.length = 0;

                return collection.insert(lastSearch);
            }).then(function () {
                //    when
                return queryPersister.latest();
            }).then(function (latest) {
                //    then
                // TODO: report bug for mongo-mock - projection to take away _id does not work
                // test.expect(latest).to.be.deep.equal([lastSearch]);
                assertReturnedLatestSearches(latest).to.be.similar.to([lastSearch]);

                return handlerForCleanUp.collection.find(lastSearch).toArray();
            }).then(function (data) {
                assertReturnedLatestSearches(data).to.be.similar.to([lastSearch]);
            }).then(function () {
                // truncate
                handlerForCleanUp.collection.toJSON().documents.length = 0;
                handlerForCleanUp.db.close();
            }).catch(function (err) {
                throw err;
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
});