/**
 * Created by Hey on 20 Jul 2017
 */

var COLLECTION_NAME_LATEST_QUERIES = 'queries';

var moment = require('moment');

var mongoDbConnectionManager = require('./mongoDbConnectionManager');

module.exports = {
    "persist": function (query, result) {
        return mongoDbConnectionManager.getOrReuseMongoDbConnection()
            .then(function (db) {
                return db.collection(COLLECTION_NAME_LATEST_QUERIES);
            })
            .then(function (collection) {
                return collection.insertOne({
                    "query": query,
                    "timestamp": moment().toISOString()
                });
            })
            .then(function (insertResult) {
                console.log(insertResult);
                return result;
            })
    },
    "latest": function(){

    }
};