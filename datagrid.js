function Datagrid() {
    var gridSource = {};
    var gridResult = {};
    var gridOptions = {};

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
        gridOptions = options;
        gridSource = inputData;
        gridResult = generateGrid(gridOptions);
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

        /* Make arrays of unique x and y values */
        $.each(gridSource.data.rows, function(i, record) {
            if ($.inArray(record[xParam], xValues) == -1) {
                xValues.push(record[xParam]);
            }
            if ($.inArray(record[yParam], yValues) == -1) {
                yValues.push(record[yParam]);
            }
        });

        /* Prepare the data for the x-axis of the grid */
        result.x = [];
        $.each(xValues, function(i, xValue) {
            var long = gridSource.data[xParam_map][xValue].long;
            var short = gridSource.data[xParam_map][xValue].short;

            /* Careful, the 'long' field sometimes comes back  */
            result.x.push((long && long != "") ? long : short);
        });

        /* Prepare the data for the y-axis of the grid */
        var rows = [];
        $.each(yValues, function(i, yValue) {
            var row = {};
            var long = gridSource.data[yParam_map][yValue].long;
            var short = gridSource.data[yParam_map][yValue].short;
            row.y = (long && long != "") ? long : short;
            var values = [];
            $.each(xValues, function(j, xValue) {
                var v = "n/a";
                $.each(gridSource.data.rows, function(i, record) {
                    if (record[titleParam] == titleChoice && record[xParam] == xValue && record[yParam] == yValue) {
                        v = record.value;
                        return false;
                    }
                });
                values.push(v);
            });
            row.v = values;
            rows.push(row);
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
}
