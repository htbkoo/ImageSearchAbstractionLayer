/**
 * Created by Hey on 15 Jun 2017
 */
var uuidv4 = require('uuid/v4');

module.exports = {
    "generate": function () {
        return uuidv4();
    }
};