data-grid
=========

Code for flipping and rotating sets of related data

The purpose of this code is to take sets of related x-y data and either flip the axes (x becomes y, and vice versa), or rotate the entire collection.  For example, if you have these two datasets:

{
    "2004": { 
        Cook:  234, Kane: 543, McHenry: 222
    },
    "2005": {
        Cook:  983, Kane: 113, McHenry: 888
    }
}

Here is an axis flip:

{
    Cook:  {
        "2004": 934, "2005": 983
    },
    Kane: {
        "2004": 543, "2005": 113
    },
    McHenry:  {
        "2004": 222, "2005": 888
    }
}

Data rotation is harder to explain, although if you watch this video http://www.youtube.com/watch?v=FfeH4n7k5pA, I explain it at 4:21.

