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
            collection_queries = collection;
            return collection.getIndexes();
        }).then(function (existingIndexes) {
            var existing = existingIndexChecker(existingIndexes);
            return Promise.all(
                EXPECTED_INDEXES.map(function (index) {
                    if (!existing.containsKey(index)) {
                        console.log(format("Creating index for {} with op: {}", JSON.stringify(index.key), JSON.stringify(index.op)));
                        return collection_queries.createIndex(index.key, index.op);
                    }
                    console.log(format("Index already exists for {}, not creating.", JSON.stringify(index.key)));
                    return Promise.resolve();
                })
            );
        });
    }
};