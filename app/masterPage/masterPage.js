'use strict';

(function() {
  var masterPage = angular.module('myApp.masterPage', ['ngRoute', 'blockExplorerServices']);

  masterPage.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'masterPage/masterPage.html',
      controller: 'MasterPageCtrl'
    });
  }]);

  masterPage.controller('MasterPageCtrl', ['$http', '$scope', 'BlockService', function($http, $scope, BlockService) {
    var self = this;

    var retryError = 'Error! Could not load blocks.';

    self.oldestBlock = '';
    self.errorMessage = '';

    this.previousTenFromLatest = function () {
      BlockService.getLatestHash().then(
        function(latestHash) {
          self.errorMessage = '';

          self.previousTenBlocks(latestHash);
        },
        function(error) {
          self.errorMessage = retryError;
          $scope.$apply();

        });
    }

    this.previousTenBlocks = function (hash) {
      BlockService.getBlocks(hash, 10).then(
        function(blocksArray) {
          self.errorMessage = '';

          self.rawBlocks = blocksArray;

          self.oldestBlock = self.rawBlocks[self.rawBlocks.length-1].hash;
        },
        function(error) {
          self.errorMessage = retryError;
          $scope.$apply();
        });

    }

    this.previousTen = function () {
      self.previousTenBlocks(self.oldestBlock);
    }

    this.convertHexToDecimal = function(hex) {
      return parseInt(hex, 16);
    }

    this.previousTenFromLatest();

  }]);

})();
