/// <reference path="../definitionFiles/angular/angular.d.ts" />

module myApp.masterPage {

    export interface IMasterPageScope {
        retryError: string;
        oldestBlock: string;
        errorMessage: string;
        previousTenFromLatest: () => void;
        previousTenBlocks: (string) => void;
        previousTen: () => void;
        convertHexToDecimal: (string) => Number;
        rawBlocks: any;
    }

    export class MasterPageController implements IMasterPageScope {
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


    angular
    .module('myApp.masterPage.MasterPageController', ['blockExplorerServices']);

}