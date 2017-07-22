/**
 * Created by Hey on 21 Jul 2017
 */
require('dotenv').config();

var test = require('chai');
var rewire = require('rewire');

var sinon = require('sinon');

describe("mongoDbConnectionManager", function () {
    "use strict";
    describe("Usage of dotenv - process.env.MONGO_URL", function () {
        it("should be able to get MONGO_URL from .env", function () {
            //    given
            //    when
            var mongoUrl = process.env.MONGO_URL;

            //    then
            test.expect(mongoUrl).to.be.not.undefined;
        });
    });

    describe("getOrReuseMongoDbConnection", function () {
        var mongoUrl = process.env.MONGO_URL;
        var mongoDbConnectionManager = rewire('../mongoDbConnectionManager');
        var mockMongo;

        afterEach(function () {
            mockMongo.restore();
        });

        it("should be able to get mongoDb connection", function () {
            //    given
            var theConnection = "this is the connection";
            var originalMongo = mongoDbConnectionManager.__get__('mongo');
            test.expect(typeof originalMongo).to.not.equal('undefined');
            mockMongo = sinon.mock(originalMongo);
            mockMongo.expects("connect").withArgs(mongoUrl).once().returns(theConnection);

            //    when
            var connection = mongoDbConnectionManager.getOrReuseMongoDbConnection();

            //    then
            mockMongo.verify();
            test.expect(connection).to.equal(theConnection);
        });

        it("should be reuse mongoDb connection instead of recalling mongo.connect", function () {
            //    given
            var theConnection = "this is the connection";
            var originalMongo = mongoDbConnectionManager.__get__('mongo');
            test.expect(typeof originalMongo).to.not.equal('undefined');
            mockMongo = sinon.stub(originalMongo, "connect");
            mockMongo.withArgs(mongoUrl).onFirstCall().returns(theConnection);
            mockMongo.throws(new Error("Should not call mongo.connect() more than once"));

            //    when
            var connection = mongoDbConnectionManager.getOrReuseMongoDbConnection();
            test.expect(connection).to.equal(theConnection);
            connection = mongoDbConnectionManager.getOrReuseMongoDbConnection();

            //    then
            test.expect(connection).to.equal(theConnection);
        });
    });
});
