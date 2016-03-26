function Datagrid(inputData, options) {
    var gridSource = inputData,
        gridOptions,
        gridResult = {},
        self = this;

    this.setOptions = function(_options) {
        gridOptions = _options;
        validateOptions();
    };

    this.setOptions(options);

    //console.log('datagrid constructor, options = ', options);
    /*
     * Arguments
     * inputData:
     * options:  Javascript object with the fields:
     *     topicParam:  the title to appear on the chart
     *     xParam: name of the field in inputData to treat as x values
     *     yParam: name of the field in inputData to treat as y values
     *     suppressNAs:  if true, eliminate any row and any column consisting only of "n/a" values
     */
    this.init = function() {

        gridResult = generateGrid();
        //console.log('gridResult is now: ' + JSON.stringify(gridResult));
        //return gridResult;
    };
    /*
     * It's easier to iterate through an array than a hashmap.  This returns an "array version" of a hashmap.
     */
    this.mapToArray = function(dimension, sortType) {
        var result = [],
            keys = [],
            okDimensions = [gridOptions.topicParam, gridOptions.xParam, gridOptions.yParam],
            okTypes = ['key', 'long', 'short'],
            map = gridSource.maps[dimension],
            keys = Object.keys(map);

        if ($.inArray(dimension, okDimensions) == -1) {
            console.error('Datagrid error:  No such dimension \'' + dimension + '\'.  Acceptable values are ' +
                okDimensions.join(', ') + '.  Defaulting to \'' + gridOptions.topicParam + '\'');
            dimension = gridOptions.topicParam;
        }

        if ($.inArray(sortType, okTypes) == -1) {
            console.error('Datagrid error:  No such type \'' + sortType + '\'.  Acceptable values are ' +
                okTypes.join(', ') + '.  Defaulting to \'' + short + '\'');
            sortType = 'short';
        }

        $.each(keys, function(idx, key) {
            var record = map[key];
            record.key = key;
            result.push(record);
        });

        result.sort(function(a, b) {
            if (a[sortType] < b[sortType]) {
                return -1;
            } else if (a[sortType] > b[sortType]) {
                return 1;
            } else {
                return 0; }
        });
        return result;
    };

    /*
     * Generate a ready-to-print grid dataset based on the options.
     */
    function generateGrid() {   // TO DO should use private gridOptions instead of arg
        var xValues = [],
            yValues = [],
            result = {x: []},
            rows = [];

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
        //console.log('gridOptions.xParam is ' + gridOptions.xParam);
        //console.log('loop going to iterate on xValues = ' + JSON.stringify(xValues));
        //console.log(gridOptions.xParam + ' map is' +  JSON.stringify(gridSource.maps[gridOptions.xParam]));
        $.each(xValues, function(i, xValue) {
            var long = gridSource.maps[gridOptions.xParam][xValue].long;
            var short = gridSource.maps[gridOptions.xParam][xValue].short;

            /* Careful, the 'long' field sometimes comes back  */
            //result.x.push((short && short != "") ? short : long);
            result.x.push((long && long != "") ? long : short);
        });

        //console.log('result.x is now: ' + JSON.stringify(result.x));

        /* Prepare the data for the y-axis of the grid */
        $.each(yValues, function(i, yValue) {
            var row = {},
                long = gridSource.maps[gridOptions.yParam][yValue].long,
                short = gridSource.maps[gridOptions.yParam][yValue].short,
                values = [];

            row.y = (long && long != "") ? long : short;
            $.each(xValues, function(j, xValue) {
                var v = "n/a";
                //console.log('gridOptions before iterating on rows is ', gridOptions);
                $.each(gridSource.data.rows, function(i, row) {
                    //if (row[gridOptions.topicParam] == gridOptions.topicSelected) {
                    //    console.log('matching titles');
                    //} else {
                    //    console.log('unmatching titles, ' + row[gridOptions.topicParam] + ' and ');
                    //}
                    //var s = 'row["' + gridOptions.topicParam + '"] (' + row[gridOptions.topicParam] + ') and topicSelected ("' + gridOptions.topicSelected + '") are ';
                    //console.log(s + (row[gridOptions.topicParam] == gridOptions.topicSelected ? 'equal' : 'NOT equal'));
                    //s = 'row["' + gridOptions.xParam + '"] (' + row[gridOptions.xParam] + ') and xValue ("' + xValue + '") are ';
                    //console.log(s, (row[gridOptions.xParam] == xValue ? 'equal' : 'NOT equal'));
                    //s = 'row["' + gridOptions.yParam + '"] (' + row[gridOptions.yParam] + ') and yValue ("' + yValue + '") are ';
                    //console.log(s + (row[gridOptions.yParam] == yValue ? 'equal' : 'NOT equal'));
                    //s = 'row["value"] = ' + row.value + ', we have '
                    //console.log(s + (row.value ? 'a value' : 'NO value'));
                    //if (row[gridOptions.xParam] == undefined) console.log('undefined ' + gridOptions.xParam + ' field in row');
                    //if (xValue == undefined) console.log('undefined xValue');
                    //if (row[gridOptions.yParam] == undefined) console.log('undefined ' + gridOptions.yParam + ' field in row');
                    //if (yValue == undefined) console.log('undefined yValue');
                    if (row[gridOptions.topicParam] == gridOptions.topicSelected && row[gridOptions.xParam] == xValue && row[gridOptions.yParam] == yValue) {
                        v = row.value;
                        //console.log('push');
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
        var dataview = $("<div class='datagrid'>");
        var table = $("<table>");
        var caption = $('<caption>').text(caption);
        table.append(caption);
        var thead = $('<thead>');
        var tr = $("<tr>");
        tr.append($("<th>").text(""));
        $.each(gridResult.x, function(i, columnLabel) {
            if (suppressNAs && empties.x[i]) return true;
            tr.append($("<th>").text(columnLabel));
            thead.append(tr);
        });
        table.append(thead);
        var tbody = $("<tbody>");
        /* This is a hack to keep users from seeing rows of all n/a's.  It only works in non-flipped view.
         * You'll see the n/a's in columns if you flip */
        $.each(gridResult.rows, function(idx, row) {
            if (suppressNAs && empties.y[idx]) return true;
            var className = (idx % 2) == 1 ? 'alt' : '';
            tr = $("<tr class='" + className + "''>");
            tr.append($("<td>").text(row.y));
            $.each(row.v, function(jdx, value) {
                if (suppressNAs && empties.x[jdx]) return true;
                tr.append($("<td>").text(value));
            });
            tbody.append(tr);
        });
        table.append(tbody);
        dataview.append(table);
        return dataview;
    };

    function findEmpties() {
        var result = {x: [], y: []};

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

    function validateOptions() {
        var requiredOptions = {"xParam": false, "yParam": false, "topicParam": false},
            missing,
            opt;

        for (opt in requiredOptions) {
            requiredOptions[opt] = opt in gridOptions;
        }
        missing = $.map(Object.keys(requiredOptions), function(opt) {
            return !requiredOptions[opt] ? ("'" + opt + "'") : null;
        });
        if (missing.length > 0) {
            var optList = [missing.slice(0, -1).join(', '), missing.slice(-1)[0]].join(missing.length < 2 ? '' : ' and ');
            var s = 'Datagrid error:  Required fields ' + optList + ' are missing from the options object, so Datagrid will fail.';
            console.error(s);
        }
    }

};
