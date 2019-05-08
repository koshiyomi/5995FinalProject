const MongoClient = require('mongodb').MongoClient;
const Server = require('mongodb').Server;
const url = 'mongodb://localhost:27017/project';


MongoClient.connect(url, { useNewUrlParser: true },(err, client) => {
    if (err) {
        console.error(err);
        return
    }
    console.log("Connection established successfully");

    //...
    const db = client.db("project");
    const collection = db.collection("crimedata");

    var query = { 'Area ID': 2 };

    collection.aggregate( [
        { $unwind: "$Area Name" },
        { $sortByCount: "$Area Name" }
    ]).toArray(function(err, results) {
        console.log(results);
    });

    collection.find(query).project( {Location:1, _id: 0} ).toArray(function(err, results) {
        // res.json(results)
        if (err) throw err;
        console.log(results);
        client.close();
    });


    // db.zipcodes.aggregate( [
    //     { $group: { _id: { state: "$state", city : "$city"} } },
    //     { $match: { "_id.state" : "IA" } },
    //     { $count: "num cities in IA " }
    // ] )

    // collection.find({ 'Area ID': 2 }, function(err, items) {
    //     console.log(items)
    // });
    // collection.findOne({}, function(err, result) {
    //     if (err) throw err;
    //     console.log(result);
    //     client.close();
    // });


});

