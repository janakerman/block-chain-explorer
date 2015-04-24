/// <reference path="../definitionFiles/angular/angular.d.ts" />
/// <reference path="../definitionFiles/es6-promise/es6-promise.d.ts" />
/// <reference path="../services/classes.ts" />

'use strict';

var test = 0;

module myApp.masterPage {
  'use strict';

  import IBlock = Classes.IBlock;

  interface IMasterPageScope {
    retryError: string;
    oldestBlock: string;
    errorMessage: string;
    previousTenFromLatest: () => void;
    previousTenBlocks: (string) => void;
    previousTen: () => void;
    convertHexToDecimal: (string) => Number;
    rawBlocks: any;
  }

  class MasterPageController implements IMasterPageScope {
    retryError: string;
    oldestBlock: string;
    errorMessage: string;
    rawBlocks: any;

    static $inject = ['$scope', 'BlockService'];
    constructor(private $scope, private BlockService: any) {
      this.retryError = 'Error! Could not load blocks.';
      this.oldestBlock = '';
      this.errorMessage = '';

      this.previousTenFromLatest();
    }

    previousTenFromLatest(): void {
      this.BlockService.getLatestHash().then((latestHash: string) => {
        this.errorMessage = '';
        this.previousTenBlocks(latestHash);
      },
      () => {
        this.previousTenBlocks('000000008d9dc510f23c2657fc4f67bea30078cc05a90eb89e84cc475c080805');
      });
    }

    previousTenBlocks(hash: string): void {
      this.BlockService.getBlocks(hash, 10).then((blocksArray: any) => {
            this.errorMessage = '';

            this.rawBlocks = blocksArray;

            this.oldestBlock = this.rawBlocks[this.rawBlocks.length-1].hash;
          },
          () => {
            this.errorMessage = this.retryError;
            this.$scope.$apply();
            this.previousTenBlocks('000000008d9dc510f23c2657fc4f67bea30078cc05a90eb89e84cc475c080805');
          });
    }

    previousTen(): void {
      this.previousTenBlocks(this.oldestBlock);

    }

    convertHexToDecimal(hex: string): Number {
      return parseInt(hex, 16);
    }
  }

  interface ITextFilter {
    (input: Array<IBlock>, filterText: string): Array<IBlock>
  }

  var textFilter: ITextFilter = function (input: Array<IBlock>, filterText: string) {
    if (!input || !filterText) {
      return input;
    }

    var newArray = input.filter(function(element, index, array) {
      var result = (element.hash.indexOf(filterText) > -1);
      return result;
    });

    return newArray;
  }

  angular
    .module('myApp.masterPage', ['ngRoute', 'blockExplorerServices'])
    .config(['$routeProvider',
      ($routeProvider) => {
        $routeProvider.when('/', {
          templateUrl: 'masterPage/masterPage.html',
          controller: 'MasterPageController'
        });
      }])
    .controller('MasterPageController', MasterPageController)
    .filter('blockHashFilter', function() {
        return textFilter
      })
    .directive('blockCard', function() {
      return {
        restrict: 'E',
        template: '<a href="#/block/{{rawBlock.hash}}"><div><div class="arrow-right"></div><h1>{{ rawBlock.hash | removeLeadingZeros }}</h1><p># Transactions: {{ rawBlock.tx.length }}</p></div></a>',
        scope: {
          rawBlock: "=rawBlock",
        }
      };
    });;
}