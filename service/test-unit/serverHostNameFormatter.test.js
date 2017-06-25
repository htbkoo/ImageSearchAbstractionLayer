/**
 * Created by Hey on 21 Jun 2017
 */
var test = require('chai');
var rewire = require('rewire');

var serverHostNameFormatter = require('../serverHostNameFormatter');

describe("serverHostNameFormatter", function () {
    [
        "www.ahost.com",
        "localhost"
    ].forEach(function (hostName) {
        it("should be able to append protocol to hostName using default protocol (https)", function () {
            //    given

            //    when
            var result = serverHostNameFormatter.appendProtocolToHostName(hostName);

            //    then
            test.expect(result).to.equal("https://".concat(hostName));
        });
    });
});
