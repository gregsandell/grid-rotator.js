#data-rotator

Library for flipping and rotating sets of related data

##Purpose
This API allows one to take sets of related x-y data and either flip the axes (x becomes y, and vice versa), or rotate the entire collection.  It applies to datasets where there are three dimensions for every observation.  

For example, consider this small dataset surveying hair color, eye color and gender:
![](docImages/datagridStart.png?raw=true "Beginning dataset")
<i>Source: <https://vincentarelbundock.github.io/Rdatasets/datasets.html></i>

We have four tables (or grids) on the topic of eye color, one each for blue, brown, green, and hazel.  Each grid shows, for the given eye color, a breakdown of hair color to black, brown, red and blonde.  And finally, for each hair color, we have an observation for each gender.  For example for blue-eyed, black-haired individuals, 11 were found who were male, and 9 who were female.

An important feature here is that this multivariate data is complete:  every combination of dimensions has an observation.  (The API can also deal with missing values, but that is discussed later.)

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
	    maps: { }
	}

Each object in <i>rows</i> has the following structure:

    {
        dimension_1_label: value_label,
        dimension_2_label: value_label,
        dimension_3_label: value_label,
        value: observation
    }

For example, here is the first <i>row</i> object of the hair/eye/gender dataset:

    {
        hair: "black",
        eyes: "brown",
        sex: "male",
        value: "32"
    }
<i>(The full hair/eye/gender dataset is found in the project in the file /app/demo/hairEyeSexSample.js)</i>

The three fieldnames of hair, eyes and sex, and the three values of black, brown and male are all variable names that refer to fully-spelled out values in the <i>map</i> portion of the input dataset.  Here is an abbreviated view of the <i>map</i> field of the hair/eye/gender dataset:

    maps: {
        hair: {
            black: { short: "Black", long: "Black Hair" },
            ... same for brown, red & blonde ...
        },
        eyes: {
            brown: { short: "Brown", long: "Brown Eyes" },
            ... same for blue, hazel & green ...            
        },
        sex: {
            male: { long: "Male", short: "Male" },
            ... same for female ...
        }
    }

For each dimension or value label, one can have a short and long description.  This is a convenience for presentation output, where space for headers and labels may be at a premium.

The purpose of this map-lookup is (1) to act as a deterrent to misspellings in the data, and (2) to enforce completeness of data.

##Using the API
    var dataRotator = new DataRotator(inputData, gridParams);
    dataRotator.init();
    var gridResult = dataRotator.getGridResult();
    
This produces a representation of a single table suitable for using as input for visualization.  Here is the value of <i>gridResult</i> for the 'Blue Eyes' topic grid shown at the beginning:

    {
        x:[ "Male", "Female" ],
        rows: [
            { y: "Black Hair",  v: ["10", "5"  ] },
            { y: "Brown Hair",  v: ["25", "29" ] },
            { y: "Red Hair",    v: ["7",  "7"  ] },
            { y: "Blonde Hair", v: ["5",  "5"  ] }
        ]
    }
    
The particular presentation of x/y axes and rotation is determined by the parameters.  The value of <i>gridParams</i> the result above is:

    {topicParam: "eyes", xParam: "sex", yParam: "hair", suppressNAs: true, topicSelected: "blue"}
    
To swap the x and y axes, you would simply swap the values for xParam and yParam in the gridParams, and make the same three calls we made above.  This would produce a <i>gridResult</i> of:

    {
        x: [ "Black Hair", "Brown Hair", "Red Hair", "Blonde Hair" ],
        rows: [
            { y: "Male",   v: [ "11", "50", "10", "30"] },
            { y: "Female", v: [ "9",  "34", "7",  "64"] }
        ]
    }

To make a rotation of the above, you could take the previous <i>gridParams</i>:

    {topicParam: "eyes", xParam: "hair", yParam: "sex", suppressNAs: true, topicSelected: "blue"}
    
...and swap out one of the x- or yParams to become the new topic, such as:

    {topicParam: "hair", xParam: "eyes", yParam: "sex", suppressNAs: true, topicSelected: "black"}
   

