/**
 * Created by Hey on 15 Jun 2017
 */
var test = require('chai');
var format = require('string-format');
var rewire = require('rewire');

var mockMongo = require('mongo-mock');
mockMongo.max_delay = 0;
var mockMongoClient = mockMongo.MongoClient;

var sinon = require('sinon');
var sinonTest = require('sinon-test');
sinon.test = sinonTest.configureTest(sinon);
sinon.testcase = sinonTest.configureTestCase(sinon);

var idGenerator = require('../idGenerator');
var shortenedUrlPersister = rewire('../shortenedUrlPersister');
shortenedUrlPersister.__set__('mongo', mockMongoClient);

describe("shortenedUrlPersister", function () {
    var COLLECTION_NAME_SHORTEN_URLS = 'shortenedUrls';

    describe("Usage of dotenv - process.env.MONGO_URL", function () {
        it("should be able to get MONGO_URL from .env", function () {
            //    given
            //    when
            var mongoUrl = process.env.MONGO_URL;

            //    then
            test.expect(mongoUrl).to.be.not.undefined;
        });
    });

    describe("persist", function () {
        var mongoUrl = process.env.MONGO_URL;
        var originalUrl = "originalUrl";
        var generatedId = "short";
        var fullHostName = "withProtocol://www.ahost.com";
        var expectedPersistedShortenUrl = fullHostName.concat('/').concat(generatedId);

        var stub_IdGenerator_generate;

        afterEach(function () {
            stub_IdGenerator_generate.restore();
        });

        it("should be able to persist unique original url", function () {
            //    given
            stub_IdGenerator_generate = sinon.stub(idGenerator, "generate");
            stub_IdGenerator_generate.returns(generatedId);

            //    when
            var promise = shortenedUrlPersister.getPromiseFor.persistOrReturnExisting(originalUrl, fullHostName);

            //    then
            var handlerForCleanUp = {};
            return promise.then(function (returnedUrl) {
                test.expect(returnedUrl).to.be.equal(expectedPersistedShortenUrl);

                return mockMongoClient.connect(mongoUrl);
            }).then(function (db) {
                handlerForCleanUp.db = db;

                var collection = db.collection(COLLECTION_NAME_SHORTEN_URLS);
                handlerForCleanUp.collection = collection;
                return collection.findOne({
                    "shorten_from": originalUrl
                })
            }).then(function (data) {
                test.expect(data["shorten_to"]).to.equal(expectedPersistedShortenUrl);
            }).then(function () {
                // truncate
                handlerForCleanUp.collection.toJSON().documents.length = 0;
                handlerForCleanUp.db.close();
            }).catch(function (err) {
                throw err;
            });
        });

        it("should return existing shortened url if found instead of generating new when persist", function () {
            //    given
            stub_IdGenerator_generate.throws("Unexpected call of idGenerator.generate()");

            var handlerForCleanUp = {};
            return mockMongoClient.connect(mongoUrl)
                .then(function (db) {
                    handlerForCleanUp.db = db;
                    var collection = db.collection(COLLECTION_NAME_SHORTEN_URLS);
                    handlerForCleanUp.collection = collection;

                    var existingEntry = {"shorten_from": originalUrl, "shorten_to": expectedPersistedShortenUrl};
                    return collection.insert(existingEntry);
                }).then(function (data) {
                    //    when
                    return shortenedUrlPersister.getPromiseFor.persistOrReturnExisting(originalUrl);
                }).then(function (returnedUrl) {
                    //    then
                    test.expect(returnedUrl).to.be.equal(expectedPersistedShortenUrl);

                    return handlerForCleanUp.collection.findOne({
                        "shorten_from": originalUrl
                    });
                }).then(function (data) {
                    test.expect(data["shorten_from"]).to.equal(originalUrl);
                    test.expect(data["shorten_to"]).to.equal(expectedPersistedShortenUrl);
                }).then(function () {
                    // truncate
                    handlerForCleanUp.collection.toJSON().documents.length = 0;
                    handlerForCleanUp.db.close();
                }).catch(function (err) {
                    throw err;
                });
        });
    });

    describe("search", function () {
        var mongoUrl = process.env.MONGO_URL;
        var shortenedUrl = "short";

        [
            "anOriginalUrl",
            "anotherOriginalUrl"
        ].forEach(function (originalUrl) {
            it(format("should, for search('{}'), return existing '{}' if found", shortenedUrl, originalUrl), function () {
                //    given
                var handlerForCleanUp = {};
                return mockMongoClient.connect(mongoUrl)
                    .then(function (db) {
                        handlerForCleanUp.db = db;
                        var collection = db.collection(COLLECTION_NAME_SHORTEN_URLS);
                        handlerForCleanUp.collection = collection;
                        handlerForCleanUp.collection.toJSON().documents.length = 0;

                        var existingEntry = {"shorten_from": originalUrl, "shorten_to": shortenedUrl};
                        return collection.insert(existingEntry);
                    }).then(function (data) {
                        //    when
                        return shortenedUrlPersister.getPromiseFor.search(shortenedUrl);
                    }).then(function (returnedUrl) {
                        //    then
                        test.expect(returnedUrl).to.be.equal(originalUrl);

                        return handlerForCleanUp.collection.findOne({
                            "shorten_from": originalUrl
                        });
                    }).then(function (data) {
                        test.expect(data["shorten_from"]).to.equal(originalUrl);
                        test.expect(data["shorten_to"]).to.equal(shortenedUrl);
                    }).then(function () {
                        // truncate
                        handlerForCleanUp.collection.toJSON().documents.length = 0;
                        handlerForCleanUp.db.close();
                    }).catch(function (err) {
                        throw err;
                    });
            });
        });

        it("should throw error with error message if not found", function () {
            //    given
            var handlerForCleanUp = {};

            //    when
            var promise = shortenedUrlPersister.getPromiseFor.search(shortenedUrl);

            //    then
            return promise.then(function () {
                test.assert.fail("Should not hit then");
            }).catch(function (err) {
                test.expect(err.message).to.equal(format("Url '{}' does not map to any url", shortenedUrl));
            })
        });
    });
});