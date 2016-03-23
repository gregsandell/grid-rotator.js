function Datagrid(inputData, options) {
    var gridSource = inputData;
    var gridResult = {};
    var gridOptions = options;
    var self = this;

    /*
     * Arguments
     * inputData: GetCmapData service response data, after adapted by TopicDataAdapter
     * options:  Javascript object with the fields:
     *     titleParam:  the title to appear on the chart
     *     xParam: name of the field in inputData to treat as x values
     *     yParam: name of the field in inputData to treat as y values
     *     suppressNAs:  if true, eliminate any row and any column consisting only of "n/a" values
     */
    this.initializeGrid = function() {

        generateMaps();

        gridResult = generateGrid(gridOptions);
        //console.log('gridResult is now: ' + JSON.stringify(gridResult));
    }

    function generateMaps() {
        self[gridOptions.titleParam + 'Keys'] = mapToArray(gridSource.maps[gridOptions.titleParam]);
        self[gridOptions.xParam + 'Keys'] = mapToArray(gridSource.maps[gridOptions.xParam]);
        self[gridOptions.yParam + 'Keys'] = mapToArray(gridSource.maps[gridOptions.yParam]);
        //console.log('field = ' + gridOptions.titleParam + 'Keys');
        //console.log('datafieldKeys = ', self['datafieldKeys']);
    }

    /*
     * It's easier to iterate through an array than a hashmap.  This returns an "array version" of a hashmap.
     */
    // TODO This code is gross, simplify soon
    function mapToArray(map) {  // private
        //console.log('map input is ', map);
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

    /*
     * Generate a ready-to-print grid dataset based on the options.
     */
    function generateGrid() {   // TO DO should use private gridOptions instead of arg
        var xValues = [];
        var yValues = [];
        var result = {};

        if (!gridSource || !gridSource.data || !gridSource.data.rows || !gridSource.maps) {
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
            //console.log('is there an ' + gridOptions.xParam + ' field in above?');
            if ($.inArray(row[gridOptions.xParam], xValues) == -1) {
                //console.log('pushing row["' + gridOptions.xParam + '"] (' + row[gridOptions.xParam] + ') onto xValues');
                xValues.push(row[gridOptions.xParam]);
            }
            if ($.inArray(row[gridOptions.yParam], yValues) == -1) {
                yValues.push(row[gridOptions.yParam]);
            }
        });

        //console.log('xParam = ' + gridOptions.xParam + ', yParam = ' + gridOptions.yParam);
        //console.log('xValues are ' + JSON.stringify(xValues));
        //console.log('yValues are ' + JSON.stringify(yValues));

        //console.log('gridSource.data.rows is now ' + JSON.stringify(gridSource.data.rows));

        /* Prepare the data for the x-axis of the grid */
        result.x = [];
        //console.log('gridOptions.xParam is ' + gridOptions.xParam);
        //console.log('loop going to iterate on xValues = ' + JSON.stringify(xValues));
        //console.log(gridOptions.xParam + ' map is' +  JSON.stringify(gridSource.maps[gridOptions.xParam]));
        $.each(xValues, function(i, xValue) {
            var long = gridSource.maps[gridOptions.xParam][xValue].long;
            var short = gridSource.maps[gridOptions.xParam][xValue].short;

            /* Careful, the 'long' field sometimes comes back  */
            result.x.push((short && short != "") ? short : long);
        });

        //console.log('result.x is now: ' + JSON.stringify(result.x));

        /* Prepare the data for the y-axis of the grid */
        var rows = [];
        //console.log('gridOptions.yParam is ' + gridOptions.yParam);
        $.each(yValues, function(i, yValue) {
            var row = {};
            var long = gridSource.maps[gridOptions.yParam][yValue].long;
            var short = gridSource.maps[gridOptions.yParam][yValue].short;
            row.y = (long && long != "") ? long : short;
            var values = [];
            $.each(xValues, function(j, xValue) {
                var v = "n/a";
                $.each(gridSource.data.rows, function(i, row) {
                    if (row[gridOptions.titleParam] == gridOptions.titleChoice && row[gridOptions.xParam] == xValue && row[gridOptions.yParam] == yValue) {
                        v = row.value;
                        values.push(v);
                        return false;
                    }
                });
            });
            row.v = values;
            rows.push(row);
        });
        result.rows = rows;
        return result;
    };

    this.generateView = function(caption) {
        //console.log('in generate view, gridResult is ' + JSON.stringify(gridResult));
        var empties = findEmpties();
        var suppressNAs = gridOptions.suppressNAs != undefined && gridOptions.suppressNAs;
        var dataview = $("<div>").addClass("dataview");
        var table = $("<table>");
        var caption = $('<caption>').text(caption);
        table.append(caption);
        var tbody = $('<tbody>');
        var tr = $("<tr>");
        tr.append($("<th>").text(""));
        $.each(gridResult.x, function(i, columnLabel) {
            if (suppressNAs && empties.x[i]) return true;
            tr.append($("<th>").text(columnLabel));
        });
        tbody.append(tr);
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
            tbody.append(tr);
        });
        table.append(tbody);
        dataview.append(table);
        return dataview;
    };

    function findEmpties() {
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

};
