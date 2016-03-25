var parse = require('csv-parse');
var fs = require('fs');
var fs2 = require('fs');
var outputJSON = {
    data: {
        rows: []
    },
    maps: {
        hair: {
            black: {
                short: 'Black',
                long: 'Black Hair'
            },
            brown: {
                short: 'Brown',
                long: 'Brown Hair'
            },
            red: {
                short: 'Red',
                long: 'Red Hair'
            },
            blonde: {
                short: 'Blonde',
                long: 'Blonde Hair'
            }
        },
        eyes: {
            brown: {
                short: 'Brown',
                long: 'Brown Eyes'
            },
            blue: {
                short: 'Blue',
                long: 'Blue Eyes'
            },
            hazel: {
                short: 'Hazel',
                long: 'Hazel Eyes'
            },
            green: {
                short: 'Green',
                long: 'Green Eyes'
            },
        },
        sex: {
            male: {
                long: 'Male',
                short: 'Male'
            },
            female: {
                long: 'Female',
                short: 'Female'
            }
        }
    }
};
fs.readFile('HairEyeColor.csv', 'utf8', function (err, data) {
    parse(data, function (err, json) {
        //console.log(JSON.stringify(json));
        json.map(function(record, idx) {
            if (idx == 0) return true;
            var caseAltered = record.map(function (item, idx) {
                //console.log('idx = ' + idx);

                return item.toLowerCase();
            });
            var newRecord = {
                hair: caseAltered[1],
                eyes: caseAltered[2],
                sex: caseAltered[3],
                value: caseAltered[4]
            };
            outputJSON.data.rows.push(newRecord);
        });
        //console.log(outputJSON);
        var jString = 'var sampleData = ' + JSON.stringify(outputJSON, null, 4) + ';';
        fs2.writeFile("hairEyeSexSample.js", jString, function(err) {
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