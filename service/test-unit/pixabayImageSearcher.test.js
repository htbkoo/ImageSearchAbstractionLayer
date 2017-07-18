/**
 * Created by Hey on 17 Jul 2017
 */
require('dotenv');
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
            "total": 4692,
            "totalHits": 500,
            "hits": [
                {
                    "id": 195893,
                    "pageURL": "https://pixabay.com/en/blossom-bloom-flower-yellow-close-195893/",
                    "type": "photo",
                    "tags": "blossom, bloom, flower",
                    "previewURL": "https://static.pixabay.com/photo/2013/10/15/09/12/flower-195893_150.jpg",
                    "previewWidth": 150,
                    "previewHeight": 84,
                    "webformatURL": "https://pixabay.com/get/35bbf209db8dc9f2fa36746403097ae226b796b9e13e39d2_640.jpg",
                    "webformatWidth": 640,
                    "webformatHeight": 360,
                    "imageWidth": 4000,
                    "imageHeight": 2250,
                    "imageSize": 4731420,
                    "views": 7671,
                    "downloads": 6439,
                    "favorites": 1,
                    "likes": 5,
                    "comments": 2,
                    "user_id": 48777,
                    "user": "Josch13",
                    "userImageURL": "https://static.pixabay.com/user/2013/11/05/02-10-23-764_250x250.jpg"
                },
                {
                    "id": 14724
                }
            ]
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