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
        },
        function(error) {
          reject();
        });
      });
    };

    /* Returns the 'maxBlocks' blocks previous to 'hash'. */
    blockService.getBlocks = function(hash, maxBlocks) {

      var blocksArray = [];

      /* Recursively chains block requests until 'maxBlocks' is reached. */
      var chainGetBlock = function(previousGet, success, error) {
        if (blocksArray.length === maxBlocks) {
          success(blocksArray);
          return;
        }

        previousGet.then(
          function(block) {
            var rawBlock = block;
            blocksArray.push(rawBlock);
            chainGetBlock(blockService.getBlock(rawBlock.prev_block), success);
          }.bind(this),
          error
        );
      };

      return new Promise(function(resolve, reject) {
        chainGetBlock(blockService.getBlock(hash),
          function (blockArray) {
            resolve(blockArray);
          },
          function (error) {
            reject();
          }
        );
      });
    };

    /* Returns a promise for a response with the given hash. */
    blockService.getBlock = function(hash) {
      return new Promise (function (resolve, reject) {
        $http.get('/blockExplorer/rawblock/' + hash).then(function(response) {
          resolve(response.data);
        },
        function(error) {
          reject();
        });
      });
    };

    blockService.getTransactions = function(hash, numLevels) {

      var chainGetTransaction = function (parents, childGet, level, success, error) {
        if (level === numLevels) {
          success();
          return;
        }

        childGet.then (function (rawTransactions) {
          /* Build promises for all the children at this level of the tree. */
          var childPromises = [];

          rawTransactions.forEach(function (element, index) {

            element.forEach(function (element) {

              // Check for sentinal empty object indicating error obtaining transaction.
              if (Object.getOwnPropertyNames(element).length === 0) return;

              parents[index].children.push({ "hash" : element.hash, "children" : [] });

              childPromises.push(blockService.getChildTransactions(element));

            });
          });


          var children = [];

          for (var x=0; x<parents.length; x++) {
            var parent = parents[x];

            if (!parent) {
              continue;
            }

            children = children.concat(parent.children);
          }

          chainGetTransaction(children, Promise.all(childPromises), level + 1, success, error);
        });
      };

      return new Promise(function(resolve, reject) {
        blockService.getTransaction(hash)
        .then (function (rawTransaction) {

          var parent = [{ hash: rawTransaction.hash, "children" : [] }];

          chainGetTransaction(parent, Promise.all([blockService.getChildTransactions(rawTransaction)]), 0, 
            function () {
              resolve(parent);
            }, 
            reject
          );
        });

      });
    };

    /* Get all child transactions from a given raw transaction. */
    blockService.getChildTransactions = function(rawTransaction) {
      return new Promise (function (resolve, reject) {
        var transactionPromises = [];

        for (var x=0; x<rawTransaction.in.length; x++) {
          var childHash = rawTransaction.in[x].prev_out.hash;
          transactionPromises.push(blockService.getTransaction(childHash));
        }

        Promise.all(transactionPromises)
        .then(function (response) {
          resolve(response);
        });
      });
    };

    blockService.getTransaction = function(hash) {
      return new Promise (function (resolve, reject) {
        $http.get('/blockExplorer/rawtx/' + hash).then(function(response) {
          resolve(response.data); 
        },
        function (error) {
          resolve({}); // Send an empty object back as a flag - we don't want to cause all of our child promises to fail.
        });
      });
    };

    blockService.verifyBlock = function (rawBlock) {
      return new Promise (function (resolve, reject) {
        var req = {
          method: 'POST',
          url: '/service/verifyBlock/',
          data: rawBlock
        }

        $http(req).then(function(response) {
          resolve(response.data); 
        },
        function (error) {
          reject(error);
        });
      });
    }

    return blockService;

  }]);

})();
