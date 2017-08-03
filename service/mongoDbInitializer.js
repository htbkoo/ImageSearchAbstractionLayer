/**
 * Created by Hey on 23 Jul 2017
 */

var format = require('string-format');

var mongoDbConnectionManager = require("./mongoDbConnectionManager");
var expectedIndexRetriever = require("./expectedIndexRetriever");
var EXPECTED_INDEXES = expectedIndexRetriever.retrieve();

module.exports = {
    "createIndexesIfMissing": function () {
        var collection_queries;
        console.log("Creating indexes if missing");
        return Promise.all(
            Object.keys(EXPECTED_INDEXES)
                .map(function (key) {
                    console.log("for collection: " + key);
                    return mongoDbConnectionManager.getOrReuseMongoDbConnection().then(function (db) {
                        return db.collection(key);
                    }).then(function (collection) {
                        var index = EXPECTED_INDEXES[key];
                        console.log("ensured index: " + JSON.stringify(index.key));
                        return collection.ensureIndex(index.key, index.op);
                    });
                })
        );
    }
};