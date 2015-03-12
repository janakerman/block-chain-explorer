'use strict';
(function() {
  var blockDetailPage = angular.module('myApp.blockDetailPage', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/Block/:blockHash', {
      templateUrl: 'blockDetail/blockDetail.html',
      controller: 'BlockDetailCtrl',
    });
  }])

  .controller('BlockDetailCtrl', [function() {

  }]);
})();
