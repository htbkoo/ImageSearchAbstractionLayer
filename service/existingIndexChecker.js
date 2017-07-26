/**
 * Created by Hey on 26 Jul 2017
 */

var deepEqual = require('deep-equal');

module.exports = function (existingIndexes) {
    return {
        "containsKey": function (indexToCreate) {
            return existingIndexes.some(function (exist) {
                return deepEqual(exist.key, indexToCreate.key);
            });
        }
    }
};