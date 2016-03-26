function NavtreePage() {

    /* There are three rotation states.  Each time the user clicks on rotate, this gets incremented by one, and a modulo
     * operator figures out which of the three states it indicates.
     * */
    this.rotationCount = 0;

    /* There are two flip states.  Each time the user clicks on flip, this gets incremented by one, and a modulo
     * operator figures out which of the two states it indicates.
     * */
    this.flipCount = 0;

    /*  Start with no flip, no rotation */
    this.init = function() {   // public
        //console.log('called init');
        this.rotationCount = 0;
        this.flipCount = 0;
    };

    //this.makeDatagrid = function(responseData, params) {    // public
    this.makeDatagrid = function(dataset) {    // public
        var chartSubjectArray,
            data = dataset.data,
            params = dataset.params,
            gridOptions = {"topicParam": params[0].key, "xParam": params[1].key, "yParam": params[2].key, "suppressNAs": true},
            datagrid = new Datagrid(data, gridOptions),  // needed to make mapToArray calls
            xParam,
            yParam;

        if (this.rotationCount % 3 == 0) {
            gridOptions = {"topicParam": params[0].key, "xParam": params[1].key, "yParam": params[2].key, "suppressNAs": true};
            chartSubjectArray = datagrid.mapToArray(params[0].key, 'long');
            //console.log('rotation 0');
        } else if (this.rotationCount % 3 == 1) {
            gridOptions = {"topicParam": params[2].key, "xParam": params[0].key, "yParam": params[1].key, "suppressNAs": true};
            chartSubjectArray = datagrid.mapToArray(params[2].key, 'long');
            //console.log('rotation 1');
        } else if (this.rotationCount % 3 == 2) {
            gridOptions = {"topicParam": params[1].key, "xParam": params[2].key, "yParam": params[0].key, "suppressNAs": true};
            chartSubjectArray = datagrid.mapToArray(params[1].key, 'long');
            //console.log('rotation 2');
        }
        //console.log('topicParam = ' + gridOptions.topicParam);
        $("#rotateLabel").html("Topic:<br>" + data.maps.titles[gridOptions.topicParam]);
        //console.log('chartSubjectArray is ' + JSON.stringify(chartSubjectArray));
        if (this.flipCount % 2 == 1) {
            /* Swap 'em */
            xParam = gridOptions.xParam;
            yParam = gridOptions.yParam;
            gridOptions.xParam = yParam;
            gridOptions.yParam = xParam;
        }
        this.clearPage();

        /* For each topic, output a grid. */
        $.each(chartSubjectArray, function(i, subject) {
            var table,
                tableCaption = (subject.long && subject.long != "") ? subject.long : subject.short;

            /* Each grid shares the same options, except for its title */
            gridOptions.topicSelected = subject.key;   // key is the only possible value here.
            datagrid = new Datagrid(data, gridOptions);
            datagrid.init();
            //console.log('gridOptions = ' + JSON.stringify(gridOptions));
            //console.log('gridResult = ' + JSON.stringify(datagrid.getGridResult()));
            table = datagrid.generateView(tableCaption);

            $("#datapageView #grids").append(table);
        });
    };

    this.clearPage = function() {
        $("#datapageView #grids").html("");
    };

}

