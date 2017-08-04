/**
 * Created by Hey on 26 Jul 2017
 */

require('dotenv').config();

var test = require('chai');

var expectedIndexRetriever = require("../expectedIndexRetriever");

describe("expectedIndexRetriever", function () {
    it("should return the EXPECTED_INDEXES in .env and parsed as an Array", function () {
        //    Given

        //    When
        var expectedIndex = expectedIndexRetriever.retrieve();

        //    Then
        test.expect(expectedIndex).to.be.an('Object');
        Object.keys(expectedIndex).forEach(function (collectionName) {
            test.expect(expectedIndex[collectionName].key).to.be.an('Object');
            test.expect(expectedIndex[collectionName].op).to.be.an('Object');
        });
    });
});