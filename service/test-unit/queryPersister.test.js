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

    describe("persist", function () {
        var mongoUrl = "someHost";
        var stub = {};

        afterEach(function () {
            moment.now = function () {
                return +new Date();
            };
            Object.keys(stub)
                .forEach(function (key) {
                    stub[key].restore();
                });
        });

        it("should be able to persist query with creation timestamp", function () {
            //    given
            moment.now = function () {
                return new Date(mockCurrentTime);
            };
            var aQuery = "query", aSearchResult = "results", mockCurrentTime = "2013-02-04T22:44:30.652Z";
            var mockDbConnection = mockMongoClient.connect(mongoUrl);

            stub.mongoDbConnectionManager_getOrReuseMongoDbConnection = sinon.stub(mongoDbConnectionManager, "getOrReuseMongoDbConnection");
            stub.mongoDbConnectionManager_getOrReuseMongoDbConnection.returns(mockDbConnection);

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
});