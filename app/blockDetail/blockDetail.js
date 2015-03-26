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

        $scope.updateHash = function (newHash) {
          $scope.visualisationHash = newHash;
        };

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

        var nodes = [], links = [], svg, force, height = 480, width = 640;

        d3Service.then(function(d3) {

          force = d3.layout.force();
          force.nodes(nodes);
          force.links(links);

          svg = d3.select('svg')
              .attr('width', width)
              .attr('height', height)
              .style('background-color', 'gray');

              svg.append("g").attr("class", "tx-links");
              svg.append("g").attr("class", "tx-nodes");
        });

        var update = function () {
          if (!svg || !force) return;

          var link = svg.selectAll('g.tx-links').selectAll('.link').data(links);

          link.enter().append('line')
            .attr('class', 'link');

          link.exit().remove();

          var node = svg.selectAll('g.tx-nodes').selectAll('.node, .anchor').data(nodes);
            
          node.enter().append('circle')
            .attr('class', 'node');

          node.exit().remove();
          
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

          force
          .size([width, height])
          .nodes(nodes)
          .links(links)
          .linkDistance(function(d) {
            return 5 / (1/d.layer);
          })
          .charge(-700)
          .chargeDistance(100)
          .alpha(2);

          force.start();
        };

        scope.$watch(function() {
          return scope.rootHash;
        }, function() {
          BlockService.getTransactions(scope.rootHash, 3)
          .then(function (result) {

            var dataFromTree = function () {
              var index = 0;

              return function (parent, layer) {
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
            }();

            

            nodes.length = 0;
            links.length = 0;
            dataFromTree(result[0], 0);

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

            update();

          });

        });
      },
    };
  }]);

})(this);  
