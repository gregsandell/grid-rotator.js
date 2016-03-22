var datagrid;


QUnit.module('data-rotator tests', {
    beforeEach: function (assert) {
        datagrid = new Datagrid();
        //assert.ok(true, "one extra assert per test");
    }, afterEach: function (assert) {
        //assert.ok(true, "and one extra assert after each test");
    }
});
QUnit.test( "Fails as expected with no data", function( assert ) {
    try {
        datagrid.initializeGrid({}, {});
        assert.ok(false, 'Expected error not thrown');
    } catch (e) {
        assert.ok(true, 'Caught expected error');
    }
});
QUnit.test( "Outputs empty table with empty data", function( assert ) {
    var gridSource = {
        data: {
            rows: []
        }
    };
    datagrid.initializeGrid(gridSource, {});
    var $generatedHtml = datagrid.generateView();
    assert.equal($generatedHtml.find('table').length, 1);
    assert.equal($generatedHtml.find('table tr').length, 1);
    assert.equal($generatedHtml.find('table tr th').html(), '');
});
QUnit.test( "Outputs expected table with minimal data", function( assert ) {
    //var topicDataAdapter = new TopicDataAdapter();
    //topicDataAdapter.adapt(responseData2);

    //console.log('responseData2 after adapt: ' + JSON.stringify(responseData2));


    //console.log('topic datafieldArray = ' + JSON.stringify(topicDataAdapter.getDatafieldArray()));
    //console.log('topic TimeperiodArray = ' + JSON.stringify(topicDataAdapter.getTimeperiodArray()));
    //console.log('topic GeographyArray = ' + JSON.stringify(topicDataAdapter.getGeographyArray()));
    //
    //console.log('after adapt, responseData = ' + JSON.stringify(responseData));
    var gridOptions = { "yParam": "datafield", "xParam": "timeperiod", "titleParam": "geog", "titleChoice": "17089", "suppressNAs": true};


    datagrid.initializeGrid(sampleData, gridOptions);
    var $generatedHtml = datagrid.generateView();
    console.log('html = ' + $generatedHtml.html());
    //assert.equal($generatedHtml.find('table').length, 1);
    //assert.equal($generatedHtml.find('table tr').length, 1);
    //assert.equal($generatedHtml.find('table tr th').html(), '');
});
