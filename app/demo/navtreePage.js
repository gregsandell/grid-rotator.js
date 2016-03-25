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

    this.makeDatagrid = function(responseData, params) {    // public
        //console.log('in makeDatagrid');
        var chartSubjectArray;
        var gridOptions = {"titleParam": params[0].key, "xParam": params[1].key, "yParam": params[2].key, "suppressNAs": true};
        var datagrid = new Datagrid(responseData, gridOptions);  // needed to make mapToArray calls

        if (this.rotationCount % 3 == 0) {
            gridOptions = {"titleParam": params[0].key, "xParam": params[1].key, "yParam": params[2].key, "suppressNAs": true};
            chartSubjectArray = datagrid.mapToArray(params[0].key, 'long');
        } else if (this.rotationCount % 3 == 1) {
            gridOptions = {"titleParam": params[2].key, "xParam": params[0].key, "yParam": params[1].key, "suppressNAs": true};
            chartSubjectArray = datagrid.mapToArray(params[2].key, 'long');
        } else if (this.rotationCount % 3 == 2) {
            gridOptions = {"titleParam": params[2].key, "xParam": params[1].key, "yParam": params[0].key, "suppressNAs": true};
            chartSubjectArray = datagrid.mapToArray(params[2].key, 'long');
        }
        //console.log('chartSubjectArray is ', chartSubjectArray);
        if (this.flipCount % 2 == 1) {
            /* Swap 'em */
            var xParam = gridOptions.xParam;
            var yParam = gridOptions.yParam;
            gridOptions.xParam = yParam;
            gridOptions.yParam = xParam;
        }
        $("#datapageView .pagedata").html("");

        /* For each topic, output a grid. */
        $.each(chartSubjectArray, function(i, subject) {
            /* Each grid shares the same options, except for its title */
            gridOptions.titleChoice = subject.key;   // key is the only possible value here.
            datagrid = new Datagrid(responseData, gridOptions);
            datagrid.initializeGrid();
            var table = datagrid.generateView((subject.long && subject.long != "") ? subject.long : subject.short);

            $("#datapageView .pagedata").append(table);
        });
    };

}

