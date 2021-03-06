console.log("Initiating Server.js...");

const USER = require('./user.js');
const RIDEDB = require('./RideDB.js');

const app = require('express')();
const http = require('http').Server(app);

const serverUpTime = new Date(Date.now());
const port = 18080;

http.listen(port, function(){
    console.log('WebServer is listening on *:'+port);
});

// Add headers
//app.use(function (req, res, next) {

    // Website you wish to allow to connect
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost');

    // Request methods you wish to allow
    //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    //next();
//});

////////////////////////////
//    Webservice Code     //
////////////////////////////

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
    send(res, info);
});

app.get('/list', function(req, res){
    let info = {};

    if(!req.query.riderID) { error(res, "riderID is missing"); return; }
    if(!req.query.start){ error(res, "start is missing"); return; }
    if(!req.query.startText){ error(res, "startText is missing"); return; }
    if(!req.query.end){ error(res, "end is missing"); return; }
    if(!req.query.endText){ error(res, "endText is missing"); return; }
    if(!req.query.music){ error(res, "music is missing"); return; }

    let ride = RIDEDB.DB.newRide(req.query.riderID, req.query.start, req.query.startText, req.query.end, req.query.endText, req.query.music);
    RIDEDB.DB.ListRide(ride);

    info.status = "ok";
    send(res, info);
});

app.get('/delist', function(req, res){
    let info = {};
    if(!req.query.riderID) { error(res, "riderID is missing"); return; }

    RIDEDB.DB.DeListRide(req.query.riderID);

    info.status = "ok";
    send(res, info);
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

        send(res, info);
        return;
    } else {
        info.status = "ok";
        info.match = match;
        info.points = [RIDEDB.DB.queue[match].start,RIDEDB.DB.queue[riderID].start,RIDEDB.DB.queue[riderID].end,RIDEDB.DB.queue[match].end];
        info.points = [RIDEDB.DB.queue[match].startText,RIDEDB.DB.queue[riderID].startText,RIDEDB.DB.queue[riderID].endText,RIDEDB.DB.queue[match].endText];
        info.matchMusic = RIDEDB.DB.queue[match].matchMusic;

        send(res, info);
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

function send(res, info){
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5500');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.send(info);
    return;
}
function error(res, msg){
    let info = {};
    info.status = "error";
    info.error = msg;
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5500');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.send(info);
    return;
}