/// <reference path="../definitionFiles/angular/angular.d.ts" />


'use strict';

var test = 0;

module myApp.masterPage {
  'use strict';

  interface IMasterPageScope {

  }

  class MasterPageController implements IMasterPageScope {
    constructor() {}
  }
}


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
          self.previousTenBlocks('000000008d9dc510f23c2657fc4f67bea30078cc05a90eb89e84cc475c080805');
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
          self.previousTenBlocks('000000008d9dc510f23c2657fc4f67bea30078cc05a90eb89e84cc475c080805');
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

})();
