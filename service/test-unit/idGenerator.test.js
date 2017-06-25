/**
 * Created by Hey on 16 Jun 2017
 */
var test = require('chai');
var rewire = require('rewire');

var idGenerator = rewire('../idGenerator');

describe("idGenerator", function () {
    var uuidv4, nextReturnedId;

    beforeEach(function () {
        uuidv4 = idGenerator.__get__('uuidv4');
        idGenerator.__set__('uuidv4', function () {
            return nextReturnedId;
        });
    });

    afterEach(function () {
        idGenerator.__set__('uuidv4', uuidv4);
    });

    [
        "anId",
        "someOtherId"
    ].forEach(function (expectedId) {
        it("should be able to generate new uuid without parameter", function () {
            //    given
            nextReturnedId = expectedId;

            //    when
            var nextId = idGenerator.generate();

            //    then
            test.expect(nextId).to.equal(expectedId);
        });
    });
});