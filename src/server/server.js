const express = require('express');
const app = express();
const elasticsearch = require('elasticsearch');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
let mysql = require('mysql')

const PORT = 5000;

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'usman_pal2021',
    database: 'pal_data'
});

connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
});
// PAL@2021_User 
var auth = 'elastic:UH42cXn5QC3iCkT5EGV3';
var protocol = 'http';
var hostUrls = [
    'localhost'
];

var hosts = hostUrls.map(function (host) {
    return {
        protocol: protocol,
        host: host,
        auth: auth
    };
});

app.set('port', process.env.PORT || 5000);
app.use(cors());
app.use(bodyParser.json());


const client = new elasticsearch.Client({
    hosts: hosts
    // sniffOnStart: true
});

client.ping({ requestTimeout: 30000 }, function (error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
    }
});
app.get('/', function (req, res) {
    res.send("<h1>Hello</h1>")
});

app.get('/insertDataDB', function (req, res) {
    var sql_query = "INSERT INTO Users (Name, Email, Password, Company) VALUES ('"
    +req.query['Name']+"', '"
    +req.query['Email']+"', '"
    +req.query['Password']+"', '"
    +req.query['Company']+"');";
    console.log(sql_query)
    connection.query(sql_query, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
});

app.get('/getCredsDB', function (req, res) {
    var email = req.query['Email'];
    var sql_query = 'SELECT Password from Users WHERE Email = ?';
    //  (Name, Email, Password, Company) VALUES ('"
    // +req.query['Name']+"', '"
    // +req.query['Email']+"', '"
    // +req.query['Password']+"', '"
    // +req.query['Company']+"');";
    console.log(sql_query)
    connection.query(sql_query, [email], function (err, result) {
        if (err) throw err;
        console.log("Password is "+result);
        res.send(result);
    });
});

app.get('/search', function (req, res) {
    console.log("search reqs recvd");

    let body2 = {
        size: 200,
        from: 0,
        sort : [
            { "@timestamp" : {"order": "desc", "format": "strict_date_optional_time_nanos"}}
        ],
        //fuzziness: "AUTO:0,2",
        query: {
            // Recipe: req.query['q'],
            // FLAG: 'END'
            bool: {
                must: [
                    {
                        match: {
                            Line: req.query['q']
                        }
                    },
                    {
                        match: {
                            FLAG: "END"
                        }
                    },
                    {
                        match: {
                            Recipe: req.query['recipe']
                        }
                    },
                    {
                        range: {
                            "@timestamp": {
                                gte: req.query['sDate'],
                                lte: req.query['eDate']
                            }
                        }
                    }
                ]
            }
        }
    }

    let body = {
        size: 200,
        from: 0,
        sort : [
            { "@timestamp" : {"order": "desc", "format": "strict_date_optional_time_nanos"}}
        ],
        
        query: {
            // Recipe: req.query['q'],
            // FLAG: 'END'
            bool: {
                must: [
                    {
                        match: {
                            Line: req.query['q']
                        }
                    },
                    {
                        match: {
                            FLAG: "END"
                        }
                    },
                    {
                        range: {
                            "@timestamp": {
                                gte: req.query['sDate'],
                                lte: req.query['eDate']
                            }
                        }
                    }
                ]
            }
        }
    }
    //console.log(body);
    var selected_body = body;
    if (req.query['recipe'] !== '*'){
        selected_body = body2;
    }
    console.log(selected_body)
    client.search({ index: 'dev-mw-test1', body: selected_body, type: '_doc' })
        .then(results => {
            console.log(results.hits.hits);
            res.send(results.hits.hits);
        })
        .catch(err => {
            console.log(err)
            res.send([]);
        });

});

app.get('/fetchPerfData', function (req, res) {
    console.log("search reqs recvd");
    let body = {
        size: 500,
        from: 0,
        sort : [
            { "@timestamp" : {"order": "asc", "format": "strict_date_optional_time_nanos"}}
        ],
        query: {
            // Recipe: req.query['q'],
            // FLAG: 'END'
            bool: {
                must: [
                    {
                        match: {
                            Batch_ID: req.query['q']
                        }
                    },
                    {
                        match: {
                            FLAG: "SCALE"
                        }
                    }
                ]
            }
        }
    }
    console.log(body);
    client.search({ index: 'dev-mw-test1', body: body, type: '_doc' })
        .then(results => {
            res.send(results.hits.hits);
        })
        .catch(err => {
            console.log(err)
            res.send([]);
        });

});

//fetchBatchData
app.get('/fetchBatchData', function (req, res) {
    console.log("search reqs recvd");
    let body = {
        size: 500,
        from: 0,
        sort : [
            { "@timestamp" : {"order": "asc", "format": "strict_date_optional_time_nanos"}}
        ],
        query: {
            // Recipe: req.query['q'],
            // FLAG: 'END'
            bool: {
                must: [
                    {
                        match: {
                            Batch_ID: req.query['q']
                        }
                    },
                    {
                        match: {
                            FLAG: "SC_AG"
                        }
                    }
                ]
            }
        }
    }
    console.log(body);
    client.search({ index: 'dev-mw-test1', body: body, type: '_doc' })
        .then(results => {
            res.send(results.hits.hits);
        })
        .catch(err => {
            console.log(err)
            res.send([]);
        });

});

app.get('/fetchBatchReportData', function (req, res) {
    console.log("search reqs recvd");
    let body = {
        size: 1000,
        from: 0,
        query: {
            // Recipe: req.query['q'],
            // FLAG: 'END'
            bool: {
                must: [
                    {
                        match: {
                            Batch_ID: req.query['q']
                        }
                    }
                ]
            }
        }
    }
    console.log(body);
    client.search({ index: 'dev-mw-test1', body: body, type: '_doc' })
        .then(results => {
            res.send(results.hits.hits);
        })
        .catch(err => {
            console.log(err)
            res.send([]);
        });

});

app.get('/fetchSealTorqueData', function (req, res) {
    console.log("search reqs recvd");
    let body = {
        size: 500,
        from: 0,
        sort : [
            { "@timestamp" : {"order": "asc", "format": "strict_date_optional_time_nanos"}}
        ],
        query: {
            // Recipe: req.query['q'],
            // FLAG: 'END'
            bool: {
                must: [
                    {
                        match: {
                            FLAG: "ENG_TORQUE" //req.query['q']
                        }
                    }
                ]
            }
        }
    }
    console.log(body);
    client.search({ index: 'dev-eng-test', body: body, type: '_doc' })
        .then(results => {
            res.send(results.hits.hits);
        })
        .catch(err => {
            console.log(err)
            res.send([]);
        });

});

app.get('/fetchMotorTempData', function (req, res) {
    let body = {
        size: 1000,
        from: 0,
        sort : [
            { "@timestamp" : {"order": "asc", "format": "strict_date_optional_time_nanos"}}
        ],
        query: {
            // Recipe: req.query['q'],
            // FLAG: 'END'
            bool: {
                must: [
                    {
                        match: {
                            FLAG: "ENG_TEMP" //req.query['q']
                        }
                    }
                ]
            }
        }
    }
    console.log(body);
    client.search({ index: 'dev-eng-test', body: body, type: '_doc' })
        .then(results => {
            res.send(results.hits.hits);
        })
        .catch(err => {
            console.log(err)
            res.send([]);
        });
});

app.get('/fetchAlarmData', function (req, res) {
    console.log("search reqs recvd");
    let body = {
        size: 1000,
        from: 0,
        sort : [
            { "@timestamp" : {"order": "asc", "format": "strict_date_optional_time_nanos"}}
        ],
        query: {
            // Recipe: req.query['q'],
            // FLAG: 'END'
            bool: {
                must: [
                    {
                        match: {
                            FLAG: "ENG_ALARM" //req.query['q']
                        }
                    },
                    {
                        range: {
                            "@timestamp": {
                                gte: req.query['sDate'],
                                lte: req.query['eDate']
                            }
                        }
                    }
                ]
            }
        }
    }
    console.log(body);
    client.search({ index: 'dev-eng-test', body: body, type: '_doc' })
        .then(results => {
            res.send(results.hits.hits);
        })
        .catch(err => {
            console.log(err)
            res.send([]);
        });

});

app.listen(PORT, function () {
    console.log('Your node.js server is running on PORT: ', PORT);
});