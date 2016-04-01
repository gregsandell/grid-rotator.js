var assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

function getValidTestData() {
    return {
        data: {
            rows: [
                {
                    foo: 'one',
                    wow: 'two',
                    sniff: 'three',
                    value: '2'
                },
                {
                    foo: 'two',
                    wow: 'two',
                    sniff: 'three',
                    value: '2'
                }

            ],
            topics: [{key: 'foo', title: '1'}, {key: 'wow', title: '1'}, {key: 'sniff', title: '1'}],
            maps: {
                foo: {one: {long: 1, short: 2}, two: {long: 1, short: 2}},
                wow: {two: {long: 1, short: 2}},
                sniff: {three: {long: 1, short: 2}}
            }
        },
        options: {xParam: 'foo', yParam: 'wow', topicParam: 'sniff', topicSelected: 'three'}
    };
}
describe("GridRotator tests", function () {
    var suite;

    beforeEach(function () {
        suite = {};
        suite.sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        suite.sandbox.restore();
        suite = null;
    });

    it("Fails as expected with no data", function () {
        try {
            gridRotator.init({}, {});
            assert.isNotOk(true, 'Expected error not thrown');
        } catch (e) {
            assert.isOk(true, 'Caught expected error');
        }
    });

    it("Outputs empty table with empty data", function () {
        var gridSource = {
            data: {
                rows: [],
            },
            maps: {}
        };
        gridRotator.init(gridSource, {});
        var $generatedHtml = gridRotator.generateView('No Caption');
        console.log($generatedHtml.html());
        assert.equal($generatedHtml.find('table').length, 1);
        assert.equal($generatedHtml.find('table caption').html(), 'No Caption');
        assert.equal($generatedHtml.find('table thead').length, '1');
        assert.equal($generatedHtml.find('table tbody').length, '1');
    });

    describe('Validates options and input data', function () {

        var goodOptions,
            badOptions,
            goodData,
            badData,
            result,
            i,
            validateOptions,
            extraText;

        beforeEach(function () {
            suite.sandbox.spy(console, 'warn');
        });

        function validateSuite(validateOptions) {
            extraText = validateOptions.noisy ? ', with console output' : ', no console output';

            it("Accepts good options" + extraText, function () {
                var gridSource = {
                    data: {
                        rows: [],
                    },
                    maps: {}
                };
                goodOptions = getValidTestData().options;
                result = gridRotator.validateOptions(goodOptions, validateOptions);
                assert.equal(result, true);
                console.warn.called.should.be[false];
            });

            it("Complains about empty options" + extraText, function () {

                badOptions = getValidTestData().options;
                delete badOptions.xParam;
                result = gridRotator.validateOptions(badOptions, validateOptions);
                assert.equal(result, false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Accepts good input data" + extraText, function () {
                goodData = getValidTestData().data;
                assert.equal(gridRotator.validateJsonSchema(goodData, validateOptions), true);
                console.warn.called.should.not.be.true;
            });

            it("Complains about missing input data" + extraText, function () {
                badData = undefined;
                assert.equal(gridRotator.validateJsonSchema(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about missing top level elements in input data" + extraText, function () {
                badData = getValidTestData().options;
                delete badData.rows;
                assert.equal(gridRotator.validateJsonSchema(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about bad type of rows data" + extraText, function () {
                badData = getValidTestData().data;
                badData.rows = 1;
                assert.equal(gridRotator.validateJsonSchema(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about incomplete maps data" + extraText, function () {
                badData = getValidTestData().data;
                badData.maps = {foo: 1, bar: 2};  // Must be three fields
                assert.equal(gridRotator.validateJsonSchema(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about wrong type for \'topics\' field" + extraText, function () {
                badData = getValidTestData().data;
                badData.topics = 1;  // must be array
                assert.equal(gridRotator.validateJsonSchema(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about wrong object fields in items of \'topics\' array" + extraText, function () {
                badData = getValidTestData().data;
                badData.topics = [{key: 'foo', title: 'bar'}, {key: 'foo', title: 'bar'}, {
                    bad: 'foo',
                    horrible: 'bar'
                }];
                assert.equal(gridRotator.validateJsonSchema(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about wrong object fields in items of \'topics\' array" + extraText, function () {
                badData = getValidTestData().data;
                badData.topics = [{key: 'foo', title: 'bar'}, {key: 'foo', title: 'bar'}, {
                    bad: 'foo',
                    horrible: 'bar'
                }];
                assert.equal(gridRotator.validateJsonSchema(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about wrong object fields in items of \'topics\' array" + extraText, function () {
                badData = getValidTestData().data;
                badData.topics[0].key = 'foof';  // supposed to be 'foo'
                assert.equal(gridRotator.validateJsonSchema(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about item in maps having missing data parameters" + extraText, function () {
                badData = getValidTestData().data;
                badData.maps.foo = {};  // supposed to contain fields
                assert.equal(gridRotator.validateJsonSchema(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about empty data elements in elements of \'maps\' field" + extraText, function () {
                badData = getValidTestData().data;
                badData.maps.foo.two = 1;  // supposed to an object
                assert.equal(gridRotator.validateInputData(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about bad fields in objects of \'maps\' field" + extraText, function () {
                badData = getValidTestData().data;
                badData.maps.foo.one = {longg: 1, shoort: 2};  // should be 'long' and 'short'
                assert.equal(gridRotator.validateInputData(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about bad fields in objects of \'maps\' field" + extraText, function () {
                badData = getValidTestData().data;
                badData.maps.foo.one = {longg: 1, shoort: 2};  // should be 'long' and 'short'
                assert.equal(gridRotator.validateInputData(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about missing fields in \'row\' object" + extraText, function () {
                badData = getValidTestData().data;
                badData.rows[0] = {foo: 1, wow: 2, sniff: 3}; // missing 'value' field
                assert.equal(gridRotator.validateInputData(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about non-string fields in \'row\' object" + extraText, function () {
                badData = getValidTestData().data;
                badData.rows[0] = {foo: "1", wow: "2", sniff: 3}; // all must be strings
                assert.equal(gridRotator.validateInputData(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about wrong type for \'value\' field in \'row\' object" + extraText, function () {
                badData = getValidTestData().data;
                badData.rows[0] = {foo: "1", wow: "2", sniff: "3", value: {wow: 2}}; // all must be strings
                assert.equal(gridRotator.validateInputData(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about value for a field in \'row\' object not being registered in \'maps\' object" + extraText, function () {
                badData = getValidTestData().data;
                badData.rows[0] = {foo: "one", wow: "two", sniff: "weird", value: 2}; // sniff should be 'three'
                assert.equal(gridRotator.validateInputData(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });

            it("Complains about value for a field in \'row\' object not being registered in \'maps\' object" + extraText, function () {
                badData = getValidTestData().data;
                badData.rows[0] = {foo: "one", wow: "two", sniff: "weird", value: 2}; // sniff should be 'three'
                assert.equal(gridRotator.validateInputData(badData, validateOptions), false);
                console.warn.called.should.be[validateOptions.noisy];
            });
        }

        for (i = 0; i < 2; i++) {
            validateOptions = {noisy: (i === 0)};
            validateSuite(validateOptions);
        }

    });

    it("Outputs expected map data", function () {
        var chosenCityKey = "cityKey1";
        var chosenValue = "9";
        var tableCaption = 'The City of Palo Alto';
        var yearLongName = 'The Year of 1996';
        var yearShortName = '1996';
        var datafieldLongName = 'City Revenue';
        var gridOptions = {
            "yParam": "datafield",
            "xParam": "timeperiod",
            "topicParam": "geog",
            "topicSelected": chosenCityKey
        };
        var sampleData = {
            "rows": [
                {
                    "datafield": "city_revenue",
                    "timeperiod": "1996Key1",
                    "value": chosenValue,
                    "geog": chosenCityKey
                },
                {
                    "datafield": "city_revenue",
                    "timeperiod": "1996Key1",
                    "value": "10",
                    "geog": "cityKey2"
                },
                {
                    "datafield": "city_revenue",
                    "timeperiod": "1996Key1",
                    "value": "11",
                    "geog": "cityKey2"
                }
            ],
            "topics": [
                {"key": "datafield", "title": "Topic"},
                {"key": "timeperiod", "title": "Year"},
                {"key": "geog", "title": "City"}
            ],
            maps: {
                datafield: {"city_revenue": {long: datafieldLongName, short: 'Revenue'}},
                timeperiod: {"1996Key1": {long: yearLongName, short: yearShortName}},
                geog: {
                    "cityKey1": {short: 'Palo Alto', long: tableCaption},
                    "cityKey2": {short: 'Brisbane', long: 'The City of Brisbane'},
                    "cityKey3": {short: 'San Diego', long: 'The City of San Diego'}
                }
            }
        };
        gridRotator.init(sampleData, gridOptions);

        var $generatedHtml = gridRotator.generateView(sampleData.maps.geog[gridOptions.topicSelected].long);
        console.log($generatedHtml.html());
        assert.equal(sampleData.maps.geog[gridOptions.topicSelected].long, tableCaption);
        assert.equal($generatedHtml.find('table').length, 1);
        assert.equal($generatedHtml.find('table caption').html(), tableCaption);
        assert.equal($generatedHtml.find('table tbody tr').length, 1);
        assert.equal($generatedHtml.find('table thead tr th:nth-child(2)').html(), yearLongName);
        assert.equal($generatedHtml.find('table tbody tr:nth-child(1) td:nth-child(1)').html(), datafieldLongName);
        assert.equal($generatedHtml.find('table tbody tr:nth-child(1) td:nth-child(2)').html(), chosenValue);
    });
});
