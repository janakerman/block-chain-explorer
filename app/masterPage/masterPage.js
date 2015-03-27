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
    };

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

    };

    this.previousTen = function () {
      self.previousTenBlocks(self.oldestBlock);
    };

    this.convertHexToDecimal = function(hex) {
      return parseInt(hex, 16);
    };

    this.previousTenFromLatest();
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

      return newArray;
    };
  });

  masterPage.directive('blockCard', function() {
    return {
      restrict: 'E',
      template: '<a href="#/block/{{rawBlock.hash}}"><div><div class="arrow-right"></div><h1>{{ rawBlock.hash | removeLeadingZeros }}</h1><p># Transactions: {{ rawBlock.tx.length }}</p></div></a>',
      scope: {
        rawBlock: "=rawBlock",
      }
    };
  });

  masterPage.filter('removeLeadingZeros', function () {
    return function (input) {

      var indexOfLastConsequtiveZero = 0;
      for (var i = 0, len = input.length; i < len; i++) {
        if (input[i] != '0') {
          indexOfLastConsequtiveZero = i;
          break;
        }
      }

      var remainder = input.length - indexOfLastConsequtiveZero;

      return input.slice(indexOfLastConsequtiveZero, indexOfLastConsequtiveZero + Math.min(remainder, 5));
    };
  });

})();
