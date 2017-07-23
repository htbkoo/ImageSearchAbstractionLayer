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

router.get('/search/*', function (req, res, next) {
    var query = req.params['0'];
    var offset = req.query.offset;
    imageSearchService.searchAndPersist(query, offset)
        .then(function (jsonResponse) {
                res.send(jsonResponse);
            }
        )
        .catch(function (err) {
            console.log(err);
            next(err);
        });
});

router.get('/latest', function (req, res, next) {
    var urlParam = req.params['0'];
    imageSearchService.latest()
        .then(function (jsonResponse) {
                res.send(jsonResponse);
            }
        )
        .catch(function (err) {
            console.log(err);
            next(err);
        });
});

module.exports = router;
