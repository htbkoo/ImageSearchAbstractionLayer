/**
 * Created by Hey on 15 Jul 2017
 */
var test = require('chai');
var sinon = require('../test-util/sinonTestHelper').sinon;

var imageSearchService = require('../imageSearchService');
var pixabayImageSearcher = require('../pixabayImageSearcher');

describe("imageSearchService", function () {
    it("should return search results in searchAndPersist", sinon.test(function () {
        //    given
        var stub_pixabayImageSearcher = sinon.stub(pixabayImageSearcher, 'search');
        var someResults = {
            "url": "http://i3.kym-cdn.com/photos/images/newsfeed/000/024/741/lolcats-funny-picture-lalalalala.jpg",
            "snippet": "Image - 24741] | LOLcats | Know Your Meme",
            "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmiqU8mQTLyQ5aaOIuf4jglqdWUvdaPC3mhYrI54GS29Dq0UTBhzYTqLHe",
            "context": "http://knowyourmeme.com/photos/24741-lolcats"
        };
        stub_pixabayImageSearcher.withArgs("someQuery").returns(Promise.resolve(someResults));

        //    when
        var promise = imageSearchService.searchAndPersist("someQuery");

        //    then
        return promise.then(function(actualResults){
            test.expect(actualResults).to.deep.equal(someResults);
        }).catch()
    }));
});