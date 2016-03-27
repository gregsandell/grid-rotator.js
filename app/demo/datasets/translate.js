var parse = require('csv-parse');
var fs = require('fs');
var fs2 = require('fs');
var outputJSON = {
    data: {
        rows: []
    },
    maps: {
        admit: {
            admitted: {
                short: 'Admitted',
                long: 'Admitted'
            },
            rejected: {
                short: 'Rejected',
                long: 'Rejected'
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
        department: {
            A: {
                long: "Department A",
                short: "A"
            },
            B: {
                long: "Department B",
                short: "B"
            },
            C: {
                long: "Department C",
                short: "C"
            },
            D: {
                long: "Department D",
                short: "D"
            },
            E: {
                long: "Department E",
                short: "E"
            },
            F: {
                long: "Department F",
                short: "F"
            },
        }
    }
};
fs.readFile('UCBAdmissions.csv', 'utf8', function (err, data) {
    parse(data, function (err, json) {
        //console.log(JSON.stringify(json));
        json.map(function(record, idx) {
            if (idx == 0) return true;
            var caseAltered = record.map(function (item, idx) {
                //console.log('idx = ' + idx);

                return item.toLowerCase();
            });
            var newRecord = {
                admit: caseAltered[1],
                gender: caseAltered[2],
                department: caseAltered[3],
                value: caseAltered[4]
            };
            outputJSON.data.rows.push(newRecord);
        });
        //console.log(outputJSON);
        var jString = 'var UCBAdmissionsSample = ' + JSON.stringify(outputJSON, null, 4) + ';';
        fs2.writeFile("UCBAdmissions.js", jString, function(err) {
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