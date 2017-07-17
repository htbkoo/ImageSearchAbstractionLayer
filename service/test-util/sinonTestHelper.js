/**
 * Created by Hey on 17 Jul 2017
 */
var sinon = require('sinon');
var sinonTest = require('sinon-test');
sinon.test = sinonTest.configureTest(sinon);
sinon.testCase = sinonTest.configureTestCase(sinon);

module.exports = {
    'sinon': sinon,
    'sinonTest': sinonTest
};