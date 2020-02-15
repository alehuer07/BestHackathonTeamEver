RideDB = {};

RideDB.queue = [];

RideDB.ListRide = function(ride){
    RideDB.queue[ride.riderID] = ride;
    console.log(RideDB.queue);
};

RideDB.DeListRide = function(id){
    delete RideDB.queue[id];
    console.log(RideDB.queue);
};

RideDB.newRide = function(id, start, end, music){
    let ride = {};

    ride.riderID = id;
    ride.start = start.split("/");
    ride.end = end.split("/");
    ride.music = music;

    return ride;
};

RideDB.match = function(id){
    console.log("matching rides...");

    let r = RideDB.queue[id];

    for (const ride of RideDB.queue.values()) {
        console.log(ride);
        if(ride.riderID != r.riderID){
            let distance0 = Math.sqrt(Math.pow(ride.start[0]+r.start[0], 2) + Math.pow(ride.start[1]+r.start[1], 2));
            let distance1 = Math.sqrt(Math.pow(ride.end[0]+r.end[0], 2) + Math.pow(ride.end[1]+r.end[1], 2));
            console.log("distance: " + distance0 +" / "+ distance1);
        }
    }

    if(false){
      return "";
    };

    return false;
};

module.exports.DB = RideDB;