'use strict';

(function() {
  var blockExplorerServices = angular.module('blockExplorerServices', []);

  blockExplorerServices.factory('BlockService', ['$http', function($http) {

    var blockService = {};

    /* Return the latest block hash. */
    blockService.getLatestHash = function() {
      return new Promise(function(resolve, reject) {
        $http.get('/blockExplorer/q/latesthash').then(function (response) {
          resolve(response.data);
        })
      });
    }

    /* Returns the 'maxBlocks' blocks previous to 'hash'. */
    blockService.getBlocks = function(hash, maxBlocks) {

      var blocksArray = [];

      /* Recursively chains block requests until 'maxBlocks' is reached. */
      var chainGetBlock = function(previousGet, success) {
        if (blocksArray.length === maxBlocks) {
          success(blocksArray);
          return;
        }

        previousGet.then(function(response) {
          var rawBlock = response.data;
          blocksArray.push(rawBlock);
          chainGetBlock(blockService.getBlock(rawBlock['prev_block']), success);
        }.bind(this));
      };

      return new Promise(function(resolve, reject) {
        chainGetBlock(blockService.getBlock(hash), function (blockArray) {
          resolve(blockArray);
        });
      });
    }

    /* Returns a promise for a response with the given hash. */
    blockService.getBlock = function(hash) {
      return new Promise (function (resolve, reject) {
        $http.get('/blockExplorer/rawblock/' + hash).then(function(response) {
          resolve(response)
        });
      });
    }

    return blockService;

  }]);

})();
