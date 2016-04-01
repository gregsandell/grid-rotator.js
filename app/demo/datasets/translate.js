var parse = require('csv-parse');
var fs = require('fs');
var fs2 = require('fs');
var outputJSON = {
    rows: [],
    "topics": [
        {"key": "race", "title": "Race"},
        {"key": "gender", "title": "Gender"},
        {"key": "school", "title": "School"}
    ],
    maps: {
        race: {
            aboriginal: {
                short: 'Aboriginal',
                long: 'Aboriginal'
            },
            non_aboriginal: {
                short: 'Non Aboriginal',
                long: 'Non Aboriginal'
            }
        },
        gender: {
            male: {
                long: 'Male',
                short: 'Male'
            },
            female: {
                long: 'Female',
                short: 'Female'
            }
        },
        school: {
            F0: {
                long: "Primary",
                short: "Primary"
            },
            F1: {
                long: "First",
                short: "First"
            },
            F2: {
                long: "Second",
                short: "Second"
            },
            F3: {
                long: "Third Form",
                short: "Third Form"
            }
        }
    }
};
fs.readFile('schooldays.csv', 'utf8', function (err, data) {
    parse(data, function (err, json) {
        //console.log(JSON.stringify(json));
        json.map(function(record, idx) {
            if (idx == 0) return true;
            var newRecord = {
                race: record[1],
                gender: record[2],
                school: record[3],
                value: record[5]
            };
            outputJSON.rows.push(newRecord);
        });
        //console.log(outputJSON);
        var jString = 'var SchooldaysSample = ' + JSON.stringify(outputJSON, null, 4) + ';';
        fs2.writeFile("Schooldays.js", jString, function(err) {
            if(err) {
                return console.log('Error writing file: ' + err);
            }

            console.log("The file was saved!");
        });
    });
});

//{
//    "datafield": "NUMNFRLETTER",
//    "timeperiod": "1996",
//    "value": "9",
//    "geog": "MERC"
//},


 //["", "Hair", "Eye", "Sex", "Freq"], ["1", "Black", "Brown", "Male", "32"], ["2", "Brown", "Brown", "Male", "53"]