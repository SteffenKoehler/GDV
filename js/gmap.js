// delay between geocode requests - at the time of writing, 100 miliseconds seems to work well
var delay = 20000;
var fehlgeschlagen = false;

// ====== Geocoding ======
function calcTime(wohnheim, hochschule, next) {
    console.log("calcTime");
    var latWohnheim = wohnheim.Latitude;
    var longWohnheim = wohnheim.Longitude;

    var lathochschule = hochschule.Latitude;
    var longhochschule = hochschule.Longitude;

    var directionsService = new google.maps.DirectionsService;
    var wohnheimlatlong = new google.maps.LatLng(latWohnheim, longWohnheim);
    var hochschulelatlong = new google.maps.LatLng(lathochschule, longhochschule);
    directionsService.route({
        origin:wohnheimlatlong ,
        destination: hochschulelatlong,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions:{
            departureTime: new Date(1481180400000)
        }
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            duration = response.routes[0].legs[0].duration.value /60;
            document.getElementById('transit').innerHTML +=

                "{" + "<br>" +
                "\"Origin\": " + "\"" + wohnheim.Wohnheim + "\"" + "," + "<br>" +
                "\"OriginAdress\": " + "\"" + wohnheim.Straße  + " " + wohnheim.PLZ + " " + wohnheim.Ort + "\"" + "," + "<br>" +
                "\"OriginLat\": " + wohnheim.Latitude + "," + "<br>" +
                "\"OriginLng\": " + wohnheim.Longitude + "," + "<br>" +
                "\"Destination\": " + "\"" + hochschule.Hochschule + "\"" + "," + "<br>" +
                "\"DestinationAdress\": " + "\"" + hochschule.Straße + " " + hochschule.PLZ + " " + hochschule.Ort + "\"" + "," + "<br>" +
                "\"DestinationLat\": " + hochschule.Latitude + "," + "<br>" +
                "\"DestinationLng\": " + hochschule.Longitude + "," + "<br>" +
                "\"travelMode\": \"transit\"," + "<br>" +
                "\"travelTime\": " + duration.toFixed(0) + "<br>" + "}," + "<br>";




            console.log("transit");
            fehlgeschlagen = false;
        } else {
            if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                console.log("OVER_QUERY_LIMIT");
                //if(!fehlgeschlagen){
                    nextAddress--;
                //}
                fehlgeschlagen = true;
                console.log(nextAddress + " ",addresses[nextAddress]);
                //delay++;
            }
            console.log(status);
        }
        next();
    }
    );
}

// ======= An array of locations that we want to Geocode ========
var addresses = [];
var addressesTarget = [];

function fillAdresses(json){

        for(var idx in json){
            addresses.push(json[idx]);
        }
        console.log("Wohnheime  " + addresses.length);
        theNext();

}

function fillAdressesTarget(json){
        for(var idx in json){
            addressesTarget.push(json[idx]);
        }
        console.log("Hochschulen  " + addressesTarget.length);

}




// ======= Global variable to remind us what to do next
var nextAddress = 0;
var nextHochsule = 0;

// ======= Function to call the next Geocode operation when the reply comes back
function theNext() {
    console.log("theNext");
    if (nextAddress < (addresses.length-1)) {
        console.log("theNext " + nextAddress);
        setTimeout(function(){calcTime(addresses[nextAddress],addressesTarget[nextHochsule],theNext)}, 200);
        nextAddress++;
    }else{
        if(nextHochsule < (addressesTarget.length-1)){
            nextHochsule++;
            nextAddress = 0;
            theNext();
        }
    }
}


function initMap() {
    console.log("initMap");
    loadAjax({url: 'data/hochschule.json', callback: fillAdressesTarget});
    loadAjax({url: 'data/wohnheime.json', callback: fillAdresses});

}

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