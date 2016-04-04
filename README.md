#grid-rotator.js

jQuery-based API for flipping and rotating sets of related data

##TL;DR
<br>
<span style="font-size: 16px; font-weight: bold">Bring me straight to [the demo](http://gregsandell.com/misc/grid-rotator)!</span>

##Purpose
This API allows one to take sets of related x-y data and either flip the axes (x becomes y, and vice versa), or rotate the entire collection.  It applies to datasets where there are three dimensions for every observation.  

For example, consider this small dataset surveying hair color, eye color and gender:
![](docImages/datagridStart.png?raw=true "Beginning dataset")
<i>Source: <https://vincentarelbundock.github.io/Rdatasets/datasets.html></i>

We have four tables (or grids) on the topic of eye color, one each for blue, brown, green, and hazel.  Each grid shows, for the given eye color, a breakdown of hair color to black, brown, red and blonde.  And finally, for each hair color, we have an observation for each gender.  For example for blue-eyed, black-haired individuals, 11 were found who were male, and 9 who were female.

An important feature here is that this multivariate data is <i>complete</i>:  every combination of dimensions has an observation.  (The API can also deal with missing values, but that is discussed later.)

The simplest kind of rotation offered by the API is where the axes simply swap:
![](docImages/axisSwap.png?raw=true "Dataset with swapped axes")
This of course, is trivial.  Where the API is helpful is in producing rotations over the entire family of grids.  Below we see the original topic of eye color has been substituted with hair color.  The observations are the same:  there are still 11 blue-eyed, black-haired males, and 9 females.  But the presentation has varied.
![](docImages/rotate1.png?raw=true "One rotation of original dataset")

One more rotation gives us the data organized by topic of gender:
![](docImages/rotate2.png?raw=true "Second rotation of original dataset")

##Input Data Requirements
Input data should be in JSON format with the following high-level design:

	{
	    data: {
	        rows: [ { }, { } ... { } ]
	    },
	    topics: [ ],
	    maps: { }
	}

Each object in <i>rows</i> has the following structure:

    {
        dimension_1_label: value_label,
        dimension_2_label: value_label,
        dimension_3_label: value_label,
        value:             observation
    }

For example, here is the first <i>row</i> object of the hair/eye/gender dataset:

    {
        hair:  "black",
        eyes:  "brown",
        sex:   "male",
        value: "32"
    }
<i>(The full hair/eye/gender dataset is found in the project in the file /app/demo/hairEyeSexSample.js)</i>

The <i>topics</i> field of the input data must be an array of three elements, one for each of the three dimensions:

         "topics": [
            {"key": "hair", "title": "Hair Color" },
            {"key": "eyes", "title": "Eye Color"  },
            {"key": "sex",  "title": "Gender"     }
         ]

The values that the dimensions <i>hair</i>, <i>eyes</i> and <i>sex</i> may take must be registered in advance in the <i>maps</i> portion of the input dataset.  For example, we see below that the dimension <i>hair</i> may take on the values <i>black</i>, <i>brown</i>, <i>red</i> and <i>blonde</i>.

    maps: {
        "hair": {
            "black":  {"short": "Black",  "long": "Black Hair"  },
            "brown":  {"short": "Brown",  "long": "Brown Hair"  },
            "red":    {"short": "Red",    "long": "Red Hair"    },
            "blonde": {"short": "Blonde", "long": "Blonde Hair" }
        },
        "eyes": {
            "brown":  {"short": "Brown",  "long": "Brown Eyes" },
            "blue":   {"short": "Blue",   "long": "Blue Eyes"  },
            "hazel":  {"short": "Hazel",  "long": "Hazel Eyes" },
            "green":  {"short": "Green",  "long": "Green Eyes" }
        },
        "sex": {
            "male":   {"short": "Male",   "long": "Male"       },
            "female": {"short": "Female", "long": "Female"     }
        }
    }

For each dimension or value label, one can have a short and long description.  This is a convenience for presentation output, where space for headers and labels may be at a premium.

The purpose of this map-lookup is (1) to act as a deterrent to misspellings in the data, and (2) to enforce completeness of data.

##Using the API
Include the javascript file in your code:

`
    <script src="grid-rotator-1.0.0.js"></script>
`

...and this will create a a global variable  available everywhere.  Initialize it with the input data and options:

    dataRotator.init(inputData, options);
    
<i>gridRotator</i> creates an internal representation of a single table suitable for using as input for visualization.  You can retrieve this representation with the call:

    var gridResult = dataRotator.getGridResult();

Here is the value of <i>gridResult</i> for the 'Blue Eyes' topic grid shown at the beginning:

    {
        x:[ "Male", "Female" ],
        rows: [
            { y: "Black Hair",  v: ["10", "5"  ] },
            { y: "Brown Hair",  v: ["25", "29" ] },
            { y: "Red Hair",    v: ["7",  "7"  ] },
            { y: "Blonde Hair", v: ["5",  "5"  ] }
        ]
    }
    
We have two columns with the labels <i>Male</i> and <i>Female</i>, and four rows of labels for hair color.  Finally the observations themselves appear in an array field called <i>v</i>.  This data can then be adapted as needed for the presentation context (e.g. HTML, Excel, S, Matlab).  

The particular presentation of x/y axes and rotation is determined by the options passed to the <i>init()</i> call.  The value of <i>options</i> the result above is:

    {xParam: "sex", yParam: "hair", topicParam: "eyes", topicSelected: "blue"}
    
To swap the x and y axes, you would simply swap the values for xParam and yParam in the gridParams, and make the same three calls we made above.  This would produce a <i>gridResult</i> of:

    {
        x: [ "Black Hair", "Brown Hair", "Red Hair", "Blonde Hair" ],
        rows: [
            { y: "Male",   v: [ "11", "50", "10", "30"] },
            { y: "Female", v: [ "9",  "34", "7",  "64"] }
        ]
    }

To make a rotation of the above, you could take the previous <i>options</i>:

    {xParam: "hair", yParam: "sex", topicParam: "eyes", topicSelected: "blue"}
    
...and swap out one of the x- or yParams to become the new topic, such as:

    {xParam: "eyes", yParam: "sex", topicParam: "hair", topicSelected: "black"}
    
##Missing Values
If the input dataset is not <i>complete</i> (i.e. there are any missing values for fulling crossing topicParam, xParam and yParam) 
the observation for such datapoints are represented in the output with the string "n/a" (for 'not available').

Having missing values does not cause gridRotator to fail, 

##Data Validation
There are several routines to validate your input data and options.  The simplest one is:

    gridRotator.validateSuite(inputData, options, {noisy: true});
    
This will run all validations and return true if add your input is correct for gridRotator.  The 3rd argument is options for the validators.  If <i>noisy</i> is true, as above, it will execute a javascript <i>console.warn()</i> describing the first problem it encountered.  

###Automatic Validation
gridRotator does not attempt to validate your data before it starts acting on it.  However if bad data causes processing to fail, gridRotator will automatically call <i>gridRotator.validateSuite()</i> with the noisy option on, so you can diagnose the problem in the browser's console.

If bad data caused a failure, calls to <i>gridRotator.getGridResult()</i> will return an empty object.  

###Validation Methods
The individual validation methods are as follows.  All of them return true if the data is valid, and will write to <i>console.warn()</i> if the <i>noisy</i> option is set.  

This will validate the options only:

    gridRotator.validateOptions();
    
There are two methods for validating the input data.  The first checks just that the object has the proper structure:

    gridRotator.validateJsonSchema();
    
...and the second checks the internal consistency of the object:

    gridRotator.validateInputData();

<i>validateInputData()</i> is dependent on correct object structure, so calling it should always be preceded by a call to <i>validateJsonSchema()</i>.

Finally there is a method for checking consistency between the input data and a set of options:

    gridRotator.validateOptionsViaData();

<i>validateOptionsViaData()</i> is dependent on correct input data, so it should always be preceded by a call to <i>validateInputData()</i>.

##Demo Code
gridRotator comes with code in the <i>/app/demo</i> folder.  It requires no server, and can be run by simply loading <i>index.html</i> into your browser.  The demo is implemented in javascript in the file *gridRotatorCtrl.js*.

The first thing the demo illustrates is the iteration through the full family of grids for the given options.  The beginning of this documentation showed iteration through the family of eye colors, of which there are four. The *topicParam* field is therefor set to *eyes*.  For iteration, the *topicSelected* field designates which of the four colors to generate a plot for.  *gridRotator.init()* is called, followed by call to gridRotatorCtrl's *generateView()* method to generate the html for one table.  For next iteration, only the *topicSelected* field is changed, and the view is generated again, and so on, through the remaining two eye colors.  Each table has the same x and y axes of hair color and gender, respectively (corresponding to the settings of the *xParam* and *yParam* options).  The total number of observations is 32.  

With the family of grids for the given topic in view, you can now apply rotations.  The demo shows two buttons:

![](docImages/buttons.png?raw=true "Rotation Buttons")

The label on the left shows the current topic family, as specified by the *topicParam* field.  The button next to it rotates the whole family of grids.  It causes a switch to the next topic family, gender.  The same 32 observations are displayed, but with:

* Gender moved from the y axis to the topic
* Hair color moved from the x axis to the x axis
* Eye color moved from the topic to the y axis

The button on the right performs x- and y-axis swapping.  Returning to the topic family of eye color example, an axis swap will:

* Move hair color from x- to y-axis
* Move gender from y- to x-axis


##Dependencies
* jQuery (currently works with version 2.2.0)

