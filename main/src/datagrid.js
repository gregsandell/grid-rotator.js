function Datagrid() {
    var gridSource = {};
    var gridResult = {};
    var gridOptions = {};
    var geographyArray = [];
    var timeperiodArray = [];
    var datafieldArray = [];

    if (typeof Datagrid.instance === 'object') {
        return Datagrid.instance;
    }
    Datagrid.instance = this;
        
    /*
     * Arguments
     * inputData: GetCmapData service response data, after adapted by TopicDataAdapter
     * options:  Javascript object with the fields:
     *     titleParam:  the title to appear on the chart
     *     xParam: name of the field in inputData to treat as x values
     *     yParam: name of the field in inputData to treat as y values
     *     suppressNAs:  if true, eliminate any row and any column consisting only of "n/a" values
     */
    this.initializeGrid = function(inputData, options) {
        //console.log('inputData is ' + JSON.stringify(inputData));
        gridOptions = options;
        gridSource = inputData;
        //console.log('in initialize');

        generateMaps();

        gridResult = generateGrid(gridOptions);
        //console.log('gridResult is now: ' + JSON.stringify(gridResult));
    };

    var generateMaps = function() {
        geographyArray = mapToArray(gridSource.data.geog_map);
        //console.log('finished making geographyArray');
        timeperiodArray = mapToArray(gridSource.data.timeperiod_map);
        datafieldArray = mapToArray(gridSource.data.datafield_map);
    };

    /*
     * It's easier to iterate through an array than a hashmap.  This returns an "array version" of a hashmap.
     */
    var mapToArray = function(map) {  // private
        console.log('map input is ', map);
        var result = [];
        var keys = [];
        for (var key in map) {
            //console.log('key is ' + key);
            if (map.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        keys.sort();
        //console.log('sorted keys are: ' + JSON.stringify(keys));
        for (i in keys) {
            var key = keys[i];
            var value = map[key];
            value.name = key;
            result.push(value);
        }
        return result;
    };

    this.setOptions = function(options) {   // TO DO Remove, noone is using (I think)
        gridOptions = options;
    };

    this.setGridSource = function(inputData) {   // TO DO Remove, noone is using (I think)
        gridSource = inputData;
    };

    /*
     * Generate a ready-to-print grid dataset based on the options.
     */
    var generateGrid = function(options) {   // TO DO should use private gridOptions instead of arg
        var titleParam = options.titleParam;
        var titleParam_map = titleParam + "_map";
        var titleChoice = options.titleChoice;
        var xParam = options.xParam;
        var xParam_map = xParam + "_map";
        var yParam = options.yParam;
        var yParam_map = yParam + "_map";
        var xValues = [];
        var yValues = [];
        var result = {};

        if (!gridSource || !gridSource.data || !gridSource.data.rows) {
            throw "Minimal data input requirement not met";
        }

        /* Make arrays of unique x and y values */
        //{
        //    geog_id: 'Bar geog id',
        //        dat_id: '32767',
        //    time_period: '2007'
        //}
        $.each(gridSource.data.rows, function(i, row) {
            //console.log('row is ' + JSON.stringify(row));
            //console.log('is there an ' + xParam + ' field in above?');
            if ($.inArray(row[xParam], xValues) == -1) {
                //console.log('pushing row["' + xParam + '"] (' + row[xParam] + ') onto xValues');
                xValues.push(row[xParam]);
            }
            if ($.inArray(row[yParam], yValues) == -1) {
                yValues.push(row[yParam]);
            }
        });

        console.log('xParam = ' + xParam + ', yParam = ' + yParam);
        console.log('xValues are ' + JSON.stringify(xValues));
        console.log('yValues are ' + JSON.stringify(yValues));

        //console.log('gridSource.data.rows is now ' + JSON.stringify(gridSource.data.rows));

        /* Prepare the data for the x-axis of the grid */
        result.x = [];
        //console.log('loop going to iterate on xValues = ' + JSON.stringify(xValues));
        //console.log('xParam_map= ' + xParam_map);
        $.each(xValues, function(i, xValue) {
            var long = gridSource.data[xParam_map][xValue].long;
            var short = gridSource.data[xParam_map][xValue].short;

            /* Careful, the 'long' field sometimes comes back  */
            result.x.push((long && long != "") ? long : short);
        });

        //console.log('result.x is now: ' + JSON.stringify(result.x));

        /* Prepare the data for the y-axis of the grid */
        var rows = [];
        //console.log('outer loop going to iterate on yValues = ' + JSON.stringify(yValues));
        //console.log('yParam_map is ' + yParam_map);  // datafield_map
        $.each(yValues, function(i, yValue) {  // ["population"]
            var row = {};
            var long = gridSource.data[yParam_map][yValue].long;   // 'The Population'
            var short = gridSource.data[yParam_map][yValue].short; // 'population'
            row.y = (long && long != "") ? long : short;           // 'The Population'
            var values = [];
            //console.log('inner loop going to iterate on xValues = ' + JSON.stringify(xValues));
            $.each(xValues, function(j, xValue) {  // ["glendora","azusa"]
                //console.log('outer loop: xValues = ' + xValue + ' being processed')
                var v = "n/a";
                $.each(gridSource.data.rows, function(i, row) {
                    //console.log('inner loop: row = ', row);

                    //var s = 'row["' + titleParam + '"] (' + row[titleParam] + ') and titleChoice ("' + titleChoice + '") are ";'
                    //console.log(s + (row[titleParam] == titleChoice ? 'equal' : 'NOT equal'));
                    //s = 'row["' + xParam + '"] (' + row[xParam] + ') and xValue ("' + xValue + '") are ";'
                    //console.log(s, (row[xParam] == xValue ? 'equal' : 'NOT equal'));
                    //s = 'row["' + yParam + '"] (' + row[yParam] + ') and yValue ("' + yValue + '") are ";'
                    //console.log(s + (row[yParam] == yValue ? 'equal' : 'NOT equal'));
                    //s = 'row["value"] = ' + row.value + ', we have '
                    //console.log(s + (row.value ? 'a value' : 'NO value'));
                    if (row[titleParam] == titleChoice && row[xParam] == xValue && row[yParam] == yValue) {
                        v = row.value;
                        //console.log('pushing value ' + v + ' onto values');
                        values.push(v);
                        //console.log('abandoning inner loop');
                        return false;
                    }
                });
                //console.log('at end of outer loop iteration, values = ' + JSON.stringify(values));
            });
            row.v = values;
            rows.push(row);
            //console.log('when outer loop is done, rows = ' + JSON.stringify(rows));
        });
        result.rows = rows;
        return result;
    };

    this.generateView = function() {
        var empties = findEmpties();
        var suppressNAs = gridOptions.suppressNAs != undefined && gridOptions.suppressNAs;
        var dataview = $("<div>").addClass("dataview");
        var table = $("<table>");
        var tr = $("<tr>");
        tr.append($("<th>").text(""));
        $.each(gridResult.x, function(i, columnLabel) {
            if (suppressNAs && empties.x[i]) return true;
            tr.append($("<th>").text(columnLabel));
        });
        table.append(tr);
        /* This is a hack to keep users from seeing rows of all n/a's.  It only works in non-flipped view.
         * You'll see the n/a's in columns if you flip */
        $.each(gridResult.rows, function(i, row) {
            if (suppressNAs && empties.y[i]) return true;
            tr = $("<tr>");
            tr.append($("<th>").text(row.y));
            $.each(row.v, function(i, value) {
                if (suppressNAs && empties.x[i]) return true;
                tr.append($("<td>").text(value));
            });
            table.append(tr);
        });
        dataview.append(table);
        return dataview;
    };

    var findEmpties = function() {
        var result = {};
        result.x = [];
        result.y = [];

        $.each(gridResult.x, function(i, x) {
            result.x[i] = true;
        });
        $.each(gridResult.rows, function(i, y) {
            result.y[i] = true;
        });
        $.each(gridResult.rows, function(i, record) {
            $.each(record.v, function(j, v) {
                result.y[i] = result.y[i] && (v == "n/a");
            });
        });
        $.each(result.x, function(i, x) {
            $.each(gridResult.rows, function(j, record) {
                result.x[i] = result.x[i] && (record.v[i] == "n/a");
            });
        });
        return result;
    };

    this.getGeographyArray = function() {  // public   TO DO  Just make geographyArray a public property
        return geographyArray;
    };

    this.getTimeperiodArray = function() {  // public  TO DO Just make timeperiodArray a public property
        return timeperiodArray;
    };

    this.getDatafieldArray = function() {  // public   TO DO just make datafieldArray a public property
        return datafieldArray;
    };

}
