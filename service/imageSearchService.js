/**
 * Created by Hey on 15 Jul 2017
 */
var pixabayImageSearcher = require('./pixabayImageSearcher');

module.exports = {
    "searchAndPersist": function (query) {
        return pixabayImageSearcher.search(query);
    }
};