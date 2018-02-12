//location array with title and coordinates
const myLocations = [
    {
        name: "Brihadeshwara Temple",
        abhiLoc: {lat: 10.782783, lng: 79.131846}
    },
    {
        name: " Sittannavasal Cave",
        abhiLoc: {lat: 10.456466, lng: 78.725971}
    },
    {
        name: "Thirumayam Fort",
        abhiLoc: {lat: 10.247597, lng: 78.751392}
    },
    {
        name: "Meenakshi Temple",
        abhiLoc: {lat: 9.919505, lng: 78.119342}
    },
    {
        name: "Thillai natarajar Temple",
        abhiLoc: {lat: 11.399296, lng: 79.693548}
    },
    {
        name: "Airawateswarar Temple",
        abhiLoc: {lat: 10.948441, lng: 79.356412}
    }
];
//set of variables for creating markers and event listeners
let abhiMap;
let markers= [];
let defaultZoom = 8;
let defaultCenter = {lat: 11.230000, lng: 78.879997};
var viewModel;

//view function
function initMap(){
	'use strict';
    abhiMap = new google.maps.Map(document.getElementById('myMap'),{
        center: defaultCenter,
        zoom: defaultZoom
    });
    createMarker();
    viewModel = new MapViewModel();
    ko.applyBindings(viewModel);

}

//functions for the list and search box using knockout (MVVM) same as cat-clicker in course

//function saves location data and marker data
function Locate (locs, marks){
    var self = this;
    self.name = locs.name;
    self.coordinates = locs.abhiLoc;
    self.visibility = ko.observable(true);
    self.marker = marks;
}

function MapViewModel(){
    var self = this;

    self.inputDet = ko.observable('');

    self.listArrays = ko.observableArray();

    //looping through myLocations and markers array for easy rendering of view model
    for (let i=0; i<myLocations.length; i++){
        self.listArrays.push(new Locate(myLocations[i], markers[i]));
    }

    //this makes filter of listed titles when typed in search box
    self.searchItem = ko.computed(function(){

        var mainInputs = self.inputDet().toLowerCase();
        let value;
//credits(for explanation): https://stackoverflow.com/questions/30888954/convert-value-into-lower-case-before-knockout-binding
//credits(for explanation): https://stackoverflow.com/questions/29551997/knockout-search-filter
        for(var a = 0; a < self.listArrays().length; a++){
            value = self.listArrays()[a];
            if(value.name.toLowerCase().indexOf(mainInputs)>=0){
                value.visibility(true);
                value.marker.setMap(abhiMap);
            }else{
                value.visibility(false);
                value.marker.setMap(null);
            }
        }
    });
    //this triggers the marker infowindow when list titles clicked
    self.clickOpen = function(clicker){
        google.maps.event.trigger(clicker.marker, 'click');
    };
}

//this creates marker at the specified locations and adds event listeners
function createMarker(){
    let infoWindow = new google.maps.InfoWindow();

    for(const value of myLocations){
        let position = value.abhiLoc;
        let name = value.name;

        let marker = new google.maps.Marker({
            position: position,
            map: abhiMap,
            title: name,
            animation: google.maps.Animation.DROP
        });
        markers.push(marker);
        clickEvent(marker, position, name); //calls marker click function
        
    }
    //this creates the click function for markers
    function clickEvent(clicks, position, name){
    	clicks.addListener('click', function()
        {
        	this.name = name;
        	abhiMap.setCenter(position);
  			abhiMap.setZoom(16);
 			this.setAnimation(google.maps.Animation.DROP);
            openInfo(this, infoWindow, position, name);
        });
    }
}
//when clicked on marker this function is called to display information
function openInfo(marker, info, point, title){

  //positions and zooms to the location when marker clicked
  
    let placeContent;
    //asynchronous function to get info through wikipedia
    $.ajax({
        url:'http://en.wikipedia.org/w/api.php?action=opensearch&search='+title+'&format=json&callback=wikiCallback',
        dataType: "jsonp",
        jsonp: "callback",
        success: function(response){
            placeContent =`<div> <h3>${title}</h3>
                <p>latitude: ${point.lat}</p> <p>longitude: ${point.lng}</p>
                <p> info: ${response[2][0]}</p><p><strong>Wiki link:</strong></p> <a href = "${response[3][0]}">${title}</a>`;
            if(info.marker != marker){
                info.marker = marker;
                info.setContent(placeContent);
                info.open(abhiMap, marker);

                info.addListener('closeclick',function(){
                    info.marker = null;
                    //when infowindow closed map reallocates to original position
                    abhiMap.setCenter(defaultCenter);
                    abhiMap.setZoom(defaultZoom);
                });
            }
        },
        error:function(){
            alert("not able to retrieve the data, please try again later");
        }
    });

}

function errorMessage(){
    alert("sorry, not able to fetch data.Try again later");
}
