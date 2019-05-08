/**
 * @author Jianwei Hu, Simeng Qu
 */

const MongoClient = require('mongodb').MongoClient;
const Server = require('mongodb').Server;
const url = 'mongodb://localhost:27017/project';

var db;
var collection;

MongoClient.connect(url, { useNewUrlParser: true },(err, client) => {
    if (err) {
        console.error(err);
        return
    }
    console.log("Connection established successfully");

    //...
    db = client.db("mydb");
    collection = db.collection("CrimeRecord");
});



// TODO: json file for database query
var queryInfo;
// TODO: json file for containing result geodata
var geoData = [{lat: 34.0707, lng: -118.2795},{lat: 34.0737, lng: -118.2795},{lat: 34.0757, lng: -118.2795}];


/***************************
    express framework part
 ****************************/
let express = require('express');
let app = express();

let server = app.listen(8081, function () {
    let port = server.address().port;
    console.log("To access the web, click http://localhost:%s/index.html", port)

});

app.get('/index.html', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
});


app.get("/query",function (request, response) {
    queryInfo = request.query;

    var query = {'Area ID': 2};
    var results = [];
    collection.find({}).limit(300000).project( {Location:1, _id: 0} ).toArray(function(err, res) {
        // res.json(res)
        for (let i = 0; i < res.length; i++){
            var tmp = res[i].Location.split(", ");
            var lat = Number(tmp[0].substr(1));
            var lng = Number(tmp[1].slice(0,-1));
            results[i] = {};
            results[i].lat = lat;
            results[i].lng = lng;

        }
        response.send(results)
    });
});

app.get("/requestGraph",function (request, response) {
    queryInfo = request.query;

    var query = {'Area ID': 2};

    collection.aggregate([
        {$unwind: "$Area Name"},
        {$sortByCount: "$Area Name"}
    ]).toArray(function (err, results) {
        console.log(results)
        response.send(results);
    });
});


