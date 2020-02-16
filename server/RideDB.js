RideDB = {};

RideDB.queue = {};

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
    ride.match = false;

    return ride;
};

RideDB.match = function(id){
    console.log("matching rides...");

    let r = RideDB.queue[id];
    if(r.match){ return r.match; }

    let potential = [];
    for (const ride of Object.values(RideDB.queue)) {
        if(ride.riderID != r.riderID) {
            let distance0 = Math.sqrt(Math.pow(ride.start[0] - r.start[0], 2) + Math.pow(ride.start[1] - r.start[1], 2));
            let distance1 = Math.sqrt(Math.pow(ride.end[0] - r.end[0], 2) + Math.pow(ride.end[1] - r.end[1], 2));
            let d = distance0 + distance1;

            let music = 0;
            let mlist = "";
            for (const m1 of r.music.split("/")) {
                for (const m2 of ride.music.split("/")) {
                    if(m1 == m2){
                        music++;
                        mlist += m1+"/";
                    }
                }
            }

            potential.push({id:ride.riderID, distance:d,  music:music, mlist:mlist})
        }
    }

    let max_score = 0;
    let max_scoreID = "";
    let matchMusic = "";

    for (const p of potential) {
        let score = (10 - p.distance) + p.music;
        if(score > max_score){
            max_scoreID = p.id;
            matchMusic = p.mlist;
        }
    }

    if(max_scoreID){
        r.match = max_scoreID;
        r.matchMusic = matchMusic;
        RideDB.queue[max_scoreID].match = id;
        RideDB.queue[max_scoreID].matchMusic = matchMusic;
        return max_scoreID;
    } else {
        return false;
    }
};

module.exports.DB = RideDB;