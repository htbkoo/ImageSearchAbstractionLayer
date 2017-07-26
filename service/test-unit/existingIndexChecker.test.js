/**
 * Created by Hey on 26 Jul 2017
 */

var test = require('chai');

var existingIndexChecker = require("../existingIndexChecker");

describe("existingIndexChecker", function () {
    it("should return true if existing index already contains the key of the index to add", function () {
        //    Given
        var withKey_Indexes = require("./resources/mongoDB_withIndexes_response.json");
        var keyToAdd = {"key": {"timestamp": 1}};

        //    When
        var isContainsKey = existingIndexChecker(withKey_Indexes).containsKey(keyToAdd);

        //    Then
        test.expect(isContainsKey).to.be.true;
    });

    it("should return false if existing index does not contain the key of the index to add", function () {
        //    Given
        var withoutKey_Indexes = require("./resources/mongoDB_withoutIndexes_response.json");
        var keyToAdd = {"key": {"timestamp": 1}};

        //    When
        var isContainsKey = existingIndexChecker(withoutKey_Indexes).containsKey(keyToAdd);

        //    Then
        test.expect(isContainsKey).to.be.false;
    })
});