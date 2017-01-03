angular.module('pokemonApp', [])
.controller('pokemonController', function ($scope, $http, $window) {
    $scope.pokemonData = [];
    $scope.pokemonNames = [];
    $scope.pokemonsList = [];

    $http.get('pokemons.json').success(function(response) {
        $scope.pokemonsList = response.pokemon;
    });


    $scope.setPokemonNames = function($scope){

        angular.forEach($scope.pokemonData, function(value, key) {
            angular.forEach($scope.pokemonsList, function(value2, key2) {
                if(value.pokemonId == value2.id){
                    $scope.pokemonNames.push( {"name":value2.name, "img":value2.img, "distance":getDistanceFromLatLonInKm($scope.coords.lat,$scope.coords.lng,value.latitude,value.longitude)} )
                }
            });
        });

        $scope.pokemonNotification($scope)
    }

    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    $scope.getPokemonList = function(lat, lng) {
        $http({
            url: '/getPokemon',
            method: "POST",
            data: {
                'lat': lat,
                'lng': lng,
            }
        })
        .then(function(response) {
            $scope.pokemonData =  JSON.parse(response.data);
            if($scope.pokemonData != []){
                $scope.setPokemonNames($scope);
            }
        },
        function(response) { // optional
                // failed
        });
    }

    if ($window.navigator.geolocation) {
        $window.navigator.geolocation.getCurrentPosition(function(position){

            $scope.$apply(function(){
                $scope.coords = {
                    lat:position.coords.latitude,
                    lng:position.coords.longitude
                };

                var url = "/getPokemon";

                $scope.getPokemonList($scope.coords.lat, $scope.coords.lng)

            })

        },function(error){
            console.log(error.message)
        });
    }

    $scope.pokemonNotification = function($scope) {
        Notification.requestPermission(function(permission){
            var notification = new Notification(
                "Pokemons List",
                {
                    body:$scope.bodyNotification($scope),
                    icon:'https://pokevision.com/asset/image/logo-mini-light.png',
                    dir:'auto'
                }
            );
        });
    }

    $scope.bodyNotification = function($scope){
        var str = "";
        angular.forEach($scope.pokemonNames, function(value, key) {
            str = str + (key+1) +". " + value.name +" - " + parseInt( (value.distance * 1000) ) +"m.          ";
        });

        return str;
    }

    $scope.setUserCoords = function() {
        $scope.coords.lat = $scope.userLat;
        $scope.coords.lng = $scope.userLng;
        $scope.getPokemonList($scope.coords.lat, $scope.coords.lng)
        $scope.pokemonData = [];
        $scope.pokemonNames = [];

        $scope.updateLocalStorage($scope.coords.lat, $scope.coords.lng)
    }

    $scope.getFromLocalStorage = function() {
        $scope.coords.lat = $window.localStorage.getItem('userLat');
        $scope.coords.lng = $window.localStorage.getItem('userLng');
        $scope.getPokemonList($scope.coords.lat, $scope.coords.lng)
        $scope.pokemonData = [];
        $scope.pokemonNames = [];

    }

    $scope.updateLocalStorage = function(lat, lng) {
    	$window.localStorage.setItem('userLat', lat);
    	$window.localStorage.setItem('userLng', lng);
    }


})
