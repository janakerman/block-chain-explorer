'use strict';

(function() {
  var masterPage = angular.module('myApp.masterPage', ['ngRoute', 'blockExplorerServices']);

  masterPage.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'masterPage/masterPage.html',
      controller: 'MasterPageCtrl'
    });
  }]);

  masterPage.controller('MasterPageCtrl', ['$http', 'BlockService', function($http, BlockService) {
    var self = this;

    self.oldestBlock = '';

    BlockService.getLatestHash().then(function(latestHash) {
      self.previousTenBlocks(latestHash);
    });

    this.previousTenBlocks = function (hash) {
      BlockService.getBlocks(hash, 10).then(function(blocksArray) {
        self.rawBlocks = blocksArray;

        self.oldestBlock = self.rawBlocks[self.rawBlocks.length-1].hash;
      });
    }

    this.previousTen = function () {
      self.previousTenBlocks(self.oldestBlock);
    }

    this.convertHexToDecimal = function(hex) {
      return parseInt(hex, 16);
    }

  }]);

})();
