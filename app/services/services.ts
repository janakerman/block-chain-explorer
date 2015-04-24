
/// <reference path="../definitionFiles/angular/angular.d.ts" />
/// <reference path="../definitionFiles/es6-promise/es6-promise.d.ts" />
/// <reference path="classes.ts" />

module blockExplorerServices {
  'use strict';

  import IBlock = Classes.IBlock;
  import ITransaction= Classes.ITransaction;

  interface IBlockService {
    getLatestHash(): Promise<string>;
    getBlocks(hash: string, maxBlocks: Number): Promise<Array<IBlock>>;
    getBlock(hash: string): Promise<IBlock>;
    getTransactions(hash: string, numLevels: Number): Promise<ITransaction>;
    getTransaction(hash: string): Promise<ITransaction>;
    getChildTransactions(rawTransaction: ITransaction): Promise<Array<ITransaction>>;
    verifyBlock(rawBlock: Object): Promise<boolean>;
  }

  export class BlockService implements IBlockService {
    constructor(private $http: ng.IHttpService) {}

    public getLatestHash(): Promise<string> {
      return new Promise((resolve, reject) => {
        this.$http.get('/blockExplorer/q/latesthash').then(function (response) {
              resolve(response.data);
            },
            (error) => {
              reject();
            });
      });
    }

    getBlocks(hash: string, maxBlocks: Number): Promise<Array<IBlock>> {
      var blocksArray = [];

      /* Recursively chains block requests until 'maxBlocks' is reached. */
      var chainGetBlock = (previousGet, success, error) => {
        if (blocksArray.length === maxBlocks) {
          success(blocksArray);
          return;
        }

        previousGet.then(
            (block) => {
              var rawBlock = block;
              blocksArray.push(rawBlock);
              chainGetBlock(this.getBlock(rawBlock.prev_block), success, null);
            },
            error
        );
      };

      return new Promise((resolve, reject) => {
        chainGetBlock(this.getBlock(hash),
            (blockArray) => {
              resolve(blockArray);
            },
            (error) => {
              reject();
            }
        );
      });
    }

    getBlock(hash: string): Promise<IBlock> {
      return new Promise ((resolve, reject) => {
        this.$http.get('/blockExplorer/rawblock/' + hash).then(function(response) {
              resolve(response.data);
            },
            (error) => {
              reject();
            });
      });
    }

    getTransactions(hash: string, numLevels: Number): Promise<ITransaction> {
      var chainGetTransaction = (parents, childGet, level, success, error) => {
        if (level === numLevels) {
          success();
          return;
        }

        childGet.then ((rawTransactions) => {
          /* Build promises for all the children at this level of the tree. */
          var childPromises = [];

          rawTransactions.forEach((element, index) => {

            element.forEach((element) => {

              // Check for sentinal empty object indicating error obtaining transaction.
              if (Object.getOwnPropertyNames(element).length === 0) return;

              parents[index].children.push({ "hash" : element.hash, "children" : [] });

              childPromises.push(this.getChildTransactions(element));

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

      return new Promise((resolve, reject) => {
        this.getTransaction(hash)
            .then ((rawTransaction: ITransaction) => {

          var parent = [{ hash: rawTransaction.hash, "children" : [] }];

            chainGetTransaction(parent, Promise.all([this.getChildTransactions(rawTransaction)]), 0,
              () => {
                resolve(parent);
              },
              reject
          );
        });

      });
    }

    getTransaction(hash: string): Promise<ITransaction> {
        return new Promise ((resolve, reject) => {
          this.$http.get('/blockExplorer/rawtx/' + hash).then((response) => {
                resolve(response.data);
              },
              (error) => {
                resolve({}); // Send an empty object back as a flag - we don't want to cause all of our child promises to fail.
              });
        });
    }

    getChildTransactions(rawTransaction: ITransaction): Promise<Array<ITransaction>> {
      return new Promise ((resolve, reject) => {
        var transactionPromises = [];

        for (var x=0; x<rawTransaction.in.length; x++) {
          var childHash = rawTransaction.in[x].prev_out.hash;
          transactionPromises.push(this.getTransaction(childHash));
        }

        Promise.all(transactionPromises)
            .then((response) => {
                resolve.bind(this)(response);
            });
      });
    }

    verifyBlock(rawBlock: Object): Promise<boolean> {
        return new Promise ((resolve, reject) => {
            var req = {
                method: 'POST',
                url: '/service/verifyBlock/',
                data: rawBlock
            }

            this.$http(req).then((response) => {
                    resolve(response.data);
                },
                (error) => {
                    reject(error);
                });
        });
    }
  }

  angular
  .module('blockExplorerServices', [])
  .factory('BlockService', ['$http', function ($http) {
        return new BlockService($http);
      }]);
}

