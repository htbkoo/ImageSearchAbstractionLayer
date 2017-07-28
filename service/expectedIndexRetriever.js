/**
 * Created by Hey on 26 Jul 2017
 */

module.exports = {
    "retrieve": function () {
        return JSON.parse(process.env.EXPECTED_INDEXES);
    }
};