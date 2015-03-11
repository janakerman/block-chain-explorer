'use strict';

angular.module('myApp.masterPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'masterPage/masterPage.html',
    controller: 'MasterPageCtrl'
  });
}])

.controller('MasterPageCtrl', [function() {

}]);
