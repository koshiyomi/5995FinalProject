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
    db = client.db("project");
    collection = db.collection("crimedata");

    // create index and some fields - uncomment this part after running 
    collection.createIndex( { "Area Name": "text" } );

    collection.find({}, {Location:1, _id: 0}).forEach( function (x) {
        var c = x.Location.split(", ");
        var lat = Number(c[0].substr(1));
        var lng = Number(c[1].slice(0, -1));
        var id = x._id;
        var year = Number(x['Date Occurred'].substr(6));
        var areaLower = x['Area Name'].toLowerCase();

        collection.updateMany(
            {_id: id},
            { $set: {
                    lat: lat,
                    lng: lng} }
        );

        collection.updateMany(
            {_id: id},
            { $set: {
                    year: year} }
        );

        collection.updateMany(
            {_id: id},
            { $set: {
                    areaLowerCase: areaLower} }
        );

    });
});



//json file for database query
var queryInfo;


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
    areaName = queryInfo.myinput;
    //capitalized = areaName.charAt(0).toUpperCase() + areaName.slice(1).toLowerCase();
    areaLower = areaName.toLowerCase();

    if (queryInfo.gender === 'male'){
        var sex = 'M';
        var all = 'False';
    } else if (queryInfo.gender === 'female'){
        var sex = 'F';
        var all = 'False';
    } else if (queryInfo.gender === 'other'){
        var sex = 'Other';
        var all = 'False';
    } else {
        var all = 'True';
    }
    time = queryInfo.time;
    time = time.replace(":", "");
    lteTime = Number(time)+100;
    gteTime = Number(time)-100;

    if (areaLower.length === 0){
        if (time.length === 0){
            if (all === 'True'){
                var query = {};
            }
            else {
                var query = {"Victim Sex": sex};
            }
        }
        else{
            if (all === 'True') {
                var query = {"Time Occurred": { $lte: lteTime, $gte: gteTime } };
            }
            else{
                var query = {"Time Occurred": { $lte: lteTime, $gte: gteTime } , "Victim Sex": sex };
            }
        }
    }else{
        if (time.length === 0){
            if (all === 'True'){
                var query = {"areaLowerCase": areaLower};
            }
            else{
                var query = {"areaLowerCase": areaLower, "Victim Sex": sex};
            }
        }
        else{
            if (all === 'True'){
                var query = {"areaLowerCase": areaLower, "Time Occurred": { $lte: lteTime, $gte: gteTime } };
            }
            else{
                var query = {"areaLowerCase": areaLower.toLowerCase(), "Time Occurred": { $lte: lteTime, $gte: gteTime } , "Victim Sex": sex };
            }
        }
    }

    var results = [];
    collection.find(query).limit(300000).project( {Location:1, _id: 0} ).toArray(function(err, res) {
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

    collection.aggregate([
        {$unwind: "$Area Name"},
        {$sortByCount: "$Area Name"}
    ]).toArray(function (err, results) {
        console.log(results);
        response.send(results);
    });
});

app.get("/requestGraph2",function (request, response) {
    collection.aggregate([
        {$unwind: "$year"},
        {$sortByCount: "$year"}
    ]).toArray(function (err, results) {
        console.log(results);
        response.send(results);
    });
});
