console.log("Initiating Server.js...");
const USER = require('./user.js');
const RIDEDB = require('./RideDB.js');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);


const serverUpTime = new Date(Date.now());
const port = 18080;

http.listen(port, function(){
    console.log('WebServer is listening on *:'+port);
});

////////////////////////////
//    Webservice Code     //
////////////////////////////

//Answering with Index.html
/*
app.get('/', function(req, res){
    res.sendFile(__dirname + '/html/index.html');
});
app.get('/client.js', function(req, res){
    res.sendFile(__dirname + '/html/client.js');
});
*/

//API
app.get('/api/uptime', function(req, res){
    let info = {};
    info.serverUpTime = serverUpTime;
    res.send(info);
});

app.get('/status', function(req, res){
    let info = "<h1> Server is working! </h1>";
    res.send(info);
});

app.get('/checkin', function(req, res){
    let info = {};
    info.UserID = USER.HELPERS.GenerateID();
    res.send(info);
});

app.get('/list', function(req, res){
    let info = {};

    if(!req.query.riderID) { error(res, "riderID is missing"); return; }
    if(!req.query.start){ error(res, "start is missing"); return; }
    if(!req.query.end){ error(res, "end is missing"); return; }
    if(!req.query.music){ error(res, "music is missing"); return; }

    let ride = RIDEDB.DB.newRide(req.query.riderID, req.query.start, req.query.end, req.query.music);
    RIDEDB.DB.ListRide(ride);

    info.status = "ok";
    res.send(info);
});

app.get('/delist', function(req, res){
    let info = {};
    if(!req.query.riderID) { error(res, "riderID is missing"); return; }

    RIDEDB.DB.DeListRide(req.query.riderID);

    info.status = "ok";
    res.send(info);
});

app.get('/check', function(req, res){
    let info = {};
    if(!req.query.riderID) { error(res, "riderID is missing"); return; }

    let riderID = req.query.riderID;
    if(!RIDEDB.DB.queue[riderID]){ error(res, "ride is not yet requested"); return; }
    let match = RIDEDB.DB.match(riderID);

    if(!match){
        info.status = "ok";
        info.eta = "unknown";
        res.send(info);
        return;
    } else {
        info.status = "ok";
        info.match = match;
        info.points = [RIDEDB.DB.queue[match].start,RIDEDB.DB.queue[riderID].start,RIDEDB.DB.queue[riderID].end,RIDEDB.DB.queue[match].end];
        info.matchMusic = RIDEDB.DB.queue[match].matchMusic;
        res.send(info);
        return;
    }

});

// Helpers

function stringify(json) {
    let cache = [];
    let response = JSON.stringify(json, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Duplicate reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null;
    return response;
}

function error(res, msg){
    let info = {};
    info.status = "error";
    info.error = msg;
    res.send(info);
    return;
}