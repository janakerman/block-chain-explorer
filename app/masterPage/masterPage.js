/// <reference path="../definitionFiles/angular/angular.d.ts" />
/// <reference path="../definitionFiles/es6-promise/es6-promise.d.ts" />
'use strict';
var test = 0;
var myApp;
(function (myApp) {
    var masterPage;
    (function (masterPage) {
        'use strict';
        var MasterPageController = (function () {
            function MasterPageController($scope, BlockService) {
                this.$scope = $scope;
                this.BlockService = BlockService;
                this.retryError = 'Error! Could not load blocks.';
                this.oldestBlock = '';
                this.errorMessage = '';
                this.previousTenFromLatest();
            }
            MasterPageController.prototype.previousTenFromLatest = function () {
                var _this = this;
                this.BlockService.getLatestHash().then(function (latestHash) {
                    _this.errorMessage = '';
                    _this.previousTenBlocks(latestHash);
                }, function () {
                    _this.previousTenBlocks('000000008d9dc510f23c2657fc4f67bea30078cc05a90eb89e84cc475c080805');
                });
            };
            MasterPageController.prototype.previousTenBlocks = function (hash) {
                var _this = this;
                this.BlockService.getBlocks(hash, 10).then(function (blocksArray) {
                    _this.errorMessage = '';
                    _this.rawBlocks = blocksArray;
                    _this.oldestBlock = _this.rawBlocks[_this.rawBlocks.length - 1].hash;
                }, function () {
                    _this.errorMessage = _this.retryError;
                    _this.$scope.$apply();
                    _this.previousTenBlocks('000000008d9dc510f23c2657fc4f67bea30078cc05a90eb89e84cc475c080805');
                });
            };
            MasterPageController.prototype.previousTen = function () {
                this.previousTenBlocks(this.oldestBlock);
            };
            MasterPageController.prototype.convertHexToDecimal = function (hex) {
                return parseInt(hex, 16);
            };
            MasterPageController.$inject = ['$scope', 'BlockService'];
            return MasterPageController;
        })();
        var textFilter = function (input, filterText) {
            if (!input || !filterText) {
                return input;
            }
            var newArray = input.filter(function (element, index, array) {
                var result = (element.hash.indexOf(filterText) > -1);
                return result;
            });
            return newArray;
        };
        angular.module('myApp.masterPage', ['ngRoute', 'blockExplorerServices']).config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: 'masterPage/masterPage.html',
                controller: 'MasterPageController'
            });
        }]).controller('MasterPageController', MasterPageController).filter('blockHashFilter', function () {
            return textFilter;
        }).directive('blockCard', function () {
            return {
                restrict: 'E',
                template: '<a href="#/block/{{rawBlock.hash}}"><div><div class="arrow-right"></div><h1>{{ rawBlock.hash | removeLeadingZeros }}</h1><p># Transactions: {{ rawBlock.tx.length }}</p></div></a>',
                scope: {
                    rawBlock: "=rawBlock"
                }
            };
        });
        ;
    })(masterPage = myApp.masterPage || (myApp.masterPage = {}));
})(myApp || (myApp = {}));
//# sourceMappingURL=masterPage.js.map