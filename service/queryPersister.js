/**
 * Created by Hey on 20 Jul 2017
 */

var COLLECTION_NAME = {"LATEST_QUERIES": "queries"};
var LIMIT_NUM_LATEST_SEARCHES = 10;

var moment = require('moment');

var mongoDbConnectionManager = require('./mongoDbConnectionManager');

function connectToMongoDb() {
    return mongoDbConnectionManager.getOrReuseMongoDbConnection();
}

module.exports = {
    "persist": function (query, result) {
        return connectToMongoDb().then(function (db) {
            return db.collection(COLLECTION_NAME.LATEST_QUERIES);
        }).then(function (collection) {
            return collection.insertOne({
                "query": query,
                "timestamp": moment().toDate()
            });
        }).then(function (insertResult) {
            console.log(insertResult);
            return result;
        })
    },
    "latest": function () {
        return connectToMongoDb().then(function (db) {
            return db.collection(COLLECTION_NAME.LATEST_QUERIES);
        }).then(function (collection) {
            return collection.find({}, {"_id": 0, "query": 1, "timestamp": 1})
                .sort({"timestamp": -1})
                .limit(LIMIT_NUM_LATEST_SEARCHES)
                .toArray();
        });
    }
};