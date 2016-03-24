var assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

describe("Datagrid tests", function() {
    var suite;

    beforeEach(function () {
        suite = {};
        suite.sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        suite.sandbox.restore();
        suite = null;
        datagrid = null;
    });

    it("Fails as expected with no data", function () {
        suite.datagrid = new Datagrid({}, {});
        try {
            suite.datagrid.initializeGrid();
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
        suite.datagrid = new Datagrid(gridSource, {});
        suite.datagrid.initializeGrid();
        var $generatedHtml = suite.datagrid.generateView('No Caption');
        assert.equal($generatedHtml.find('table').length, 1);
        assert.equal($generatedHtml.find('table tr').length, 1);
        assert.equal($generatedHtml.find('table tr th').html(), '');
    });
    describe('Tests for acceptable options', function() {
        beforeEach(function() {
            suite.sandbox.spy(console, 'error');
        });
        it("Accepts good options", function () {
            var gridSource = {
                data: {
                    rows: [],
                },
                maps: {}
            };
            var badOptions = {xParam: 'foo', yParam: 'bar', titleParam: 'wow'};
            suite.datagrid = new Datagrid(gridSource, badOptions);
            expect(console.error).not.to.have.been.called;
        });
        it("Complains about bad options", function () {

            var gridSource = {
                data: {
                    rows: [],
                },
                maps: {}
            };
            var badOptions = {};
            suite.datagrid = new Datagrid(gridSource, badOptions);
            expect(console.error).to.have.been.called;
        });

    });
    it("Outputs expected map data", function () {
        var chosenCityKey = "cityKey1";
        var chosenValue = "9";
        var tableCaption = 'The City of Palo Alto';
        var yearLongName = 'The Year of 1996';
        var yearShortName = '1996';
        var datafieldLongName = 'City Revenue';
        var gridOptions = { "yParam": "datafield", "xParam": "timeperiod", "titleParam": "geog", "titleChoice": chosenCityKey, "suppressNAs": true};
        var sampleData = {
            "data": {
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
            },
            maps: {
                datafield: {"city_revenue": {long: datafieldLongName, short: 'Revenue'}},
                timeperiod: {"1996Key1": {long: yearLongName, short: yearShortName}},
                geog: {"cityKey1": {short: 'Palo Alto', long: tableCaption},
                    "cityKey2": {short: 'Brisbane', long: 'The City of Brisbane'},
                    "cityKey3": {short: 'San Diego', long: 'The City of San Diego'}
                }
            }
        };
        suite.datagrid = new Datagrid(sampleData, gridOptions);
        suite.datagrid.initializeGrid();

        var $generatedHtml = suite.datagrid.generateView(sampleData.maps.geog[gridOptions.titleChoice].long);
        assert.deepEqual(suite.datagrid.mapToArray(gridOptions.xParam, 'long'), [{"long": yearLongName,"key": "1996Key1","short": yearShortName}]);
        assert.deepEqual(suite.datagrid.mapToArray(gridOptions.yParam, 'long'), [{long: 'City Revenue', short: 'Revenue', key: 'city_revenue'}]);
        assert.deepEqual(suite.datagrid.mapToArray(gridOptions.titleParam, 'long'), [
            {
                "key": "cityKey2",
                "long": "The City of Brisbane",
                "short": "Brisbane"
            },
            {
                "key": "cityKey1",
                "long": tableCaption,
                "short": "Palo Alto"
            },
            {
                "key": "cityKey3",
                "long": "The City of San Diego",
                "short": "San Diego"
            }
        ]);
        assert.equal(sampleData.maps.geog[gridOptions.titleChoice].long, tableCaption);
        assert.equal($generatedHtml.find('table').length, 1);
        assert.equal($generatedHtml.find('table caption').html(), tableCaption);
        assert.equal($generatedHtml.find('table tr').length, 2);
        assert.equal($generatedHtml.find('table tr th:nth-child(2)').html(), yearShortName);
        assert.equal($generatedHtml.find('table tr:nth-child(2) th').html(), datafieldLongName);
    });
});
