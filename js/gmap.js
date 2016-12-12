// delay between geocode requests - at the time of writing, 100 miliseconds seems to work well
var delay = 100000;
var fehlgeschlagen = false;

// ====== Geocoding ======
function getAddress(haltestelle, next) {
    console.log("getAddress");
//debugger;
    var lat = haltestelle.Latitude;
    console.log(lat);
    var long = haltestelle.Longitude;
    console.log(long);
    var directionsService = new google.maps.DirectionsService;
    var test = new google.maps.LatLng(lat, long);
    directionsService.route({
        origin:test ,
        destination: "Karl-Köglsperger-Straße 3-9, München",
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions:{
            departureTime: new Date(1481180400000)
        }
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            duration = response.routes[0].legs[0].duration.value /60;
            document.getElementById('transit').innerHTML += duration.toFixed(0) + ", ";
            console.log("transit");
            fehlgeschlagen = false;
        } else {
            if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                console.log("OVER_QUERY_LIMIT");
                if(!fehlgeschlagen){
                    nextAddress--;
                }
                fehlgeschlagen = true;
                console.log(nextAddress + " ",addresses[nextAddress]);
                //delay++;
            }
            console.log(status);
        }
        next();
    }
    );



    // geo.geocode({address:haltestelle}, function (results,status)
    //     {
    //         // If that was successful
    //         if (status == google.maps.GeocoderStatus.OK) {
    //             // Lets assume that the first marker is the one we want
    //             var p = results[0].geometry.location;
    //             var lat=p.lat();
    //             var lng=p.lng();
    //             // Output the data
    //             var msg = 'address="' + haltestelle + '" lat=' +lat+ ' lng=' +lng+ '(delay='+delay+'ms)<br>';
    //             document.getElementById("messages").innerHTML += msg;
    //             // Create a marker
    //             createMarker(haltestelle,lat,lng);
    //         }
    //         // ====== Decode the error status ======
    //         else {
    //             // === if we were sending the requests to fast, try this one again and increase the delay
    //             if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
    //                     nextAddress--;
    //                     delay++;
    //             } else {
    //                 var reason="Code "+status;
    //                 var msg = 'address="' + haltestelle + '" error=' +reason+ '(delay='+delay+'ms)<br>';
    //                 document.getElementById("messages").innerHTML += msg;
    //             }
    //         }
    //         next();
    //     }
    // );
}

// ======= An array of locations that we want to Geocode ========
var addresses = [];

function fillAdresses(json){
    // json.forEach(function (haltestelle) {
    //     addresses.push(haltestelle);
    // });

    for(var idx in json){
        addresses.push(json[idx]);
    }
    console.log("fillAdresses " + addresses.length);
    theNext();
}
// ======= Global variable to remind us what to do next
var nextAddress = 0;

// ======= Function to call the next Geocode operation when the reply comes back

function theNext() {
    console.log("theNext");
    if (nextAddress < addresses.length) {
        setTimeout(getAddress(addresses[nextAddress],theNext), delay);
        nextAddress++;
        //console.log(nextAddress + " ",addresses[nextAddress]);
    } else {

    }
}




function initMap() {
    console.log("initMap");
    // var ui = {
    //     $timeTransit: $('#transit'),
    //     $timeBicycling: $('#bicycling')
    // };
    //
    // var time = {
    //     transit: "",
    //     bic: "",
    // };

    loadAjax({url: 'data/wohnheime.json', callback: fillAdresses});


    //new google.maps.LatLng(48.158961, 11.554124)"Infanteriestraße 11a, München"






    // getBicyclingDuration("Infanteriestraße 11a, München", "Karl-Köglsperger-Straße 3-9, München",function(time){
    //getTransitDuration(new google.maps.LatLng(lat, long), "Karl-Köglsperger-Straße 3-9, München",function(time){
    //     ui.$timeBicycling.html(time);
    //     time.bic = time;
    // });
}

// function addHaltestellenMarker(json) {
//
//     var adressen = [];
//     json.features.forEach(function (haltestelle) {
//      adressen.push(haltestelle);
//     });
//
//     if(nextAdress < adressen.length){
//
//     }
//     var lat = haltestelle.geometry.coordinates[0];
//     var long = haltestelle.geometry.coordinates[1];
//     getBicyclingDuration("Infanteriestraße 11a, München", "Karl-Köglsperger-Straße 3-9, München",function(time){
//         document.getElementById('transit').innerHTML = time;
//
//     });
// }
//
// function getFahrzeiten(test){
//
//     test.forEach(function (haltestelle, i) {
//         if (!haltestelle) {
//             return;
//         }
//         var lat = haltestelle.features.geometry.coordinates[0];
//         var long = haltestelle.features.geometry.coordinates[1];
//         getTransitDuration(new google.maps.LatLng(lat, long), "Karl-Köglsperger-Straße 3-9, München",function(time){
//             document.getElementById('transit').innerHTML = time;
//             //ui.$timeTransit.html(time);
//             //time.transit = time;
//         });
//     });
//
//}




function loadAjax(params) {
    console.log("loadAjax");
    $.ajax({
        url: params.url,
        dataType: 'json'
    }).done(params.callback);
}



function getTransitDuration(origin,destination,callback){
    var directionsService = new google.maps.DirectionsService;

    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions:{
            departureTime: new Date(1481180400000)
        }
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            duration = response.routes[0].legs[0].duration.value /60;
            callback(duration.toFixed(0));
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function getBicyclingDuration(origin,destination,callback){
    var directionsService = new google.maps.DirectionsService;

    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.BICYCLING,
        transitOptions:{
            departureTime: new Date(1481180400000)
        }
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            duration = response.routes[0].legs[0].duration.value /60;
            callback(duration.toFixed(0));
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}