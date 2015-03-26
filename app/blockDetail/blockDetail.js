(function($window) {
  'use strict';
  var blockDetailPage = angular.module('myApp.blockDetailPage', ['ngRoute', 'blockExplorerServices']);

  blockDetailPage.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/Block/:blockHash', {
      templateUrl: 'blockDetail/blockDetail.html',
      controller: 'BlockDetailPageCtrl',
    });
  }]);

  blockDetailPage.controller('BlockDetailPageCtrl', ['$scope', '$routeParams', 'BlockService', function($scope, $routeParams, BlockService) {
    var self = this;

    BlockService.getBlock($routeParams.blockHash).then(function(block) {
      $scope.$apply(function() {
        self.block = block;
      });
    });
  }]);

  blockDetailPage.directive('transactionBrowser', function() {
    return {
      templateUrl: 'blockDetail/transactionBrowser.html',
      restrict: 'E',
      scope: {
        transactions: '=transactions',
      },
      controller: function($scope) {
        var vm = this;

        $scope.$watch(function() {
            return $scope.transactions;
          }, function() {

            if (!$scope.transactions) {
              return;
            }

            vm.transactions = $scope.transactions;

            if (vm.transactions.length === 0) {
             return;
            }

            vm.currentIndex = 0;
            vm.currentTransactionsFromIndex(vm.currentIndex, 10);
          });

          vm.currentTransactionsFromIndex = function (index, number) {
            vm.currentTransactions = vm.transactions.slice(index, index+number);
          };

          vm.previousTen = function () {
            if (vm.currentIndex < 10) {
              return;
            }

            vm.currentIndex -= 10;

            vm.currentTransactionsFromIndex(vm.currentIndex, 10);
          };

          vm.nextTen = function () {
            if (vm.currentIndex > vm.transactions.length-10) {
              return;
            }

            vm.currentIndex += 10;

            vm.currentTransactionsFromIndex(vm.currentIndex, 10);
          };

          vm.remainingTransactions = function() {
            if (!vm.transactions) {
              return;
            }

            return Math.min(vm.transactions.length, vm.currentIndex + 10);
          };
      },
      controllerAs: 'controller',
    };
  });

  blockDetailPage.directive('visualisation', ['d3Service', 'BlockService', function(d3Service, BlockService) {
    return {
      restrict: 'EA',
      scope: {},
      link: function(scope, element, attrs) {
        
        var loadDependancies = Promise.all([d3Service, 
                                           BlockService.getTransactions('8dd171d6f04ba0f5df0c7d0491ae8455134c70ebdedc798bb4c9441d5ee03158', 8)]);

        loadDependancies.then(function(result) {

          var d3 = result[0];

          var tree = result[1];

          var nodes = [];
          var links = [];
          var index = 0;

          var dataFromTree = function (parent) {
            parent.uid = index;
            nodes.push(parent);

            if (parent.children.length === 0) {
              return;
            }

            parent.children.forEach(function(element) {
              index++;

              links.push({  source : parent,
                            target : element});

              dataFromTree(element);
            });
          };
          

          var width = 640,
              height = 480;

          dataFromTree(tree[0], []);
          nodes[0].fixed = true;
          nodes[0].cx = width/2;
          nodes[0].cy = height/2;


          var svg = d3.select('body').append('svg')
              .attr('width', width)
              .attr('height', height);

              svg.append("g").attr("class", "tx-links");
              svg.append("g").attr("class", "tx-nodes");

          var force = d3.layout.force()
              .size([width, height])
              .nodes(nodes)
              .links(links)
              .linkDistance(20)
              .charge(-100);

          var link = svg.selectAll('g.tx-links').selectAll('.link')
              .data(links)
              .enter().append('line')
              .attr('class', 'link');

          var node = svg.selectAll('g.tx-nodes').selectAll('.node, .anchor')
              .data(nodes)
              .enter().append('circle')
              .attr('class', 'node'); 

          force.on('tick', function() {

              console.log('layout ended');

              node.attr('r', 10)
                  .attr('cx', function(d) { return d.x; })
                  .attr('cy', function(d) { return d.y; });

              link.attr('x1', function(d) { return d.source.x; })
                  .attr('y1', function(d) { return d.source.y; })
                  .attr('x2', function(d) { return d.target.x; })
                  .attr('y2', function(d) { return d.target.y; });

          });

          force.start();

        });
      },
    };
  }]);

})(this);
