/**
 * Created by Hey on 17 Jul 2017
 */
var rp = require('request-promise-native');

var PIXABAY_HOST_URL = 'https://pixabay.com/api/';

module.exports = {
    "search": function (query, offset) {
        offset = (typeof offset !== "undefined") ? offset : 1;
        var options = {
            uri: PIXABAY_HOST_URL,
            qs: {
                key: process.env.PIXABAY_API_KEY,
                q: query,
                page: offset
            },
            json: true // Automatically parses the JSON string in the response
        };

        console.log("fetching from " + PIXABAY_HOST_URL + " for q=" + query + " & page=" + offset);
        return rp.get(options);
    }
};