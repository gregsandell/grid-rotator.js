var datagrid;


QUnit.module('data-rotator tests', {
    beforeEach: function (assert) {
        //assert.ok(true, "one extra assert per test");
    }, afterEach: function (assert) {
        //assert.ok(true, "and one extra assert after each test");
    }
});
QUnit.test( "Fails as expected with no data", function( assert ) {
    datagrid = new Datagrid({}, {});
    try {
        datagrid.initializeGrid();
        assert.ok(false, 'Expected error not thrown');
    } catch (e) {
        assert.ok(true, 'Caught expected error');
    }
});
QUnit.test( "Outputs empty table with empty data", function( assert ) {
    var gridSource = {
        data: {
            rows: [],
        },
        maps: {}
    };
    datagrid = new Datagrid(gridSource, {});
    datagrid.initializeGrid();
    var $generatedHtml = datagrid.generateView('No Caption');
    assert.equal($generatedHtml.find('table').length, 1);
    assert.equal($generatedHtml.find('table tr').length, 1);
    assert.equal($generatedHtml.find('table tr th').html(), '');
});
QUnit.test("Reports incomplete options", function( assert ) {
    var badOptions = {};
    datagrid = new Datagrid(gridSource, badOptions);
});

QUnit.test("Outputs expected map data", function( assert ) {
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
    datagrid = new Datagrid(sampleData, gridOptions);
    datagrid.initializeGrid();

    var $generatedHtml = datagrid.generateView(sampleData.maps.geog[gridOptions.titleChoice].long);
    assert.deepEqual(datagrid.mapToArray(gridOptions.xParam, 'long'), [{"long": yearLongName,"key": "1996Key1","short": yearShortName}]);
    assert.deepEqual(datagrid.mapToArray(gridOptions.yParam, 'long'), [{long: 'City Revenue', short: 'Revenue', key: 'city_revenue'}]);
    assert.deepEqual(datagrid.mapToArray(gridOptions.titleParam, 'long'), [
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
        }    ]);
    console.log('html = ' + $generatedHtml.html());
    assert.equal(sampleData.maps.geog[gridOptions.titleChoice].long, tableCaption);
    assert.equal($generatedHtml.find('table').length, 1);
    assert.equal($generatedHtml.find('table caption').html(), tableCaption);
    assert.equal($generatedHtml.find('table tr').length, 2);
    assert.equal($generatedHtml.find('table tr th:nth-child(2)').html(), yearShortName);
    assert.equal($generatedHtml.find('table tr:nth-child(2) th').html(), datafieldLongName);
});
