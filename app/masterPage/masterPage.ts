/// <reference path="../definitionFiles/angular/angular.d.ts" />
/// <reference path="../definitionFiles/es6-promise/es6-promise.d.ts" />
/// <reference path="../services/classes.ts" />
/// <reference path="MasterPageController.ts" />

'use strict';

var test = 0;

module myApp.masterPage {
  'use strict';

  import IBlock = Classes.IBlock;
  import MasterPageController = myApp.masterPage.MasterPageController;

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
    .module('myApp.masterPage', ['ngRoute', 'blockExplorerServices', 'myApp.masterPage.MasterPageController'])
    .config(['$routeProvider',
      ($routeProvider) => {
        $routeProvider.when('/', {
          templateUrl: 'masterPage/masterPage.html',
          controller: 'MasterPageController'
        });
      }])
    .controller('MasterPageController', function() {
        return MasterPageController;
      }())
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