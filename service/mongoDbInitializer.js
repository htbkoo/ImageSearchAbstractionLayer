/**
 * Created by Hey on 23 Jul 2017
 */

var format = require('string-format');

var mongoDbConnectionManager = require("./mongoDbConnectionManager");
var existingIndexChecker = require("./existingIndexChecker");
var expectedIndexRetriever = require("./expectedIndexRetriever");
var EXPECTED_INDEXES = expectedIndexRetriever.retrieve();

module.exports = {
    "createIndexesIfMissing": function () {
        var collection_queries;
        return mongoDbConnectionManager.getOrReuseMongoDbConnection().then(function (db) {
            return db.collection("queries");
        }).then(function (collection) {
            return Promise.all(
                EXPECTED_INDEXES.map(function (index) {
                    return collection.ensureIndex(index.key, index.op);
                })
            );
        });
    }
};