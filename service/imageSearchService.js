/**
 * Created by Hey on 15 Jul 2017
 */
var pixabayImageSearcher = require('./pixabayImageSearcher');
var queryPersister = require('./queryPersister');
var KEPT_FIELDS_FOR_PIXABAY_RESULTS = ["tags", "previewURL", "pageURL"];

module.exports = {
    "searchAndPersist": function (query, offset) {
        offset = (typeof offset !== "undefined") ? offset : 1;
        var promise = queryPersister.tryLoadCache(query, offset)
            .then(function (result) {
                if (isCacheFound(result)) {
                    console.log("cache found - would retrieve from cache instead of fetching externally");
                    return Promise.resolve(result);
                } else {
                    return pixabayImageSearcher.search(query, offset)
                        .then(function (result) {
                            return queryPersister.persist.cache(query, offset, result);
                        });
                }
            });

        return promise
            .then(function (result) {
                return queryPersister.persist.query(query, result);
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

function isCacheFound(result) {
    return typeof result !== "undefined" && result !== null;
}