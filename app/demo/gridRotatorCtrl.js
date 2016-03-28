function GridRotatorCtrl() {

    /* There are three rotation states.  Each time the user clicks on rotate, this gets incremented by one, and a modulo
     * operator figures out which of the three states it indicates.
     * */
    this.rotationCount = 0;

    /* There are two flip states.  Each time the user clicks on flip, this gets incremented by one, and a modulo
     * operator figures out which of the two states it indicates.
     * */
    this.flipCount = 0;

    /*  Start with no flip, no rotation */
    this.init = function() {
        this.rotationCount = 0;
        this.flipCount = 0;
    };

    this.makeDatagrid = function(data) {
        var chartSubjectArray,
            topics = data.maps.topics,
            gridOptions,
            gridRotator,
            xParam,
            yParam;

        gridRotator = new GridRotator({}, {});

        if (this.rotationCount % 3 == 0) {
            gridOptions = { "topicParam": topics[0].key, "xParam": topics[1].key, "yParam": topics[2].key};
        } else if (this.rotationCount % 3 == 1) {
            gridOptions = {"topicParam": topics[1].key, "xParam": topics[0].key, "yParam": topics[2].key};
        } else if (this.rotationCount % 3 == 2) {
            gridOptions = {"topicParam": topics[2].key, "xParam": topics[0].key, "yParam": topics[1].key};
        }

        gridRotator.validateOptions(gridOptions);

        $("#rotateLabel").html("Topic:<br>" + data.maps.topics[this.rotationCount % 3].title);
        if (this.flipCount % 2 == 1) {
            /* Swap 'em */
            xParam = gridOptions.xParam;
            yParam = gridOptions.yParam;
            gridOptions.xParam = yParam;
            gridOptions.yParam = xParam;
        }
        this.clearPage();

        /* For each topic, output a grid. */
        $.each(data.maps[gridOptions.topicParam], function(topicSelected, record) {
            var table,
                tableCaption = record.long;

            gridOptions.topicSelected = topicSelected;
            gridRotator = new GridRotator(data, gridOptions);
            gridRotator.init();
            table = gridRotator.generateView(tableCaption);

            $("#datapageView #grids").append(table);
        });
    };

    this.clearPage = function() {
        $("#datapageView #grids").html("");
    };

}

