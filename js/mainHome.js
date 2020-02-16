//Tab control for sidebar
const tabs = $$(".tab");
tabs.forEach(t => (t.onclick = tabify));

function tabify(evt) {
  tabs.forEach(t => t.classList.remove("tab-active"));
  if (evt.target.id === "tab-1") {
    $(".tab-bar").style.transform = "translateX(0)";
    evt.target.classList.add("tab-active");
    $("#content-group-1").style.transform = "translateX(0)";
    $("#content-group-2").style.transform = "translateX(100%)";
  } else {
    $(".tab-bar").style.transform = "translateX(100%)";
    evt.target.classList.add("tab-active");
    $("#content-group-1").style.transform = "translateX(-100%)";
    $("#content-group-2").style.transform = "translateX(0)";
  }
}

const rotation = new MapRotation(map);

function calculateView() {
  const options = {
    theme: $("#day").checked
      ? "day"
      : "night",
    static: $("#static").checked
  };
  if (options.static) {
    rotation.stop();
  } else {
    rotation.start();
  }
}
var calculateRoute = function (start, destination) {
  feedbackTxt.innerHTML = "";
  // generate routing request
  var transportMode = "car";
  if (vehicles.value == "3" || vehicles.value == "9") {
    transportMode = "truck";
  }
  if (vehicles.value == "9" && serverURL.value.search("fleet") != -1) {
    transportMode = "delivery";
  }

  var hasTrailer = null,
    shippedHazardousGoods = null,
    limitedWeight = null,
    trailerWeight = null,
    height = null,
    width = null,
    length = null,
    heightAbove1stAxle = null;

  if (parseInt(trailerType.value) > 0) {
    hasTrailer = "&trailersCount=1";
  }

  if (parseInt(hazardousType.value) == 1) {
    shippedHazardousGoods = "&shippedHazardousGoods=explosive";
  } else if (parseInt(hazardousType.value) == 2) {
    shippedHazardousGoods = "&shippedHazardousGoods=other";
  }

  if (parseInt(vehWeight.value) > 0) {
    if (parseInt(vehWeight.value) > parseInt(totalWeight.value)) {
      alert("Total Weight cannot be smaller than Vehicle Weight");
      return;
    }
    limitedWeight = "&limitedWeight=" + totalWeight.value / 1000 + "t";
  }

  if (parseInt(vehHeight.value) > 0 || parseInt(trailerHeight.value) > 0) {
    height = "&height=" + (
      parseInt(vehHeight.value) > parseInt(trailerHeight.value)
      ? parseInt(vehHeight.value)
      : parseInt(trailerHeight.value)) / 100 + "m";
  }

  if (parseInt(totalWidth.value) > 0) {
    width = "&width=" + totalWidth.value / 100;
  }

  if (parseInt(totalLength.value) > 0) {
    length = "&length=" + totalLength.value / 100;
  }

  if (document.getElementById("heightAbove1stAxle").value != 0) {
    heightAbove1stAxle = document.getElementById("heightAbove1stAxle").value / 100 + "m";
  }

  var vspec = `&tollVehicleType=${
  vehicles.value}&trailerType=0&vehicleNumberAxles=2&trailerNumberAxles=0&hybrid=0
          &emissionType=5&fuelType=petrol&trailerHeight=${
  trailerHeight.value}&vehicleWeight=${vehWeight.value}
          &disabledEquipped=${
  disabledEquipped.value}&minimalPollution=minPollution.value&hov=${hov.value}
          &passengersCount=${nrPassengers.value}&tiresCount=${
  nrOfTotalTires.value}&commercial=${commercial.value}
          &heightAbove1stAxle=${heightAbove1stAxle}`;

  if (width != null && width.length > 0) 
    vspec += width;
  if (length != null && length.length > 0) 
    vspec += length;
  if (shippedHazardousGoods != null && shippedHazardousGoods.length > 0) 
    vspec += shippedHazardousGoods;
  var routerParamsValue = "";
  var finalParamsValue = "";
  if (routerParamsValue !== "") {
    var paramsArray = [];
    var components = routerParamsValue.split("&");
    for (var i = 0; i < components.length; i++) {
      var key = components[i].split("=");
      if (key[0].substr(0, "waypoint".length) === "waypoint") {
        continue; // ignore waypoints because we already specified.
      }
      if (key[0] === "mode") {
        continue; // Ignore mode since cor build this inside
      }
      paramsArray.push(components[i]);
    }
    finalParamsValue = paramsArray.join("&");
  }

  var routeAlternativesRequested = false;
  if (document.getElementById("routeAlternatives").value != null && document.getElementById("routeAlternatives").value != "0") {
    routeAlternativesRequested = true;
  }
  var isDTFilteringEnabled = document.getElementById("chkEnableDTFiltering").checked;

  var rollupPrm = serverURL.value.search("fleet") != -1
    ? "rollups"
    : "rollup";
  // Preparing the tollcost API end with all required params
  var urlRoutingReq = `https://fleet.ls.hereapi.com/2/calculateroute.json?apiKey={YOUR_API_KEY}&waypoint0=${
  start.lat},${start.lng}&detail=1&waypoint1=${destination.lat},${destination.lng}
          &routelegattributes=li&routeattributes=gr&maneuverattributes=none&linkattributes=${ "none,rt,fl"}&legattributes=${ "none,li,sm"}&currency=${
  document.getElementById("currency").value}&departure=
          ${
  isDTFilteringEnabled
    ? document.getElementById("startRouteDate").value + "T" + document.getElementById("startRouteTime").value
    : ""}
          ${vspec}&mode=fastest;${transportMode};traffic:disabled${
  shippedHazardousGoods != null && shippedHazardousGoods.length > 0
    ? shippedHazardousGoods
    : ""}
          &${rollupPrm}=none,country;tollsys${
  routeAlternativesRequested
    ? "&alternatives=" + document.getElementById("routeAlternatives").value
    : ""}&jsoncallback=parseRoutingResponse`;

  $("#mydiv").fadeIn("slow");

  script = document.createElement("script");
  script.src = urlRoutingReq;
  document.body.appendChild(script);
};

function parseRoutingResponse(resp) {
  feedbackTxt.innerHTML = "";
  if (resp.errors != undefined && resp.errors.length != 0) {
    if (resp.errors[resp.errors.length - 1] == "NoRouteFound") {
      alert("Please consider to change your start or destination as the one you entered is not reachable with the given vehicle profile");
      feedbackTxt.innerHTML = "The Router service is unable to compute the route: try to change your start / destination point";
    } else {
      alert(JSON.stringify(resp));
      $("#mydiv").fadeIn("slow");
      feedbackTxt.innerHTML = JSON.stringify(resp);
    }
    return;
  }
  if (resp.response == undefined) {
    if (resp.subtype == "NoRouteFound") {
      alert("Please consider to change your start or destination as the one you entered is not reachable with the given vehicle profile");
      feedbackTxt.innerHTML = "The Router service is unable to compute the route: try to change your start / destination point";
    } else {
      alert(resp.subtype + " " + resp.details);
      feedbackTxt.innerHTML = resp.error;
    }
    return;
  }
  routeLinkHashMap = new Object();
  // create link objects
  for (var r = 0; r < resp.response.route.length; r++) {
    for (var m = 0; m < resp.response.route[r].leg[0].link.length; m++) {
      var strip = new H.geo.LineString(),
        shape = resp.response.route[r].leg[0].link[m].shape,
        i,
        l = shape.length;
      for (i = 0; i < l; i += 2) {
        strip.pushLatLngAlt(shape[i], shape[i + 1], 0);
      }
      routeColors[r] = routeColor[r];
      var link = new H.map.Polyline(strip, {
        style: {
          lineWidth: routeStroke - (r + 1), // alternatives get smaller line with
          strokeColor: routeColor[r]
        }
      });
      link.setArrows({color: "#F00F", width: 2, length: 3, frequency: 4});
      link.$linkId = resp.response.route[r].leg[0].link[m].linkId;

      routeLinkHashMap[
        resp.response.route[r].leg[0].link[m].linkId.lastIndexOf("+", 0) === 0
          ? resp.response.route[r].leg[0].link[m].linkId.substring(1)
          : resp.response.route[r].leg[0].link[m].linkId
      ] = link;

      group.addObject(link);
      link.addEventListener("tap", function (e) {
        var link = new H.map.Polyline(strip, {
          style: {
            lineWidth: routeStroke - (r + 1), // alternatives get smaller line with
            strokeColor: "rgba(240, 255, 0, 1)",
            lineCap: "butt"
          }
        });
        map.addObject(link);
      });
    }
  }

  map.addObject(group);

  (async function () {
    await sleep(2000);
    map.setZoom(map.getViewModel().getLookAtData().zoom - 1);

    console.log("sleep");
  })();
  map.getViewModel().setLookAtData({
    bounds: group.getBoundingBox()
  }, true);

  for (var i = 0; i < resp.response.route.length; i++) {
    highlightRoute(resp.response.route[i].tollCost.routeTollItems, i);

    showTceCost(resp.response.route[i].tollCost.costsByCountryAndTollSystem, resp.response.route[i].cost, resp.response.route[i].summary, resp.warnings, routeIDs[i], routeColors[i]);
  }
  $("#mydiv").fadeOut("slow");
}

function highlightRoute(routeTollItems, routeAlternative) {
  if (routeTollItems != null) {
    for (var i = 0; i < routeTollItems.length; i++) {
      var tollType = routeTollItems[i].tollType;
      var color = ppType_S_Color[routeAlternative];
      if (tollType == "A") {
        color = ppType_A_Color[routeAlternative];
      } else if (tollType == "a") {
        color = ppType_a_Color[routeAlternative];
      } else if (tollType == "S") {
        color = ppType_S_Color[routeAlternative];
      } else if (tollType == "p") { 
        color = ppType_p_Color[routeAlternative];
      } else if (tollType == "F") {
        color = ppType_F_Color[routeAlternative];
      } else if (tollType == "K") {
        color = ppType_K_Color[routeAlternative];
      } else if (tollType == "U") {
        color = ppType_U_Color[routeAlternative];
      }

      for (var j = 0; j < routeTollItems[i].linkIds.length; j++) {
        // set color and stroke of links
        var tollstroke = tollCostStroke - (routeAlternative + 1); // route alternatives have a different stroke
        var link = routeLinkHashMap[routeTollItems[i].linkIds[j]];
        if (link.getStyle().strokeColor == routeColor[routeAlternative]) {
          // only change link color to toll color if not already modified
          link.setStyle({strokeColor: color, lineWidth: tollstroke});
        }
      }

      //toll structures
      if (routeTollItems[i].tollStructures != null) {
        for (var j = 0; j < routeTollItems[i].tollStructures.length; j++) {
          console.log({routeTollItems: routeTollItems[i]});
          createTollMarker(routeTollItems[i].tollStructures[j], routeTollItems[i]);
        }
      }
    }
  }
}

var createIconMarker = function (line1, line2) {
  var svgMarker = svgMarkerImage_Line;

  svgMarker = svgMarker.replace(/__line1__/g, line1);
  svgMarker = svgMarker.replace(
    /__line2__/g, line2 != undefined
    ? line2
    : "");
  svgMarker = svgMarker.replace(
    /__width__/g, line2 != undefined
    ? line2.length * 4 + 20
    : line1.length * 4 + 80);
  svgMarker = svgMarker.replace(
    /__widthAll__/g, line2 != undefined
    ? line2.length * 4 + 80
    : line1.length * 4 + 150);

  return new H.map.Icon(svgMarker, {
    anchor: new H.math.Point(24, 57)
  });
};

function showTceCost(costByCountryAndTollSystem, costs, summary, warnings, routeName, routeColors) {
  var html_code = "";

  if (warnings) {
    for (var j = 0; j < warnings.length; j++) {
      // check only category 10 -> boat ferry and train ferry, both can be on one route.
      if (warnings[j].category == 10 && warnings[j].context.includes("boat")) {
        feedbackTxt.innerHTML += '<br/></br><span style="color:#ff0000">Route contains boat ferry links which might add cost</span>';
      } else if (warnings[j].category == 10 && warnings[j].context.includes("train")) {
        feedbackTxt.innerHTML += '<br/></br><span style="color:#ff0000">Route contains train ferry links which might add cost</span>';
      }
    }
  }

  if (!costs) {
    //feedbackTxt.innerHTML += "<br/><br/>None.";
  } else {
    html_code += '<div class="card" style="width: 23rem;border: 8px solid rgba(0,0,0,.125);"><div class="card-body">';
    html_code += '<div style="height: 28px; padding: 5px; border-radius: 10px; margin-bottom: 5px; text-align: center; color: aliceblue; width: 300px;background-color:' + routeColors + '"><h6>Route: ' + routeName + "</h6></div>";
    html_code += "<p>Total Toll Cost: " + costs.totalCost + " " + costs.currency + ". " + summary.text + "</p>";
  }

  if (costByCountryAndTollSystem != null) {
    var feedback = "";
    feedback += "";

    var prevCoutry = "";

    if (costByCountryAndTollSystem.length > 0) {
      feedback += "<h8>Toll Cost breakdown:</h8>";
    }

    for (var j = 0; j < costByCountryAndTollSystem.length; j++) {
      if (prevCoutry != costByCountryAndTollSystem[j].country) {
        feedback += '<p style="font-weight: bold;">' + costByCountryAndTollSystem[j].country + "</p>";
        prevCoutry = costByCountryAndTollSystem[j].country;
      }

      feedback += "<ul><li>";
      if (costByCountryAndTollSystem[j].name != null && costByCountryAndTollSystem[j].name.trim().length > 0) {
        feedback += "" + costByCountryAndTollSystem[j].name + ": ";
      } else if (costByCountryAndTollSystem[j].tollSystemId != null && costByCountryAndTollSystem[j].tollSystemId.trim().length > 0) {
        feedback += "Toll System ID " + costByCountryAndTollSystem[j].tollSystemId + ": ";
      } else {
        feedback += "Toll : ";
      }
      feedback += costByCountryAndTollSystem[j].amountInTargetCurrency + " " + costs.currency;
      feedback += "</li></ul>";
    }

    html_code += feedback;
  }
  feedbackTxt.innerHTML += html_code + "</div>";
  return; // done
}
