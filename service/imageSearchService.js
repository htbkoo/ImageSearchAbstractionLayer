/**
 * Created by Hey on 15 Jul 2017
 */
var pixabayImageSearcher = require('./pixabayImageSearcher');
var queryPersister = require('./queryPersister');
var KEPT_FIELDS_FOR_PIXABAY_RESULTS = ["tags", "previewURL", "pageURL"];

module.exports = {
    "searchAndPersist": function (query, offset) {
        offset = (typeof offset !== "undefined") ? offset :1;
        return pixabayImageSearcher.search(query, offset)
            .then(function (result) {
                return queryPersister.persist.query(query, result);
            })
            .then(function(result){
                return queryPersister.persist.cache(query, offset, result);
            })
            .then(function (result) {
                return result.hits.map(function (hit) {
                    return KEPT_FIELDS_FOR_PIXABAY_RESULTS.reduce(function (prev, field) {
                        prev[field] = hit[field];
                        return prev;
                    }, {});
                });
            });
    },
    "latest": function () {
        return queryPersister.latest();
    }
};