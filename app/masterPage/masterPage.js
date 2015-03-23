'use strict';

var test = 0;

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

    if (test === 0) {
      test++;

      BlockService.getTransactions('8dd171d6f04ba0f5df0c7d0491ae8455134c70ebdedc798bb4c9441d5ee03158', 3)
      .then(function (response) {
        console.log(response);
        console.log('eeep');
      });
    }

    

  }]);

  masterPage.filter('blockHashFilter', function() {
    return function(input, filterText) {
      // return false;
      if (!input || !filterText) {
        return input;
      }

      var newArray = input.filter(function(element, index, array) {
        var result = (element.hash.indexOf(filterText) > -1);
        return result;
      });

      console.log(newArray);

      return newArray;
    };
  });

})();
