var gridRotator = (function () {

    var gridSource,
        gridOptions,
        gridResult = {},
        self = this,
        APPNAME = 'grid-rotator',
        validator;

    function setOptions(_options) {  // public
        gridOptions = _options;
    }

    /*
     * Arguments
     * inputData:
     * options:  Javascript object with the fields:
     *     topicParam:  the title to appear on the chart
     *     xParam: name of the field in inputData to treat as x values
     *     yParam: name of the field in inputData to treat as y values
     */
    function init(_gridSource, _gridOptions) {  // public
        gridSource = _gridSource;
        gridOptions = _gridOptions;
        gridResult = generateGrid();
    }

    /*
     * Generate a ready-to-print grid dataset based on the options.
     */
    function generateGrid() {  // private
        var xValues = [],
            yValues = [],
            result = {x: []},
            rows = [];

        //if (!gridSource || !gridSource.data || !gridSource.data.rows || !gridSource.maps) {
        //    throw "Minimal data input requirement not met";
        //}

        /* Make arrays of unique x and y values */
        $.each(gridSource.rows, function (i, row) {
            if ($.inArray(row[gridOptions.xParam], xValues) == -1) {
                xValues.push(row[gridOptions.xParam]);
            }
            if ($.inArray(row[gridOptions.yParam], yValues) == -1) {
                yValues.push(row[gridOptions.yParam]);
            }
        });

        /* Prepare the data for the x-axis of the grid */
        $.each(xValues, function (i, xValue) {
            var long = gridSource.maps[gridOptions.xParam][xValue].long;
            var short = gridSource.maps[gridOptions.xParam][xValue].short;

            result.x.push((long && long != "") ? long : short);
        });

        /* Prepare the data for the y-axis of the grid */
        $.each(yValues, function (i, yValue) {
            var row = {},
                long = gridSource.maps[gridOptions.yParam][yValue].long,
                short = gridSource.maps[gridOptions.yParam][yValue].short,
                values = [];

            row.y = (long && long != "") ? long : short;
            $.each(xValues, function (j, xValue) {
                var v = "";
                //console.log('gridOptions before iterating on rows is ', gridOptions);
                $.each(gridSource.rows, function (i, row) {
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
                if (v === "") {
                    values.push('n/a');
                }
            });
            row.v = values;
            rows.push(row);
        });
        result.rows = rows;
        return result;
    };

    function getGridResult() {  // public
        return gridResult;
    };

    function generateView(caption) {
        var dataview = $("<div class='datagrid'>");
        var table = $("<table>");
        var caption = $('<caption>').text(caption);
        table.append(caption);
        var thead = $('<thead>');
        var tr = $("<tr>");
        tr.append($("<th>").text(""));
        $.each(gridResult.x, function (i, columnLabel) {
            tr.append($("<th>").text(columnLabel));
            thead.append(tr);
        });
        table.append(thead);
        var tbody = $("<tbody>");
        $.each(gridResult.rows, function (idx, row) {
            var className = (idx % 2) == 1 ? 'alt' : '';
            tr = $("<tr class='" + className + "''>");
            tr.append($("<td>").text(row.y));
            $.each(row.v, function (jdx, value) {
                tr.append($("<td>").text(value));
            });
            tbody.append(tr);
        });
        table.append(tbody);
        dataview.append(table);
        return dataview;
    };

    validator = (function () {

        function isObject(item) {
            return (typeof item !== 'null') && (typeof item === 'object') && (typeof item !== 'array') &&
                (typeof item != 'function');
        }

        function isValidKey(key) {
            return typeof key === 'string' && key.length > 0;
        }

        function isValidTopic(topic) {
            return typeof topic.key === 'string' && typeof topic.title === 'string' &&
                isValidKey(topic.key) && topic.title.length > 0;
        }

        function verifyJsonSchema(_data) {
            var verifiers = [
                function () {
                    return isObject(_data) || 'input data is not an object';
                },
                function () {
                    return Object.keys(_data).length == 3 && typeof _data.maps !== 'undefined' && typeof _data.topics != 'undefined' &&
                        typeof _data.rows !== 'undefined' || 'input object must contain fields \'rows\', \'topics\', and \'maps\'';
                },
                function () {
                    return $.isArray(_data.rows) || '\'data.rows\' field is not an array'
                },
                function () {
                    return isObject(_data.maps) && Object.keys(_data.maps).length === 3 || '\'maps\' is not an object with three fields'
                },
                function () {
                    return $.isArray(_data.topics) || '\'topics\' field must be an array'
                },
                function () {
                    return _data.topics.length == 3 || '\'data.topics\' array is not three items'
                },
                function () {
                    return isObject(_data.topics[0]) && isObject(_data.topics[1]) &&
                        isObject(_data.topics[2]) || 'items in \'data.topics[]\' are not objects'
                },
                function () {
                    return isValidTopic(_data.topics[0]) && isValidTopic(_data.topics[1]) &&
                        isValidTopic(_data.topics[2]) || 'objects in \'data.topics[]\' lack usable \'key\' and \'title\' fields'
                },
                function () {
                    var i;

                    for (i = 0; i < _data.topics.length; i++) {
                        if (!isObject(_data.maps[_data.topics[i].key])) {
                            return '\'' + _data.topics[i].key + '\' is not an object field in \'maps\'';
                        }
                    }
                    return true;
                },
                function() {
                    var i;

                    for (i = 0 ; i < _data.topics.length; i++) {
                        if (Object.keys(_data.maps[_data.topics[i].key]).length === 0) {
                            return '\'maps.' + _data.topics[i].key + '\' should have at least one field'
                        }
                    }
                    return true;
                }
            ];

            var result;
            $.each(verifiers, function (idx, verifier) {
                if (typeof (result = verifier()) === 'string') {
                    return false;
                }
            });
            if (typeof result === 'string') {
                console.warn(APPNAME = ' input data validation: ' + result);
                return false;
            }
            return true;
        }

        function verifyInputData(_data) {
            if (!verifyJsonSchema(_data)) {
                return;
            }
            //if (!_data.maps || !_data.topics || !$.jquery.isArray(_data.topics) ||
            //    _data.topics.length != 3 || !_data.data || !_data.rows || !$.isArray(_data.rows)) {
            //    console.warn(APPNAME = ' input data validation: input data is incomplete.');
            //    return;
            //}
            var topic1 = _data.topics[0].key,
                topic2 = _data.topics[1].key,
                topic3 = _data.topics[2].key,
                dim1Keys = Object.keys(_data.maps[topic1]),
                dim2Keys = Object.keys(_data.maps[topic2]),
                dim3Keys = Object.keys(_data.maps[topic3]),
                expectedCount = dim1Keys.length * dim2Keys.length * dim3Keys.length,
                actualCount = 0,
                rowsCopy = JSON.parse(JSON.stringify(_data.rows)),
                missingTuples = [];

            var done = false;
            $.each(_data.maps, function (key, value) {
                $.each(value, function (key2, value2) {
                    if (!isObject(value2)) {
                        console.warn(APPNAME + ' validation error: \'maps.' + key + '.' + key2 + '\' must be an object');
                        done = true;
                        return false;
                    }
                    if (typeof _data.maps[key][key2].long === 'undefined' || typeof _data.maps[key][key2].short === 'undefined') {
                        console.warn(APPNAME + ' validation error: \'maps.' + key + '.' + key2 +
                            '\' must contain fields \'long\' and \'short\'');
                        done = true;
                        return false;
                    }
                });
                if (done) {
                    return false;
                }
            });

            $.each(_data.rows, function (idx, row) {
                if (typeof row[topic1] === 'undefined' || typeof row[topic2] === 'undefined' ||
                    typeof row[topic3] === 'undefined' || typeof row.value === 'undefined') {
                    console.warn(APPNAME + ' error: each object of array \'rows\' must contain fields \'' +
                        topic1 + '\', \'' + topic2 + '\', \'' + topic3 + '\' and \'value\'');
                    return false;
                }
                if (typeof row[topic1] !== 'string' || typeof row[topic2] !== 'string' ||
                    typeof row[topic3] !== 'string') {
                    console.warn(APPNAME + ' validation error: fields \'' + topic1 + '\', \'' + topic2 + '\', and \'' + topic3 +
                        '\' each object of array \'rows\' must be strings');
                    return false;
                }
                done = false;
                $.each([topic1, topic2, topic3], function (idx, topic) {
                    if (typeof _data.maps[topic] == 'undefined') {
                        console.warn(APPNAME + ' validation error: value \'' + row[topic] + '\' in item in \'rows\' is not ' +
                            'registered in the \'maps\' object');
                        done = true;
                        return false;
                    }
                    if ($.inArray(row[topic], Object.keys(_data.maps[topic])) == -1) {
                        console.warn(APPNAME + ' validation error: field \'' + topic + '\' of each object of array \'rows\' ' +
                            'must be one of: ' + Object.keys(_data.maps[topic]).joinAnd('or'));
                        done = true;
                        return false;
                    }
                });
                if (done) {
                    return false;
                }
            });

            $.each(dim1Keys, function (idx, dim1Key) {
                $.each(dim2Keys, function (jdx, dim2Key) {
                    $.each(dim3Keys, function (kdx, dim3Key) {
                        var foundIdx = undefined;
                        $.each(rowsCopy, function (mdx, row) {
                            //if (topic1 in row && topic2 in row && topic3 in row) {
                            if (row[topic1] === dim1Key && row[topic2] === dim2Key && row[topic3] === dim3Key) {
                                foundIdx = mdx;
                                ++actualCount;
                                return false;
                            }
                        });
                        if (typeof foundIdx === "undefined") {
                            missingTuples.push("[" + dim1Key + "][" + dim2Key + "][" + dim3Key + "]");
                        } else {
                            rowsCopy.splice(foundIdx, 1); // shrink the list to search
                        }

                    });
                });
            });

            if (actualCount !== expectedCount) {
                console.warn(APPNAME + ' error: expected ' + expectedCount + ' observations, only found ' + actualCount);
                console.warn(APPNAME + ' error: missing values are: ' + JSON.stringify(missingTuples, null, 4));
            }

        };

        Array.prototype.joinAnd = function (joiner) {
            return [this.slice(0, -1).join(', '), this.slice(-1)[0]].join(this.length < 2 ? '' : (' ' + joiner + ' '));
        };

        function validateOptionsViaData(_data, _options) {
            var result = true;

            if (!validateOptions(_options)) {
                return false;
            }
            var params = $.map(_options, function (option, key) {
                console.log('testing key ' + key);
                return key === 'topicSelected' ? null : {key: key, value: option};
            });
            $.each(params, function (idx, param) {
                var key = param.key;
                var value = param.value;
                if (!(value in _data.maps)) {
                    console.warn(APPNAME + ' validation error in options: param \'' + key + '\' value of \'' + value + '\' is not an element ' +
                        'in \'maps\' object');
                    result = false;
                    return false;
                }
            });

            if (result === true) {
                var topicMap = _data.maps[_options.topicParam];
                if (typeof topicMap[_options.topicSelected] === 'undefined') {
                    console.warn(APPNAME + ' validation error: topicSelected value \'' + _options.topicSelected + '\' is in options but not an element ' +
                        'in \'maps.' + _options.topicParam + '\' map');
                    result = false;
                    return false;
                }
            }
            return result;
        }

        function validateOptions(_options) {
            var result = true;
            console.log('evaluating these options: ' + JSON.stringify(_options));
            var requiredOptions = {"xParam": false, "yParam": false, "topicParam": false, "topicSelected": false},
                missing,
                opt;

            for (opt in requiredOptions) {
                requiredOptions[opt] = opt in _options;
            }
            missing = $.map(Object.keys(requiredOptions), function (opt) {
                return !requiredOptions[opt] ? ("'" + opt + "'") : null;
            });
            if (missing.length > 0) {
                // This join() will result in an "and" before final item.  (e.g. "a, b and c")
                var optList = missing.joinAnd('and');
                var plural = (missing.length > 1) ? "s " : " ";
                var verb = (missing.length > 1) ? " are " : " is ";
                var s = APPNAME + ' error:  Required field' + plural + optList + verb + 'missing from the options object, so ' + APPNAME + ' will fail.';
                result = false;
                console.warn(s);
            }
            return result;
        };

        return {
            verifyJsonSchema: verifyJsonSchema,
            verifyInputData: verifyInputData,
            validateOptionsViaData: validateOptionsViaData,
            validateOptions: validateOptions
        };
    })();

    // TODO: write verifier that corroborates options with data
    // TODO: encapsulate verfication methods in a module

    return {
        setOptions: setOptions,
        init: init,
        getGridResult: getGridResult,
        generateView: generateView,
        verifyInputData: validator.verifyInputData,
        verifyJsonSchema: validator.verifyJsonSchema,
        validateOptions: validator.validateOptions,
        validateOptionsViaData: validator.validateOptionsViaData
    };

})();

