'use strict';

var masterPage = angular.module('myApp.masterPage', ['ngRoute']);

masterPage.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'masterPage/masterPage.html',
    controller: 'MasterPageCtrl'
  });
}]);

masterPage.controller('MasterPageCtrl', ['$http', function($http) {

  this.rawBlocks = [];

  $http.get('/blockExplorer/q/latesthash').then(function(response) {
    this.getBlocks(10, response.data);
  }.bind(this));

  this.getBlocks = function(maxBlocks, fromHash) {
    this.chainGetBlock(this.getBlock(fromHash, maxBlocks));
  }

  this.chainGetBlock = function(previousGet, maxBlocks) {

    if (this.rawBlocks.length === maxBlocks) {
      return;
    }

    previousGet.then(this.onBlockResponse.bind(this));
  };

  this.onBlockResponse = function(response) {
    var rawBlock = response.data;
    this.rawBlocks.push(rawBlock);
    this.chainGetBlock(this.getBlock(rawBlock['prev_block']));
  }

  this.getBlock = function(hash) {
    return $http.get('/blockExplorer/rawblock/' + hash);
  }

}]);
