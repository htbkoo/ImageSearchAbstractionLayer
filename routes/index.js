var express = require('express');
var router = express.Router();

var imageSearchService = require("../service/imageSearchService");
var serverHostNameFormatter = require("../service/serverHostNameFormatter");

/* GET home page. */
function getFullHostNameFromReq(req) {
    return serverHostNameFormatter.appendProtocolToHostName(req.headers.host);
}

router.get('/', function (req, res) {
    res.render('index', {
        "serverHostNameWithProtocol": getFullHostNameFromReq(req)
    });
});

router.get('/search/*', function (req, res) {
    var query = req.params['0'];
    imageSearchService.searchAndPersist(query)
        .then(function (jsonResponse) {
                res.send(jsonResponse);
            }
        );
});

router.get('/latest', function (req, res) {
    var urlParam = req.params['0'];
    imageSearchService.latest()
        .then(function (jsonResponse) {
                res.send(jsonResponse);
            }
        );
});

module.exports = router;
