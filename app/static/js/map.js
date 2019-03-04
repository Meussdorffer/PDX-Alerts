var map;
var infowindow;
var default_lookback_seconds = 60;
var captured_tweets = [];
var mapped_circles = {};

var feed = document.getElementById('feed');
var last_24hr_btn = document.getElementById('24-hours');
var last_3day_btn = document.getElementById('3-days');
var last_wk_btn = document.getElementById('last-week');
var all_time_btn = document.getElementById('all-time');

// This js should always poll the production api
// const endpoint = 'http://localhost:5000/api';
const endpoint = 'https://jackmeussdorffer.com/api';
const alertColor = '#FF0000';
const staticColor = '#4286f4';

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        disableDefaultUI: true,
        center: {lat: 45.5122, lng: -122.6587},
        zoom: 12,
        styles: [
            {
                "elementType": "geometry",
                "stylers": [
                    {"color": "#242f3e"}
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {"color": "#746855"}
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {"color": "#242f3e"}
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [
                    {"visibility": "off"}
                ]
            },
            {
                "featureType": "administrative.locality",
                "elementType": "labels.text.fill",
                "stylers": [
                    {"color": "#d59563"}
                ]
            },
            {
                "featureType": "poi",
                "stylers": [
                    {"visibility": "off"}
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {"color": "#d59563"}
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {"color": "#263c3f"}
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                    {"color": "#6b9a76"}
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {"color": "#38414e"}
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry.stroke",
                "stylers": [
                    {"color": "#212a37"}
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [
                    {"visibility": "off"}
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [
                    {"color": "#9ca5b3"}
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {"color": "#746855"}
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {"color": "#1f2835"}
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [
                    {"color": "#f3d19c"}
                ]
            },
            {
                "featureType": "transit",
                "stylers": [
                    {"visibility": "off"}
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    {"color": "#2f3948"}
                ]
            },
            {
                "featureType": "transit.station",
                "elementType": "labels.text.fill",
                "stylers": [
                    {"color": "#d59563"}
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {"color": "#17263c"}
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {"color": "#515c6d"}
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {"color": "#17263c"}
                ]
            }
        ]
    });

    infowindow = new google.maps.InfoWindow;
    addIncidentsToMap(map, tweets);

}

function parseMilitary(ts24) {     
    var incTimeArr = ts24.split(':');
    var ts12;
    if(parseInt(incTimeArr[0]) >= 12) {
        ts12 = `${parseInt(incTimeArr[0]) - 12}:${incTimeArr[1]} PM`;
    } else if(parseInt(incTimeArr[0]) == 12) {
        ts12 = `${parseInt(incTimeArr[0])}:${incTimeArr[1]} PM`;
    } else {
        ts12 = ts24 + ' AM'; 
    }
    return ts12;
}

function showInfoWindow(event) {
    incTime = parseMilitary(this.tweet.local_time);
    incDate = new Date(Date.parse(this.tweet.created_at));
    infowindow.setContent(
        `<p><b><font size="+1">${this.tweet.incident}</font></b></p>
        <p>${incDate.getMonth()+1}/${incDate.getDate()}/${incDate.getFullYear()} - ${incTime}</p>
        <p>${this.tweet.location}</p>`
    );
    infowindow.setPosition(event.latLng);
    infowindow.open(map);
}

function addIncidentsToMap(map, tweets, animate=false, addToFeed=false, testOverride=false) {
    for (var tweet in tweets) {

        if(!captured_tweets.includes(tweets[tweet].id) || testOverride) {
            var incidentCircle = new google.maps.Circle({
                    strokeColor: staticColor,
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: staticColor,
                    fillOpacity: 0.35,
                    map: map,
                    center: {
                        'lat':tweets[tweet].latitude,
                        'lng':tweets[tweet].longitude
                    },
                    radius: 100,
                    tweet: tweets[tweet]
                });

            incidentCircle.addListener('click', showInfoWindow);
            captured_tweets.push(tweets[tweet].id);

            if(animate) {
                newIncidentAnimation(incidentCircle);
            }
            if(addToFeed) {
                addTweetToFeed(tweets[tweet]);
            }

            mapped_circles[tweets[tweet].id] = incidentCircle;

        }
    }
}

function poll(lookback_seconds=default_lookback_seconds, animate=true) {
    $.get(
        endpoint,
        {
            delta: lookback_seconds
        },
        function(data, status) {
            if(status === 'success') {
                addIncidentsToMap(map, data, animate=animate, addToFeed=true);
            }
        }
    );
}


function addTweetToFeed(tweet) {

    var datetime = new Date(Date.parse(tweet.created_at));
    var localTime = datetime.toLocaleTimeString();
    var incTime = parseMilitary(tweet.local_time);
    localTime += `\u00A0\u00A0\u00A0\u00A0${datetime.getMonth()+1}/${datetime.getDate()}`;

    var htmlString = `
        <div class="feed-item" id=${tweet.id}>
            <p><b>${tweet.incident}</b> -- <i>${localTime}</i><br>
            ${tweet.location} around ${incTime}</p>
        </div>`;

    feed.insertAdjacentHTML('afterbegin', htmlString);

    var newDiv = document.getElementById(tweet.id);
    newDiv.addEventListener('click', function(){
        var circle = mapped_circles[this.getAttribute('id')];
        map.setCenter(circle.center);
        map.setZoom(15);
        newIncidentAnimation(circle);
    });
}

function newIncidentAnimation(circle) {
    
    circle.setOptions({
                        fillColor: alertColor,
                        strokeColor: alertColor
                    });

    var rMin = 100, rMax = 300, oMax = 4;
    var direction = 1;
    var oscillations = 0;
    
    var circileAnimation = setInterval(function() {
        var radius = circle.getRadius();
        if ((radius > rMax) || (radius < rMin)) {
            oscillations++;
            direction *= -1; 
        }

        if (oscillations >= oMax) {
            clearInterval(circileAnimation);
            circle.setOptions({
                    fillColor: staticColor,
                    strokeColor: staticColor
                });
        }

        circle.setRadius(radius + direction * 10);
    }, 20); 


}

function removeAllcircles() {
    for(var c in captured_tweets) {
        mapped_circles[captured_tweets[c]].setMap(null);
    }
    mapped_circles = {};
    captured_tweets = [];
}

function redrawIncidents(daysToPoll) {
    var lookback = 24*daysToPoll*60*60;
    $("div.feed-item").remove();
    removeAllcircles();
    poll(lookback, animate=false);
}

last_24hr_btn.addEventListener('click', function() {
    redrawIncidents(1);
});

last_3day_btn.addEventListener('click', function() {
    redrawIncidents(3);
});

last_wk_btn.addEventListener('click', function() {
    redrawIncidents(7);
});

all_time_btn.addEventListener('click', function() {
    redrawIncidents(5000);
});


// Begin polling for new data points
$(function() {
    setInterval(poll, 5000);
});

