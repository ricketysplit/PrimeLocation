var geocoder;
var map;
var markers = new Array();
var destinations = new Array();

function initialize() {
    geocoder  = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(38.6272, -90.1978);
    var mapOptions = {
        center: latlng,
        zoom: 8
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}

function getResults(){
    var address = document.getElementById("address").value;
    geocoder.geocode( {'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var mapOptions = {
                center:results[0].geometry.location,
                zoom: 11
            };
            map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}



function addDestination(){
    var address = document.getElementById("destination").value;
    if(address==""){
        alert("Destination field cannot be blank");
        return;
    }
    document.getElementById("destination").value = "";
    geocoder.geocode( {'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            addMarker(results[0].geometry.location);
            destinations.push(results[0].formatted_address);
            $("#destinations").append("<div>"+results[0].formatted_address+"</div>");
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

function calcDistances(){
    var service = new google.maps.DistanceMatrixService();
    var address1 = document.getElementById('address').value;
    if(address1 == ""){
        alert("Origin field cannot be blank.");
        return;
    }
    document.getElementById('address').value = "";
    service.getDistanceMatrix(
        {
            origins:[address1],
            destinations: destinations,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidTolls: true
        }, handleDistanceMatrixCallback);
}

function handleDistanceMatrixCallback(response, status) {
    if (status == google.maps.DistanceMatrixStatus.OK) {
        $("#results").empty;
        $("#results").append("<table id='resultsTable'><td>Destination</td><td>Time</td><td>Score</td></table>");
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;
        var totalTime = 0;
        var score = 0;
        for(var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
                var element = results[j];
                var duration = element.duration.value ;
                var seconds = parseInt(element.duration.value)/60;
                score += (20 - seconds) * 1.5;
                totalTime += seconds;
                var from = origins[i];
                var to = destinations[j];
                $("#resultsTable tbody:last").append("<tr><td>"+to+"</td><td>"+seconds.toFixed(2)+"</td><td>" + ((20-seconds) *1.5).toFixed(2) + "</td></tr>");
            }
        }
        $("#results").append("<div><b>Total time: " + totalTime.toFixed(2) + " minutes   Total score: " + score.toFixed(2) + "</b>");

    }

};

function addMarker(location){
    var marker = new google.maps.Marker({
        map:map,
        position:location
    })
    markers.push(marker);
}

google.maps.event.addDomListener(window, 'load', initialize);
