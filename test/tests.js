var assert = chai.assert,
    expect = chai.expect,
    should = chai.should();


// TODO:  lots of variable name changes will break current tests
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

    describe('Tests for acceptable options', function () {

        beforeEach(function () {
            suite.sandbox.spy(console, 'warn');
        });

        it("Accepts good options", function () {
            var gridSource = {
                data: {
                    rows: [],
                },
                maps: {}
            };
            var badOptions = {xParam: 'foo', yParam: 'bar', topicParam: 'wow'};
            gridRotator.init(gridSource, badOptions);
            gridRotator.validateOptions(badOptions);
            console.warn.called.should.be.false;
        });

        it("Complains about bad options", function () {

            var gridSource = {
                data: {
                    rows: [],
                },
                maps: {}
            };
            var badOptions = {};
            gridRotator.init(gridSource, badOptions);
            gridRotator.validateOptions(badOptions);
            console.warn.called.should.be.true;
        });

        it("tests for incomplete input data", function () {
            var sampleData = {};
            gridRotator.verifyInputData(sampleData);
            console.warn.called.should.be.true;
        });

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
        gridRotator = gridRotator;
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
