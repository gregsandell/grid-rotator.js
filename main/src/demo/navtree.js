function Navtree() {

    /*
     * Application globals.
     */
    this.taxonomy = "STANDARD";
    this.layer = "data";
    this.maxSelections = 45;
    this.timeout = 8000;

    /* Make this object a singleton */
    if (typeof Navtree.instance === 'object') {
        return Navtree.instance;
    }
    Navtree.instance = this;

    /* 
     * Make a querystring fragment suitable for appending onto a URL.
     * Assumes that the URL to append to already has a querystring on it, so the fragment will begin with "&"
     * Dependency:  Geography object must be instantiated first.
     */
    this.makeGeogQuerystring = function() {   // public
        var geogObj = new Geography();
        var working = geogObj.getWorkingGeography();
        var zoom = working.zoomlevel;
        var geogkey = "";
        if (!geogObj.userHasSelectedAllGeogs()) {
            geogkey = geogObj.getChosenGeogs();
        }
        return "&geoglevel=" + working[zoom].metadata.short + "&geogkey=" + geogkey;
    };

    /*
     * Create the url for the service that will populate the links in the Level 1 container.
     */
    this.makeLevel1Url = function() {   // public
        var thisObj = new Navtree();
        return "http://" + this.layer + ".cmap.illinois.gov/dev/API/Xml_Standalone/GetDataTaxonomy.aspx?" +
            "Level1=&ParentLevel=1&childlevel=1&returnformat=JSONP";
    };

    /*
     * Create the url for the service that will populate the links in the Level 1 container.
     * Argument should be the datafield id of a level 1 item.
     */
    this.makeLevel2Url = function(level1) { // public
        var thisObj = new Navtree();
        return "http://" + thisObj.layer + ".cmap.illinois.gov/dev/API/Xml_Standalone/GetDataTaxonomy.aspx?" +
            "Level1=" + level1 + "&ParentLevel=1&childlevel=2&returnformat=JSONP";
    };
       
    /*
     * Create the url for the service that will populate the links in the Level 3 container.
     * Argument should be the datafield id of a level 2 item.
     */
    this.makeLevel3Url = function(level2) { // public
        var thisObj = new Navtree();
        return "http://" + thisObj.layer + ".cmap.illinois.gov/dev/API/Xml_Standalone/GetDataTaxonomy.aspx?" +
            "Level2=" + level2 + "&ParentLevel=2&childlevel=3&returnformat=JSONP";
    };
       
    /*
     * Create the url for the service that will populate the links in the Level 4 container.
     * Argument should be the datafield id of a level 3 item.
     */
    this.makeLevel4Url = function(level3) { // public
        var thisObj = new Navtree();
        return "http://" + thisObj.layer + ".cmap.illinois.gov/dev/API/Xml_Standalone/GetDataTaxonomy.aspx?" +
            "Level3=" + level3 + "&ParentLevel=3&childlevel=4&returnformat=JSONP";
    };
        
    /*
     * Call the service to get the data for the Level 1 container.
     * * Dependency:  Geography must be instantiated first.
     */
    this.level1Ajax = function() {  // public
        var thisObj = new Navtree();
        var url = thisObj.makeLevel1Url() + thisObj.makeGeogQuerystring();
        Utils.cmapAjax({"url": url, success:
            function(responseData) {
                thisObj.LEVEL1CALLBACK(responseData);
            }
        });
    };

    /*
     * Respond to the service that retrieves level 1 topic data.
     */
    this.LEVEL1CALLBACK = function(dataResponse) {  // public
        //console.log(JSON.stringify(dataResponse));
        var thisObj = new Navtree();
      
        /* Sometimes the service returns nothing.  Usually the cause is a geography zoom
         * level of communities or municipalities, with very few selected.
         */
        if (!dataResponse.data || !dataResponse.data.level1_nodes) {
            (new Geography()).tryDifferentGeographyMessage();
            $(".getthisdata a").removeClass("loading").text("Get this data");
            $(".loading").hide();
            return;
        }
        thisObj.level1Decorate("level1Container", dataResponse.data.level1_nodes);
        $(".loading").hide();
    };

    /*
     * Create the HTML to populate the level1 container.
     * Argument 'choosingContainer' means the id of the div (with no initial "#") containing the node that the user clicked on.
     * This is passed down to subsequent calls in order to retrieve the title of the clicked-on node.
     * Using a variable for this container allows us to re-use this method in rendering search results.
     */
    this.level1Decorate = function(choosingContainer, level1_nodes) {  // public
        var thisObj = new Navtree();
            
        var ul = $("<ul>");

        /* Add the search field */
        ul.append($("<li>").append($("<a>").text("Search").addClass("search").click(thisObj.searchClickHandler)));

        $.each(level1_nodes, function(i, record) {
            var url = thisObj.makeLevel2Url(record.id) + thisObj.makeGeogQuerystring();
            var li = $("<li>");
            var a = $("<a>")
                .attr("href", "#")
                .attr("onclick", "return false")
                .text(record.cap)
                .data("level2Url", url)
                .data("id", record.id)
                .data("choosingContainer", choosingContainer)
                .click(thisObj.level1ClickHandler);
            ul.append(li.append(a));
        });
        $("#" + choosingContainer).append(ul);
    };
       
    /*
     * Handler for the element in a Level 1 node that is clicked on.
     */
    this.level1ClickHandler = function() {   // public
        var thisObj = new Navtree();
        var level2Url = $(this).data().level2Url;

        /* Highlight/unhighlight the correct elements */
        $(this).parent().siblings().children().removeClass("selected");
        $(this).addClass("selected");

        thisObj.clearLevelContainers([2,3,4]);
        thisObj.hideLevelContainers([3,4, "Search"]);
        $("#movablecontrols").hide();

        /* Prevent UI elements from interfering with each other:  before opening the rail,
         * close the geography flyout (if open)
         */
        if ($("#geoselector").css("display") == "block") {
            (new Geography()).cancelGeoUI();
        }

        /* We're about to call the service to retrieve level 2 data.  Since there may be latency, give
         * the user something to look at:  the level 2 container, with its title, and a spinner.
         */
        var h4 = $("<h4>").text($("#" + $(this).data("choosingContainer") + " ul li a.selected").text());
        $("#level2Container").append(h4).append($("<div>").addClass("loading"));

        /* There are two use cases to address here:
         * 1. The typical initial state, where the rail is closed, and clicking opens it up (the 'if', below)
         * 2. The rail is already open, any number of level containers are shown, and user is making a different
         *    level 1 choice (the 'else' below).
         */
        if (!$("#rail").hasClass("expanded")) {
            thisObj.hideLevelContainers([2]);

            /* Open the rail, retrieve level2 data */
            thisObj.animateBackdrop("open",
                function() {
                    $("#rail").addClass("expanded");
                    thisObj.showLevelContainers([2]);
                    $(".listgroup").show();
                    $(".sliver").show();
                    Utils.cmapAjax({
                        url: level2Url,
                        success: function(responseData) {
                            thisObj.LEVEL2CALLBACK(responseData);
                        }
                    });
                }
            );

        } else {

            /* Rail is already open...don't re-open it */
            thisObj.showLevelContainers([2]);
            Utils.cmapAjax({
                url: level2Url,
                success: function(responseData) {
                    thisObj.LEVEL2CALLBACK(responseData);
                }
            });
        }

    };

    /*
     * Respond to the service that retrieves level 2 topic data.
     */
    this.LEVEL2CALLBACK = function(dataResponse) {  // public
        var thisObj = new Navtree();
      
        /* Sometimes the service returns nothing.  Usually the cause is a geography zoom
         * level of communities or municipalities, with very few selected.
         */
        if (!dataResponse.data || !dataResponse.data.level1_nodes) {
            (new Geography()).tryDifferentGeographyMessage();
            $(".getthisdata a").removeClass("loading").text("Get this data").hide();
            $(".loading").hide();
            return;
        }
        thisObj.level2Decorate("level2Container", dataResponse.data.level1_nodes[0].level2_nodes);
        $("a#cancelNav").show();
        $(".loading").hide();
    };

    /*
     * Create the HTML to populate the level2 container.
     * Argument 'choosingContainer' means the id of the div (with no initial "#") containing the node that the user clicked on.
     * This is passed down to subsequent calls in order to retrieve the title of the clicked-on node.
     * Using a variable for this container allows us to re-use this method in rendering search results.
     *
     * Dependency:  Geography object must be instiated first.
     */
    this.level2Decorate = function(choosingContainer, level2_nodes) {  // public

        var thisObj = new Navtree();
        var ul = $("<ul>");

        $.each(level2_nodes, function(i, record) {
            var url = thisObj.makeLevel3Url(record.id) + thisObj.makeGeogQuerystring();
            var li = $("<li>");
            var a = $("<a>")
                .attr("href", "#")
                .attr("onclick", "return false")
                .text(record.cap)
                .data("level3Url", url)
                .data("id", record.id)
                .data("choosingContainer", choosingContainer)
                .click(thisObj.level2ClickHandler);
            ul.append(li.append(a));
        });

        $("#" + choosingContainer).append(ul);
    };

    /*
     * Handler for the element in a Level 2 node that is clicked on.
     */
    this.level2ClickHandler = function() {    // public
        var thisObj = new Navtree();
        var level3Url = $(this).data().level3Url;

        /* Highlight/unhighlight the correct elements to show what is selected */
        $(this).parent().siblings().children().removeClass("selected");
        $(this).addClass("selected");

        /* We're about to call the service to retrieve level 3 data.  Since there may be latency, give
         * the user something to look at:  the level 3 container, with its title, and a spinner.
         */
        var h4 = $("<h4>").text($("#" + $(this).data("choosingContainer") + " ul li a.selected").text());
        $("#level4Container").html("").hide();
        $("#level3Container").html("").append(h4).append($("<div>").addClass("loading")).show();

        /* Retrieve level 3 data */
        Utils.cmapAjax({
            url: level3Url,
            success: function(responseData) {
                thisObj.LEVEL3CALLBACK(responseData);
            }
        });
    };

    /*
     * Respond to the service that retrieves level 3 topic data.
     */
    this.LEVEL3CALLBACK = function(dataResponse) {  // public
        var thisObj = new Navtree();
      
        /* Sometimes the service returns nothing.  Usually the cause is a geography zoom
         * level of communities or municipalities, with very few selected.
         */
        if (!dataResponse.data || !dataResponse.data.level2_nodes) {
            (new Geography()).tryDifferentGeographyMessage();
            $(".getthisdata a").removeClass("loading").text("Get this data").hide();
            $(".loading").hide();
            return;
        }
        thisObj.level3Decorate("level3Container", dataResponse.data.level2_nodes[0].level3_nodes);
        $("#movablecontrols").hide();
        $("#level3Container").show();
        $(".loading").hide();
    };

    /*
     * Create the HTML to populate the level3 container.
     * Argument 'choosingContainer' means the id of the div (with no initial "#") containing the node that the user clicked on.
     * This is passed down to subsequent calls in order to retrieve the title of the clicked-on node.
     * Using a variable for this container allows us to re-use this method in rendering search results.
     *
     * Dependency:  Geography object must be instiated first.
     */
    this.level3Decorate = function(choosingContainer, level3_nodes) {   // public
        var thisObj = new Navtree();
        var level4Url = $(this).data().level4Url;
        var ul = $("<ul>");
        $.each(level3_nodes, function(i, record) {
            var url = thisObj.makeLevel4Url(record.id) + thisObj.makeGeogQuerystring();
            var li = $("<li>");
            var a = $("<a>")
                .attr("href", "#")
                .attr("onclick", "return false")
                .text(record.cap)
                .data("level4Url", url)
                .data("id", record.id)
                .data("choosingContainer", choosingContainer)
                .click(thisObj.level3ClickHandler);
            ul.append(li.append(a));
        });
        $("#" + choosingContainer).append(ul);
    };

    /*
     * Handler for the element in a Level 3 node that is clicked on.
     */
    this.level3ClickHandler = function() {  // public
        var thisObj = new Navtree();
        var level4Url = $(this).data().level4Url;

        /* Highlight/unhighlight the correct elements to show what is selected */
        $(this).parent().siblings().children().removeClass("selected");
        $(this).addClass("selected");

        /* Special case for level 3:  the list of nodes is sometimes quite long, and the user may be scrolled down
         * quite far on the page.  Upon selection of a node, the level 4 container will be populated and appear,
         * but up near the top of the page.  Auto-scroll up so the user sees the change.
         */
        if ($(window).scrollTop() > 293)  {
            $("html, body").animate({scrollTop: 0}, 300);
        }

        /* We're about to call the service to retrieve level 4 data.  Since there may be latency, give
         * the user something to look at:  the level 4 container, with its title, and a spinner.
         */
        var choosingContainer = $(this).data("choosingContainer");
        var h4 = $("<h4>").text($("#" + choosingContainer + " ul li a.selected").text());
        $("#level4Container").html("").append(h4).append($("<div>").addClass("loading")).show();;

        if (choosingContainer != "level3Container") {
            // This is a hack to accomodate search.  Search results can be a mixture of level 2 and level 3 nodes
            // appearing in the search results container.  Level 2 clicks will be handled with the level 2 click
            // handler, and populate nodes in the level 3 container as normal, with level 3 appearing in its 
            // customary position.  Level 3 clicks, handled with the level 3 click handler, will also appear
            // in their customary level 4 container, but in level 3's customary position.  Depending on what 
            // the user was doing previously, the level 3 container may presently be in view.  We need to hide 
            // it now, so level 4 will naturally slide over to the left.
            $("#level3Container").hide();
        }
        Utils.cmapAjax({
            url: level4Url,
            success: function(responseData) {
                thisObj.LEVEL4CALLBACK(responseData);
            }
        });
    };

    /*
     * Respond to the service that retrieves level 4 topic data.
     */
    this.LEVEL4CALLBACK = function(dataResponse) {  // public
        var thisObj = new Navtree();
      
        /* Sometimes the service returns nothing.  Usually the cause is a geography zoom
         * level of communities or municipalities, with very few selected.
         */
        if (!dataResponse.data || !dataResponse.data.level3_nodes) {
            (new Geography()).tryDifferentGeographyMessage();
            $(".getthisdata a").removeClass("loading").text("Get this data").hide();
            $(".loading").hide();
            return;
        }
        thisObj.level4Decorate(dataResponse.data.level3_nodes[0].level4_nodes);
        $("#level4Container").show();
        $("#movablecontrols").hide();
        $(".loading").hide();
    };

    /*
     * Create the HTML to populate the level 4 container.  Unlike the previous levels that created links,
     * here we are creating checkboxes to enable multiple selections.
     */
    this.level4Decorate = function(level4_nodes) {   // public
        var thisObj = new Navtree();
        
        /* Add 'Select all' and 'Select none' links */
        var selectAllHtml = $("<p>")
            .append($("<a>")
                .text("Select all")
                .addClass("checkboxToggler")
                .click(selectAll)
            ).append($("<a>")
                .text("Deselect all")
                .addClass("checkboxToggler")
                .click(deselectAll)
            );
        
        var ul = $("<ul>");
        $.each(level4_nodes, function(i, record) {
            var li = $("<li>");
            var label = $("<label>");
            var check = $("<input>").attr("type", "checkbox").val(record.id).addClass("topicCheckbox").click(thisObj.activateSubmitButton);
            var a = $("<a>").text(record.cap);

            ul.append(li.append(label.append(check).append(a)));
        });
        $("#level4Container").append(selectAllHtml).append(ul);
    };

    /*
     * The main worker responding to a click on the 'Get this data' button.
     *
     * Dependencies:  
     * 1. Geography object must be instiated first.
     * 2. Choices are made on all four level containers
     */
    this.getThisData = function() {
        var navtreePageObj = new NavtreePage();
        var thisObj = new Navtree();

        /* Find all the checked selections */
        var nodes = $(".topicCheckbox:checked");
        var topics = [];
        $.each(nodes, function(i, record) {
            topics.push(record.value);
        });

        /* Prepare the Chart view's chart selector for new data */
        navtreePageObj.clearChartChooser();

        $("#welcome").hide();
        $(".getthisdata a").addClass("loading").text("Loading data");
        var geogQuerystring = thisObj.makeGeogQuerystring();
        var topicString = topics.join(",");

        /* Url to get the view data for the selection */
        var url = "http://" + thisObj.layer + ".cmap.illinois.gov/dev/API/XML_Standalone/GetCmapData.aspx?datafield=" +
            topicString + geogQuerystring + "&ReturnFormat=JSONP";

        /* Get the url for retrieving a CSV file of the data */
        var getCSVurl_url = "http://" + thisObj.layer + ".cmap.illinois.gov/DEV/API/HTTPGET/GetLinkForCmapDataDownload.aspx?" +
            "ReturnFormat=JSONP"  + geogQuerystring + "&ContainerLevel=RE&ContainerList=C7&DataFamily=&DataCategory=&DataSubCategory=" +
            "&DataField=" + topicString + "&DatId=&IncludeArchive=T&ResultsetConfig=COLUMN";
        Utils.cmapAjax({
            "url": getCSVurl_url,
            "success": function(responseData) {
                if (responseData.status_code == 1) {
                    $(".download").attr("href", responseData.data.url);
                } else {
                    $(".download").click(function() {
                        // $("#usermessage").userMessage({text: "Sorry, CSV is not available for this data"});  // TO DO Find a case to test this
                        Utils.safeLog("CSV download not available; GetLinkForCmapDataDownload service call returned with an error");
                    });
                }
            },
        });

        /* 
         * Grab the data and respond according to the current view (i.e. a grid, chart or map view that is already in view due
         * to a previous selection).  If there is no current view, default to grid.
         */
        var view = thisObj.currentlyVisibleView();
        if (view == "grid" || view == "") {
            thisObj.activateViewButton("grid");
            thisObj.activateView("grid");
            Utils.cmapAjax({
                url: url,
                success: function(responseData) {
                    navtreePageObj.GRIDCALLBACK(responseData);
                }
            });
        } else if (view == "chart") {
            thisObj.activateViewButton("chart");
            thisObj.activateView("chart");
            if ($(".topicCheckbox:checked").length > 1) {
                navtreePageObj.populateChartChooser();
                if (showChartChooser) {
                    $("#chartChooser").css("display", "inline");
                }
            }
            Utils.cmapAjax({
                url: url,
                success: function(responseData) {
                    navtreePageObj.CHARTCALLBACK(responseData);
                }
            });
        } else if (view == "map") {
            thisObj.activateViewButton("map");
            thisObj.activateView("map");
            Utils.cmapAjax({
                url: url,
                success: function(responseData) {
                    navtreePageObj.MAPCALLBACK(responseData);
                }
            });
        }
    };

    /* 
     * Handler for responding to a 'Select all' (i.e. checkboxes) click 
     *
     * Dependency:  level 4 container is populated with checkboxes
    */
    var selectAll = function() {  // private
        var thisObj = new Navtree();
        $(".topicCheckbox").prop("checked", true);
        thisObj.activateSubmitButton();
    };

    /* Handler for responding to a 'Deselect all' (i.e. checkboxes) click 
     *
     * Dependency:  level 4 container is populated with checkboxes
    */
    var deselectAll = function() {  // private
        var thisObj = new Navtree();
        $(".topicCheckbox").prop("checked", false);
        thisObj.activateSubmitButton();
    };

    /*
     * Control the visibility of the 'Get this data' button based on present state.  It should only be shown when one or more checkboxes
     * are checked and the rail is in view.   
     *
     * Dependency:  level 4 container is populated with checkboxes
     */
    this.activateSubmitButton = function() {  // public
        var show = $("#level4Container").css("display") == "block" && $(".topicCheckbox:checked").length > 0;
        if (show) {
            $("#movablecontrols").show(); 
            $(".getthisdata a").show();
            if ($("#levelSearchContainer").css("display") == "block" && $("#level3Container").css("display") == "none") {
                $(".getthisdata").addClass("thirdcol");
            } else {
                $(".getthisdata").removeClass("thirdcol");
            }
        } else {
            $("#movablecontrols").hide();
            $(".getthisdata a").hide();
            $(".getthisdata").removeClass("thirdcol");
        }
    };

    /*
     * Method for opening or closing the rail/backdrop
     */
    this.animateBackdrop = function(openClose, onComplete) {  // public
        var targetWidth = openClose == "open" ? "90%" : "232";
        $(".backdrop").animate({width: targetWidth}, 
            {duration: 300, easing: "easeInOutQuad",
               complete: onComplete
            }
        );
    };

    /*  
     *  Opening the rail/backdrop is a multi-step operation.  This is the cleanup after the 'open' animation is done.
     */
    this.finishBackdropOpen = function() {  // public
        $("#rail").addClass("expanded");
        $(".listgroup").show();
    };

    // This is for debugging, i.e. getting the backdrop to open from the chrome console.  Not called by any code.
    this.openBackdrop = function() {  // public
        var thisObj = new Navtree();
        $(".backdrop").css("width", "90%");
        thisObj.finishBackdropOpen();
    };

    /*
     * Choose which view button (grid, chart, or map) is visible.  Argument 'choice' should be one of 'grid', 'chart'
     * or 'map'.
     */
    this.activateViewButton = function(choice) {  // public
        $("a#makechart").removeClass("selected");
        $("a#makegrid").removeClass("selected");
        $("a#makemap").removeClass("selected");
        $("a#make" + choice).addClass("selected");
    };

    /*
     * Expose the correct div or iframe for the correct view (grid, chart or map).
     */
    this.activateView = function(choice) {  // public
        $("#datapageView .pagedata").hide();
        $("iframe#chartFrame").hide();
        $("iframe#mapFrame").hide();
        if (choice == "grid") {
            $("#datapageView .pagedata").show();
        } else if (choice == "map") {
            $("iframe#mapFrame").show();
        } else if (choice == "chart") {
            $("iframe#chartFrame").show();
        }
    };

    /* 
     * Marshall the data that the Flex Chart module needs to display the selected data.
     */
    this.makeChartParams = function(index) {  // public
        var thisObj = new Navtree();
        var geogObj = new Geography();
        var idx = index ? index : 0;
        var treeSelection = thisObj.getCurrentTreeSelection();
        var DataField = treeSelection.level4[idx].id;
        var working = geogObj.getWorkingGeography();
        var zoom = working.zoomlevel;
        var geogkey = "";
        var geoglevel = working[zoom].metadata.short;

        /* If all geographies for the current zoom is selected, the geogkey parameter can be empty */
        if (!geogObj.userHasSelectedAllGeogs()) {
            geogkey = geogObj.getChosenGeogs();
        }

        var params =
            {"DataField": DataField,"GeogType":"","GeogLevel": geoglevel,"ContainerLevel":"RE","ContainerList":"C7","GeogKey": geogkey,"QueryCriteria":"","QueryFieldList":"","DatId":"","Keywords":"","Committee":"","IncludeArchive":"","GetAllDataFields":"","GeogsOnlyNoData":"","SortOrder":""};
        return params;
    };

    /*
     * Just a delegate to the jQuery param() method, which isn't a very clear name for what it does.
     */
    this.objToQuerystring = function(obj) {   // TO DO Put this in Utils
        return $.param(obj);
    };

    /*
     * Get an object neatly summarizing the current nav state, to keep the client code from having to make
     * all those selectors each time.  Mainly intended for inspecting actual topic navigation, but the 
     * data in the 'level4' field will be perfectly valid for search navigation too.
     *
     * Assumption:  all four nav levels have been populated, with selections made
     */
    this.getCurrentTreeSelection = function() {  // public
        var result = {
            "level1": {
                "text": $("#level1Container ul li a.selected").text(),
                "id": $("#level1Container ul li a.selected").data("id")
            },
            "level2": {
                "text": $("#level2Container ul li a.selected").text(),
                "id": $("#level2Container ul li a.selected").data("id")
            },
            "level3": {
                "text": $("#level3Container ul li a.selected").text(),
                "id": $("#level3Container ul li a.selected").data("id")
            }
        };
        var level4 = [];
        $.each($(".topicCheckbox:checked"), function(i, checkbox) {
            level4.push({
                "id": checkbox.value, 
                "text": $(checkbox).siblings("a").text()
            });
        });
        result.level4 = level4;
        return result;
    };

    /* Convenience function, that's all. */
    this.showAllLevelContainers = function() {  // public
        $("#level1Container").show();  
        $("#level2Container").show();
        $("#level3Container").show();
        $("#level4Container").show();
    };

    /*
     * Hide just the level containers you want to by passing in an array in argument 'containerLevels'.  An
     * argument of [2,4] will hide levelContainers 2 and 4.
     */
    this.hideLevelContainers = function(containerLevels) {  // public
        $.each(containerLevels, function(i, level) {
            $("#level" + level + "Container").hide();
        });
    };

    /*
     * Clear the HTML from just the level containers you want to by passing in an array in argument 'containerLevels'.  An
     * argument of [2,4] will clear levelContainers 2 and 4.
     */
    this.clearLevelContainers = function(containerLevels) {  // public
        $.each(containerLevels, function(i, level) {
            $("#level" + level + "Container").html("");
        });
    };

    /*
     * Show just the level containers you want to by passing in an array in argument 'containerLevels'.  An
     * argument of [2,4] will show levelContainers 2 and 4.
     */
    this.showLevelContainers = function(containerLevels) {  // public
        $.each(containerLevels, function(i, level) {
            $("#level" + level + "Container").show();
        });
    };

    /*
     * Find out which view is currently visible (grid, chart or map)
     */
    this.currentlyVisibleView = function() {  // public
        var result = "";
        if ($("#datapageView .pagedata").css("display") == "block") {
            result = "grid";
        } else if ($("#chartFrame").css("display") == "block" || $("#chartFrame").css("display") == "inline") {
            result = "chart";
        } else if ($("#mapFrame").css("display") == "block" || $("#mapFrame").css("display") == "inline") {
            result = "map";
        }
        return result;
    };

    /* 
     * Hide all three views (grid, chart, map) and their containers.
     */
    this.hideAllViews = function() {  // public
        $("#datapageView .pagedata").hide();
        $(".datapage").hide();
        $("#chartFrame").hide();
        $("#mapFrame").hide();
        $("#welcome").hide();
    };
    
    /*
     * Undo all the UI elements that changed when user clicked 'Get this data', and put up an error message.  Used
     * for cases when a service returns an error.
     */
    this.cancelGetThisData = function() {
        var thisObj = new Navtree();
        thisObj.hideAllViews();
        (new Geography()).tryDifferentGeographyMessage();
        $(".getthisdata a").removeClass("loading").text("Get this data").hide();
        thisObj.activateSubmitButton();
        thisObj.hideLevelContainers(["Search"]);
    };

    /*
     * Handler for a click on the 'Search' button in the Level 1 container.
     */
    this.searchClickHandler = function() {
        var thisObj = new Navtree();
        var geogObj = new Geography();

        thisObj.hideLevelContainers([2,3,4]);
        thisObj.showLevelContainers(["Search"]);
        
        /* Show the search element as the current selection */
        $("#level1Container li a").removeClass("selected");
        $("a.search").addClass("selected");

        /* Don't let geography flyout show while the rail is open */
        geogObj.cancelGeoUI();
        
        /* Rail might already be open, open it only if currently closed. */
        if (!$("#rail").hasClass("expanded")) {
            thisObj.animateBackdrop("open", function() {
                $("a#cancelNav").show();
                $("#rail").addClass("expanded");
                $(".listgroup").show();
                $(".sliver").show();
            });
        }
    };

}

