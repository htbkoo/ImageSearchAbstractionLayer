/**
 * Created by Hey on 17 Jul 2017
 */
require('dotenv').config();
var test = require('chai');
var sinon = require('../test-util/sinonTestHelper').sinon;

var rp = require('request-promise-native');

var pixabayImageSearcher = require('../pixabayImageSearcher');

describe("pixabayImageSearcher", function () {
    var PIXABAY_HOST_URL = 'https://pixabay.com/api/';

    it("should return search results in searchAndPersist", sinon.test(function () {
        //    given
        var stub_rp = this.stub(rp, 'get');
        var aQuery = "someQuery";
        var expectedOptions = {
            uri: PIXABAY_HOST_URL,
            qs: {
                key: process.env.PIXABAY_API_KEY,
                q: aQuery
            },
            json: true // Automatically parses the JSON string in the response
        };

        var mockResults = {
            "keyA": "valueA",
            "keyB": "valueB"
        };
        stub_rp.withArgs(sinon.match(expectedOptions)).returns(Promise.resolve(mockResults));

        //    when
        var promise = pixabayImageSearcher.search(aQuery);

        //    then
        return promise.then(function (actualResults) {
            test.expect(actualResults).to.deep.equal(mockResults);
        }).catch(function (err) {
            throw err;
        });
    }));
});