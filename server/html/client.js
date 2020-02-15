let PLAYER = {};
let PLAYERINFOS = {};
let socket;

let url = "ws://10.0.0.115:8080";

function connect(url){
    socket = new WebSocket(url);

    socket.onopen = function(e) {
        console.log("[open] Connection established");
    };

    socket.onmessage = function(event) {

        let eventData = JSON.parse(event.data);
        console.log(eventData);

        if(eventData.type == "PLAYERINIT"){
            playerInit(eventData.data);
        }

        if(eventData.type == "MAPINIT"){
            mapInit(eventData.data);
        }

        if(eventData.type == "STATSUPDATE"){
            statsUpdate(eventData.data);
        }

        if(eventData.type == "MAPUPDATE"){
            mapUpdate(eventData.data);
        }

        if(eventData.type == "PLAYERINFO"){
            playerInfo(eventData.data);
        }

        if(eventData.type == "PING"){
            ping(eventData.data);
        }

        if(eventData.type == "MSG"){
            chatMessage(eventData.data);
        }
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log('[close] Connection closed cleanly');
        } else {
            console.log('[close] Connection died');
        }
        reconnect();
    };

    socket.onerror = function(error) {
        console.log('[error] '+ JSON.stringify(error.message));
    };

};

function reconnect(){
    if(socket.readyState == 3){
        console.log('[reconnecting]');
        connect(url);
    }
    if(socket.readyState != 1){
        setTimeout(reconnect, 2500);
    }
}
connect(url);


function ping(data){
    let ping = parseInt(data.substring(5));

    let d = new Date();
    let milisecs = d.getTime();

    console.log("Ping: "+ (milisecs-ping) +"ms");
}
