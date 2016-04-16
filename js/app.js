"use strict";

// Google Maps map setup

var gMap = {
    map: {}
};

// This function is called once the Google Maps API has been loaded
function initMap () {
    gMap.map = new google.maps.Map(document.getElementById('map-canvas'), {
        mapTypeControl: false,
        streetViewControl: false,
        center: {lat: 46.202646, lng: 10.480957},
        scrollwheel: true,
        zoom: 7,
        mapTypeId: google.maps.MapTypeId.HYBRID
    });
    gMapsLoaded = true;
    ko.applyBindings(vm);
}

// This fires if there's an issue loading the Google Maps API script
function initMapLoadError() {
    alert('Fehler beim Laden der Google Maps API');
    console.log('Fehler beim Laden der Google Maps API');
}

// Cloud Endpoints API - source of the REST API
var ROOT = 'https://berglokal-de.appspot.com/_ah/api';

// Hut object
var Hut = function(data) {
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lon = ko.observable(data.lon);
    this.id = ko.observable(data.id);
    this.alpine_club = ko.observable(data.alpine_club);
    this.youtube_id = ko.observable(data.youtube_id);
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.lon),
        title: data.name,
        animation: google.maps.Animation.DROP
    });
    this.infoWindow = new google.maps.InfoWindow({
        content: '<div class="infoWindow"><div class="infoWindowTitle">' + data.name + '</div>' +
        '<div class="infoWindowAlpineClub">' + data.alpine_club + '</div></div>'
    });
};

// View Model of the single page application

var ViewModel = function () {
    var self = this;
    // search string in the view
    self.searchString = ko.observable('');
    // list of all huts
    self.hutList = ko.observableArray([]);
    // setup variable for the youtube video player
    self.player = undefined;

    // add markers to the map for all huts
    self.showMarkers = function() {
        var counter = 0; // counter for the delay of drop animation
        ko.utils.arrayForEach(self.filteredItems(), function(hut) {
            counter += 1;
            // delay the bounce of every marker on initial load for animation purpose
            setTimeout(function() {
                hut.marker.setMap(gMap.map);
            }, counter * 200);
            // action that happens when clicking on a marker
            hut.marker.addListener('click', function() {
                hut.infoWindow.open(gMap.map, hut.marker);
                gMap.map.setZoom(15);
                gMap.map.setCenter(hut.marker.getPosition());
                if (hut.marker.getAnimation() !== null) {
                    hut.marker.setAnimation(null);
                } else {
                    hut.marker.setAnimation(google.maps.Animation.BOUNCE);
                }
            });
        });
    };

    // close all open infoWindows
    self.closeInfoWindow = function () {
        ko.utils.arrayForEach(self.filteredItems(), function(el) {
            el.infoWindow.close(gMap.map, el.marker);
        });
    };

    // show a hut detail view
    self.showHut = function(data) {
        self.closeInfoWindow();
        data.infoWindow.open(gMap.map, data.marker);
        data.marker.setAnimation(google.maps.Animation.BOUNCE);
        gMap.map.setZoom(15);
        gMap.map.setCenter(data.marker.getPosition());
    };

    // load videos of a hut
    self.showHutVideo = function(data) {
        // first load of a video
        if (self.player === undefined) {
            self.player = new YT.Player('player', {
                videoId: data.youtube_id()
            });
        // change the video when requesting a new one after initial load
        } else {
             self.player.cueVideoById(data.youtube_id());
        }
    };

    // stopping videos
    self.stopVideo = function() {
        self.player.stopVideo();
    };

    // filter the hut list based on the search query
    self.filteredItems = ko.computed(function() {
        var tempFilter = self.searchString().toLowerCase(); // search string of the input
        var returnHuts = ko.observableArray([]); // array of filtered items in the function
        if (!tempFilter) {
            returnHuts = self.hutList(); // return all videos when there's no filter
        } else {
            ko.utils.arrayForEach(self.filteredItems(), function(s){
                s.marker.setVisible(false); // set markers invisible to clear them all on new search
            });
            returnHuts = ko.utils.arrayFilter(self.hutList(), function(huts) {
                return huts.name().toLowerCase().indexOf(tempFilter) !== -1; // refresh the filtered huts and return them to return huts
            });
        }
        // don't filter markers when there's not a filter present at the moment
        if (typeof returnHuts !== 'undefined' && returnHuts.length > 0) {
            self.filterMarkers(returnHuts);
            self.closeInfoWindow();
            gMap.map.setZoom(7);
            gMap.map.setCenter({lat: 46.202646, lng: 10.480957});
        }
        return returnHuts;
    });

    // filter the markers based on the search query
    self.filterMarkers = function(filteredHuts) {
        ko.utils.arrayForEach(self.hutList(), function(e){
            if (filteredHuts.indexOf(e) === -1) {
                e.marker.setVisible(false); // markers is now invisible
            }
            else {
                e.marker.setVisible(true); // marker is now visible
            }
        });
    };
};

// Setting up the app
// Set up ViewModel once we have received the data from the Berglokal Datastore

function onGapiLoaded() {
    gapi.client.hut.listHuts().execute(function(resp) {
        if (!resp.code) {
            gapiLoaded = true;
            resp.huts.forEach(function(hut){
                vm.hutList.push(new Hut(hut));
            });
            if (gapiLoaded && gMapsLoaded) {
                vm.showMarkers();
            }
            $('#loadinghuts').hide();
            $('#hutList').show();
        }
        // if the response fails show error message
        else {
            gapiLoaded = false;
            $('#loadinghuts').hide();
            $('#error-messages').show();
        }
    });
}

// This fires if there's an issue loading the Google Maps API script
function onGapiLoadError() {
    alert('Fehler beim Laden der Daten zu den Alpenhütten');
    console.log('Fehler beim Laden der Daten zu den Alpenhütten');
}

var vm = new ViewModel();
var gMapsLoaded = false;
var gapiLoaded = false;

$('#videoModal').on('hide.bs.modal', function () {
    vm.stopVideo();
});