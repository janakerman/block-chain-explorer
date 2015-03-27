'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.masterPage',
  'myApp.blockDetailPage',
  'myApp.version',
  'blockExplorerServices',
  'd3',
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
    element.addClass('list-box');
  };
}).
directive('layout', function () {
 return {
    templateUrl: 'layout.html',
    restrict: 'E',
    transclude: true,
  };
})
.filter('removeLeadingZeros', function () {
    return function (input) {

      if (input === undefined) return;

      var indexOfLastConsequtiveZero = 0;
      for (var i = 0, len = input.length; i < len; i++) {
        if (input[i] != '0') {
          indexOfLastConsequtiveZero = i;
          break;
        }
      }

      var remainder = input.length - indexOfLastConsequtiveZero;

      return input.slice(indexOfLastConsequtiveZero, indexOfLastConsequtiveZero + Math.min(remainder, 6));
    };
  });

