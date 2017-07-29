var express = require('express');
var router = express.Router();

require('../service/mongoDbInitializer')
    .createIndexesIfMissing()
    .catch(function (err) {
        console.log("Error caught during mongoDbInitializer.createIndexesIfMissing() due to: " + err);
    });

var imageSearchService = require("../service/imageSearchService");
var serverHostNameFormatter = require("../service/serverHostNameFormatter");

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        "serverHostNameWithProtocol": getFullHostNameFromReq(req)
    });
});

router.get('/search/*', function (req, res, next) {
    var query = req.params['0'];
    var offset = req.query.offset;
    var promise = imageSearchService.searchAndPersist(query, offset);
    handlePromise(promise, res, next);
});

router.get('/latest', function (req, res, next) {
    var promise = imageSearchService.latest();
    handlePromise(promise, res, next);
});

function getFullHostNameFromReq(req) {
    return serverHostNameFormatter.appendProtocolToHostName(req.headers.host);
}

function handlePromise(promise, res, next) {
    promise.then(function (jsonResponse) {
        res.send(jsonResponse);
    }).catch(function (err) {
        console.log(err);
        next(err);
    });
}

module.exports = router;
