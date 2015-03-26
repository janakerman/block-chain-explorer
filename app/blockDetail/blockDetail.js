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

    self.rootHash = '8dd171d6f04ba0f5df0c7d0491ae8455134c70ebdedc798bb4c9441d5ee03158';

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
        visualisationHash: '=visualisationHash'
      },
      controller: function($scope) {
        var vm = this;

        console.log($scope.visualisationHash);

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
      scope: {
        rootHash: "=rootHash",
      },
      link: function(scope, element, attrs) {
        
        var loadDependancies = Promise.all([d3Service, 
                                           BlockService.getTransactions(scope.rootHash, 6)]);

        loadDependancies.then(function(result) {

          var d3 = result[0];

          var tree = result[1];

          var nodes = [];
          var links = [];
          var index = 0;

          var dataFromTree = function (parent, layer) {
            parent.uid = index;
            nodes.push(parent);

            if (parent.children.length === 0) {
              return;
            }

            parent.children.forEach(function(element) {
              index++;

              links.push({  source : parent,
                            target : element,
                            layer : layer});

              dataFromTree(element, layer+1);
            });
          };
          

          var width = 640,
              height = 480;

          dataFromTree(tree[0], 0);

          nodes.slice().splice(0, 1).forEach(function (element, index) {
            if (index === 0) {
              element.fixed = true;
              element.x = width/2;
              element.y = height/2;
            } else {
              element.y = 0;
              element.x = 0;  
            }
            
          });


          var svg = d3.select('svg')
              .attr('width', '100%')
              .attr('height', height);

              svg.append("g").attr("class", "tx-links");
              svg.append("g").attr("class", "tx-nodes");

          var force = d3.layout.force()
              .size([width, height])
              .nodes(nodes)
              .links(links)
              .linkDistance(function(d) {
                return 5 / (1/d.layer);
              })
              .charge(-700)
              .chargeDistance(100)
              .alpha(2);

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
