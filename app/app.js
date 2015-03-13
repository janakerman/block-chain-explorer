'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.masterPage',
  'myApp.blockDetailPage',
  'myApp.version',
  'blockExplorerServices',
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/block/:blockHash', {
    templateUrl: 'blockDetail/blockDetail.html',
    controller: 'BlockDetailPageCtrl',
  }).
  otherwise({redirectTo: '/'});
}]).
directive('greyBackground', function () {
  return function (scope, element, attributes) {
    element.css('backgroundColor', '#AAAAAA')
  };
});
