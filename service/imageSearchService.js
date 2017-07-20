/**
 * Created by Hey on 15 Jul 2017
 */
var pixabayImageSearcher = require('./pixabayImageSearcher');
var queryPersister = require('./queryPersister');
var KEPT_FIELDS_FOR_PIXABAY_RESULTS = ["tags", "previewURL", "pageURL"];

module.exports = {
    "searchAndPersist": function (query, offset) {
        return pixabayImageSearcher.search(query, offset)
            .then(function (result) {
                return queryPersister.persist(query, result);
            })
            .then(function (result) {
                if (!("hits" in result)) {
                    console.log("ERROR: 'hits' not in result");
                }
                return result.hits.map(function (hit) {
                    return KEPT_FIELDS_FOR_PIXABAY_RESULTS.reduce(function (prev, field) {
                        prev[field] = hit[field];
                        return prev;
                    }, {});
                });
            });
    }
};