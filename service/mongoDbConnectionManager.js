/**
 * Created by Hey on 21 Jul 2017
 */

var mongo = require('mongodb').MongoClient;
var mongoUrl = process.env.MONGO_URL;

module.exports = {
    "getMongoDbConnection": function () {
        return mongo.connect(mongoUrl);
    }
};