function initMap() {
    var ui = {
        $timeTransit: $('#transit'),
        $timeBicycling: $('#bicycling')
    };

    var time = {
        transit: "",
        bic: "",
    };

    getTransitDuration("Infanteriestraße 11a, München", "Karl-Köglsperger-Straße 3-9, München",function(time){
        ui.$timeTransit.html(time);
        time.transit = time;
    });
    getBicyclingDuration("Infanteriestraße 11a, München", "Karl-Köglsperger-Straße 3-9, München",function(time){
        ui.$timeBicycling.html(time);
        time.bic = time;
    });
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