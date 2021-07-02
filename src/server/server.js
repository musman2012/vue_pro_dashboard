const express = require('express');
const app = express();
const elasticsearch = require('elasticsearch');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');


const PORT = 5000;

var auth = 'elastic:PAL@2021_User';
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
})
app.get('/search', function (req, res) {
    console.log("search reqs recvd");
    let body = {
        size: 200,
        from: 0,
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
    console.log(body);
    client.search({ index: 'dev-mw-1', body: body, type: '_doc' })
        .then(results => {
            res.send(results.hits.hits);
        })
        .catch(err => {
            console.log(err)
            res.send([]);
        });

})


app.listen(PORT, function () {
    console.log('Your node.js server is running on PORT: ', PORT);
});