/**
 * Created by Hey on 21 Jul 2017
 */

var mongo = require('mongodb').MongoClient;
var mongoUrl = process.env.MONGO_URL;
var mongoDbConnection;

function isConnected(){
    return typeof mongoDbConnection !== "undefined";
}

module.exports = {
    "getOrReuseMongoDbConnection": function () {
        if (!isConnected()) {
            mongoDbConnection = mongo.connect(mongoUrl);
        }
        return mongoDbConnection;

    }
};