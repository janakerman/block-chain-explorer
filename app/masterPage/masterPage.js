'use strict';

var masterPage = angular.module('myApp.masterPage', ['ngRoute', 'blockExplorerServices']);

masterPage.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'masterPage/masterPage.html',
    controller: 'MasterPageCtrl'
  });
}]);

masterPage.controller('MasterPageCtrl', ['$http', 'BlockService', function($http, BlockService) {
  var self = this;

  BlockService.getLatestHash().then(function(latestHash) {
    BlockService.getBlocks(latestHash, 10).then(function(blocksArray) {
      self.rawBlocks = blocksArray;
    });
  });

}]);
