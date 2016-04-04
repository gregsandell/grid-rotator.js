var gridRotator = (function () {

    var gridSource,
        gridOptions,
        gridResult = {},
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
        try {
            gridResult = generateGrid();
        } catch(e) {
            gridRotator.validateSuite(gridSource, gridOptions, {noisy: true});
        }
    }

    /*
     * Generate a ready-to-print grid dataset based on the options.
     */
    function generateGrid() {  // private
        var xValues = [],
            yValues = [],
            result = {x: []},
            rows = [];

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
            var long = gridSource.maps[gridOptions.xParam][xValue].long,
                short = gridSource.maps[gridOptions.xParam][xValue].short;

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
                $.each(gridSource.rows, function (i, row) {
                    if (row[gridOptions.topicParam] == gridOptions.topicSelected && row[gridOptions.xParam] == xValue && row[gridOptions.yParam] == yValue) {
                        v = row.value;
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
    }

    function getGridResult() {  // public
        return gridResult;
    }

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

        // TODO Change this method name:  it is validating javascript, not JSON.
        function validateJsonSchema(_data, validateOptions) {
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
                function () {
                    var i;

                    for (i = 0; i < _data.topics.length; i++) {
                        if (Object.keys(_data.maps[_data.topics[i].key]).length === 0) {
                            return '\'maps.' + _data.topics[i].key + '\' should have at least one field'
                        }
                    }
                    return true;
                }
            ],
                result;

            validateOptions = validateOptions || {};
            validateOptions.noisy = validateOptions.noisy || false;

            $.each(verifiers, function (idx, verifier) {
                if (typeof (result = verifier()) === 'string') {
                    return false;   // End after first failure
                }
            });
            if (typeof result === 'string') {
                if (validateOptions.noisy) {
                    console.warn(APPNAME + ' input data validation: ' + result);
                }
                return false;
            }
            return true;
        }

        // TODO find better name to distinguish from validateJsonSchema
        function validateInputData(_data, validateOptions) {

            var topic1 = _data.topics[0].key,
                topic2 = _data.topics[1].key,
                topic3 = _data.topics[2].key,
                dim1Keys = Object.keys(_data.maps[topic1]),
                dim2Keys = Object.keys(_data.maps[topic2]),
                dim3Keys = Object.keys(_data.maps[topic3]),
                expectedCount = dim1Keys.length * dim2Keys.length * dim3Keys.length,
                actualCount = 0,
                rowsCopy = JSON.parse(JSON.stringify(_data.rows)),
                missingTuples = [],
                done = false;

            validateOptions = validateOptions || {};
            validateOptions.noisy = validateOptions.noisy || false;

            // TODO Rename key, value, key2, value2
            $.each(_data.maps, function (key, value) {
                $.each(value, function (key2, value2) {
                    if (!isObject(value2)) {
                        if (validateOptions.noisy) {
                            console.warn(APPNAME + ' input data validation: \'maps.' + key + '.' + key2 + '\' must be an object');
                        }
                        done = true;
                        return false;
                    }
                    if (typeof _data.maps[key][key2].long === 'undefined' || typeof _data.maps[key][key2].short === 'undefined') {
                        if (validateOptions.noisy) {
                            console.warn(APPNAME + ' input data validation: \'maps.' + key + '.' + key2 +
                                '\' must contain fields \'long\' and \'short\'');
                        }
                        done = true;
                        return false;
                    }
                });
                if (done) {
                    return false;
                }
            });
            // TODO is there a nicer way to break out of $.each loops and return a boolean?
            if (done) {
                return false;
            }

            $.each(_data.rows, function (idx, row) {
                done = false;
                if (typeof row[topic1] === 'undefined' || typeof row[topic2] === 'undefined' ||
                    typeof row[topic3] === 'undefined' || typeof row.value === 'undefined') {
                    if (validateOptions.noisy) {
                        console.warn(APPNAME + ' input data validation: each object of array \'rows\' must contain fields \'' +
                            topic1 + '\', \'' + topic2 + '\', \'' + topic3 + '\' and \'value\'');
                    }
                    done = true;
                    return false;
                }
                if (typeof row[topic1] !== 'string' || typeof row[topic2] !== 'string' ||
                    typeof row[topic3] !== 'string') {
                    if (validateOptions.noisy) {
                        console.warn(APPNAME + ' input data validation: fields \'' + topic1 + '\', \'' + topic2 + '\', and \'' + topic3 +
                            '\' of each object of array \'rows\' must be strings');
                    }
                    done = true;
                    return false;
                }
                if (typeof row.value !== 'string' && typeof row.value !== 'number') {
                    if (validateOptions.noisy) {
                        console.warn(APPNAME + ' input data validation: \'value\' field of each \'rows\' element must be either type \'number\' or \'string\'');
                    }
                    done = true;
                    return false;
                }
                $.each([topic1, topic2, topic3], function (idx, topic) {
                    if ($.inArray(row[topic], Object.keys(_data.maps[topic])) == -1) {
                        if (validateOptions.noisy) {
                            console.warn(APPNAME + ' input data validation: field \'' + topic + '\' of each object of array \'rows\' ' +
                                'must be one of: ' + Object.keys(_data.maps[topic]).joinAnd('or'));
                        }
                        done = true;
                        return false;
                    }
                });
                if (done) {
                    return false;
                }
            });

            if (done) {
                return false;
            }

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
                if (validateOptions.noisy) {
                    console.warn(APPNAME + ' input data validation: expected ' + expectedCount + ' observations, only found ' + actualCount);
                    console.warn(APPNAME + ' input data validation: missing values are: ' + JSON.stringify(missingTuples, null, 4));
                }
                return false;
            }

        };

        Array.prototype.joinAnd = function (joiner) {
            return [this.slice(0, -1).join(', '), this.slice(-1)[0]].join(this.length < 2 ? '' : (' ' + joiner + ' '));
        };

        function validateOptionsViaData(_data, _options, validateOptions) {
            var result = true,
                params = $.map(_options, function (option, key) {
                    return key === 'topicSelected' ? null : {key: key, value: option};
                });

            validateOptions = validateOptions || {};
            validateOptions.noisy = validateOptions.noisy || false;

            $.each(params, function (idx, param) {
                var key = param.key;
                var value = param.value;
                if (!(value in _data.maps)) {
                    if (validateOptions.noisy) {
                        console.warn(APPNAME + ' validation error in options: param \'' + key + '\' value of \'' + value + '\' is not an element ' +
                            'in \'maps\' object');
                    }
                    result = false;
                    return false;
                }
            });

            if (result === true) {
                var topicMap = _data.maps[_options.topicParam];
                if (typeof topicMap[_options.topicSelected] === 'undefined') {
                    if (validateOptions.noisy) {
                        console.warn(APPNAME + ' validation error: topicSelected value \'' + _options.topicSelected + '\' is in options but not an element ' +
                            'in \'maps.' + _options.topicParam + '\' map');
                    }
                    result = false;
                    return false;
                }
            }
            return result;
        }

        function validateOptions(_options, validateOptions) {
            var result = true,
                requiredOptions = {"xParam": false, "yParam": false, "topicParam": false, "topicSelected": false},
                missing,
                opt;

            validateOptions = validateOptions || {};
            validateOptions.noisy = validateOptions.noisy || false;

            for (opt in requiredOptions) {
                requiredOptions[opt] = opt in _options;
            }
            missing = $.map(Object.keys(requiredOptions), function (opt) {
                return !requiredOptions[opt] ? ("'" + opt + "'") : null;
            });
            if (missing.length > 0) {
                // This join() will result in an "and" before final item.  (e.g. "a, b and c")
                if (validateOptions.noisy) {
                    var optList = missing.joinAnd('and');
                    var plural = (missing.length > 1) ? "s " : " ";
                    var verb = (missing.length > 1) ? " are " : " is ";
                    var s = APPNAME + ' options validation:  Required field' + plural + optList + verb + 'missing from the options object, so ' + APPNAME + ' will fail.';
                    console.warn(s);
                }
                result = false;
            }
            return result;
        }

        function validateSuite(_data, _options, validateOptions) {
            return (validateJsonSchema(_data, validateOptions) && validateInputData(_data, validateOptions) &&
            validateOptions(_options, validateOptions) && validateOptionsViaData(_data, _options, validateOptions));
        }

        return {
            validateJsonSchema: validateJsonSchema,
            validateInputData: validateInputData,
            validateOptionsViaData: validateOptionsViaData,
            validateOptions: validateOptions,
            validateSuite: validateSuite
        };
    })();

    return {
        setOptions: setOptions,
        init: init,
        getGridResult: getGridResult,
        validateInputData: validator.validateInputData,
        validateJsonSchema: validator.validateJsonSchema,
        validateOptions: validator.validateOptions,
        validateOptionsViaData: validator.validateOptionsViaData,
        validateSuite: validator.validateSuite
    };

})();

