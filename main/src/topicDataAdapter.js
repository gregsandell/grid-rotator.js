function TopicDataAdapter() {
    var inputData;   // private
    var datid_map;   // private
    var geog_map;    // private
    var datafield_map;    // private
    var timeperiod_map;    // private
    var geographyArray;   // private but accessed by a public
    var timeperiodArray;  // private but accessed by a public
    var datafieldArray;   // private but accessed by a public

    /* Make this object a singleton */
    if (typeof TopicDataAdapter.instance === 'object') {
        return TopicDataAdapter.instance;
    }
    TopicDataAdapter.instance = this;

    /* Main point of entry */
    this.adapt = function(data) {  //public
        datid_map = {};
        geog_map = {};
        datafield_map = {};
        timeperiod_map = {};
        inputData = data;
        makeDataFieldAndTimeperiodMaps();
        makeGeographyMap();
        // console.log('geog_map is ', geog_map);
        geographyArray = mapToArray(geog_map);
        //console.log('finished making geographyArray');
        timeperiodArray = mapToArray(timeperiod_map);
        datafieldArray = mapToArray(datafield_map);
        //
        // NOTE  this destructively alters the data passed by adapt
        //
        $.each(inputData.data.rows, function(i, row) {
            row.geog = row.geog_id;
            delete row.geog_id;
            //console.log('datid_map is ' + JSON.stringify(datid_map));
            //console.log('is there an index of ' + row.datid + ' in the above array?');
            row.datafield = datid_map[row.datid];
            //console.log('row.datafield is now ' + row.datafield);
            delete row.datid;
            //row.timeperiod = row.time_period;
            //delete row.time_period;
            row.value = formatNumberWherePossible(row.value);
        });
        //console.log('nicely ordered: ' + JSON.stringify(orderRowsNicely()));
        console.log('adapted data = ' + JSON.stringify(inputData));
    };

    var orderRowsNicely = function() {
        var key1, key2, key3, newInputData = [];
        console.log(datafield_map);
        console.log(timeperiod_map);
        console.log(geog_map);
        for (key1 in datafield_map) {
            for (key2 in timeperiod_map) {
                for (key3 in geog_map) {
                    $.each(inputData.data.rows, function(idx, row) {
                        //console.log('row = ' + JSON.stringify(row));
                        //console.log(typeof geog_map[key3] + ', ' + typeof timeperiod_map[key2] + ', ' + typeof datafield_map[key1]);
                        if (row.geog == geog_map[key3].name && row.timeperiod == timeperiod_map[key2].name
                            && row.datafield == datafield_map[key1].name) {
                            newInputData.push(row);
                        }
                    });
                }
            }
        }
        return newInputData;
    };

    /*
     * Take the unique values of dataField and timePeriod and use them as keys for a hashmap for the
     * values we'll display for that parameter.  Here are some samples of what will be produced:
     *
     * timeperiod_map["2002"] = {short: "2002", long: "2002", name: "2002"}
     * timeperiod_map["2003"] = {short: "2003", long: "2003", name: "2002"}
     * datafield_map["ARTSVCORGS_ALL"] = 
     *     {short:"ARTSVCORGS_ALL",long:"Art Service Organizations: Total",name:"ARTSVCORGS_ALL"}
     * datafield_map["ARTSVCORGS_ADVOC"] = 
     *     {short:"ARTSVCORGS_ADVOC",long:"Arts Service Organizations: Alliance/Advocacy",name:"ARTSVCORGS_ADVOC"}
     */
    var makeDataFieldAndTimeperiodMaps = function() {  // private  
        var datafieldsTemp = [];
        var datafields = [];
        $.each(inputData.metadata.datafield_metadata, function(i, datafield) {
            datafield_map[datafield.field_id] = {"short": datafield.field_id, "long": datafield.datafield_descrip};
            datid_map[datafield.datid] = datafield.field_id;
            if ($.inArray(datafield.field_id, datafieldsTemp) == -1) {
                datafieldsTemp.push(datafield.field_id);
                var obj = {"field_id": datafield.field_id, "descrip": datafield.datafield_descrip};
                datafields.push(obj);
            }
            timeperiod_map[datafield.time_period] = {"short": datafield.time_period, "long": datafield.timepercapt};
        });

        //console.log('in makeDataFieldAndTimeperiodMaps, datid_map is ' + JSON.stringify(datid_map));
        
        // More destructive changes
        inputData.data.datafields = datafields;
        inputData.data.datafield_map = datafield_map;
        inputData.data.timeperiod_map = timeperiod_map;
    };

    /*
     * Take the unique values of geography and use them as keys for a hashmap for the
     * values we'll display for that parameter.  Here are some samples of what will be produced:
     *
     * geog_map["17031"] = {short:"Cook",long:"Cook",name:"17031"},
     * geog_map["17043"] = {short:"DuPage",long:"DuPage",name:"17043"}
     */
    var makeGeographyMap = function() {  // private
        var metadata_geog_map = {};
        //console.log('inputData.metadata.geog_metadata = ', inputData.metadata.geog_metadata);
        $.each(inputData.metadata.geog_metadata, function(i, geogdata) {
            metadata_geog_map[geogdata.geog_id] = {"short": geogdata.geog_name, "long": geogdata.geog_name};
        });
        //console.log('metadata_geog_map is ' + JSON.stringify(metadata_geog_map));
        //{"17031":{"short":"Cook","long":"Cook"},"17043":{"short":"DuPage","long":"DuPage"},"17089":{"short":"Kane","long":"Kane"},"17093":{"short":"Kendall","long":"Kendall"},"17097":{"short":"Lake","long":"Lake"},"17111":{"short":"McHenry","long":"McHenry"},"17197":{"short":"Will","long":"Will"}}
        /* The metadata contains geogs that aren't even in the data.  We only want geogs for which there are datapoints. */
        $.each(inputData.data.rows, function(i, row) {
            if (geog_map.hasOwnProperty(row.geog_id)) return true;
            //console.log('row.geog_id = ' + row.geog_id);
            geog_map[row.geog_id] = metadata_geog_map[row.geog_id];
        });

        
        // More destructive changes
        inputData.data.geog_map = geog_map;
    };

    /*
     * It's easier to iterate through an array than a hashmap.  This returns an "array version" of a hashmap.
     */
    var mapToArray = function(map) {  // private
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

    this.getGeographyArray = function() {  // public   TO DO  Just make geographyArray a public property
        return geographyArray;
    };

    this.getTimeperiodArray = function() {  // public  TO DO Just make timeperiodArray a public property
        return timeperiodArray;
    };

    this.getDatafieldArray = function() {  // public   TO DO just make datafieldArray a public property
        return datafieldArray;
    };

    /*
     * If val is an integer, add commas for numbers > 999 (e.g. 1245 becomes 1,245)
     * If val is a floating point, truncate precision to three places (e.g. 0.43578965 becomes 0.436)
     */
    var formatNumberWherePossible = function(val) {  // private   
        var result = val;
        if (!isNaN(parseInt(val))) {
            result = commaSeparateNumber(parseInt(val));
        } else if (!isNaN(parseFloat(val))) {
            result = parseFloat(val).toFixed(3)
        }
        return result + "";
    };

    /*
     * Does the work for integer comma separating.
     */
    var commaSeparateNumber = function(val){   // private
        while (/(\d+)(\d{3})/.test(val.toString())){
          val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
        }
        return val;
    };
}

/*
 * Generally, people like to see grids with more rows than columns.  In its natural state, the
 * grids are oriented with geographies in columns and timeperiods in rows.  Here, if there are
 * more geographies than timeperiods, and both are greater than six in size, we will want to
 * have the default view flipped to show timeperiods in columns and geographies in rows.
 */
TopicDataAdapter.prototype.isAutoflipCandidate = function() {  // public, can be privileged
    var thisObj = new TopicDataAdapter();
    var geog = thisObj.getGeographyArray();
    var timeperiod = thisObj.getTimeperiodArray();
    return (geog.length > timeperiod.length) && (geog.length >= 6) && (timeperiod.length >= 6);
};
