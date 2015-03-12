'use strict';

var masterPage = angular.module('myApp.masterPage', ['ngRoute']);

masterPage.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'masterPage/masterPage.html',
    controller: 'MasterPageCtrl'
  });
}]);

masterPage.controller('MasterPageCtrl', ['$http', function($http) {
  var self = this;
  this.rawBlocks = [];

  $http.get('/blockExplorer/q/latesthash').then(function(response) {
    self.getBlocks(response.data, 10);
  });

 /* Returns 'maxBlocks' previous blocks from the given 'hash'. */
  this.getBlocks = function(hash, maxBlocks) {
    return new Promise(function(resolve, reject) {
      self.chainGetBlock(self.getBlock(hash), maxBlocks, function () {
        console.log('SUCESS!');
      });
    });


  }

  /* Recursively chains block requests until 'maxBlocks' is reached. */
  this.chainGetBlock = function(previousGet, maxBlocks, success) {
    if (this.rawBlocks.length === maxBlocks) {
      success();
      return;
    }

    previousGet.then(this.onBlockResponse(maxBlocks, success).bind(this));
  };

  /* Returns a function compatible with a promise success. */
  this.onBlockResponse = function(maxBlocks, success) {
    return function(response) {
      var rawBlock = response.data;
      this.rawBlocks.push(rawBlock);
      this.chainGetBlock(this.getBlock(rawBlock['prev_block']), maxBlocks, success);
    };
  }

  /* Returns a promise for a response with the given hash. */
  this.getBlock = function(hash) {
    return $http.get('/blockExplorer/rawblock/' + hash);
  }

}]);
