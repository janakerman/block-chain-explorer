"use strict";

angular.module("myApp", [ "ngRoute", "myApp.masterPage", "myApp.blockDetailPage", "myApp.version", "blockExplorerServices", "d3" ]).config([ "$routeProvider", function(a) {
    a.when("/block/:blockHash", {
        templateUrl: "blockDetail/blockDetail.html",
        controller: "BlockDetailPageCtrl"
    }).otherwise({
        redirectTo: "/"
    });
} ]).directive("greyBackground", function() {
    return function(a, b, c) {
        b.addClass("list-box");
    };
}).directive("layout", function() {
    return {
        templateUrl: "layout.html",
        restrict: "E",
        transclude: !0
    };
}).filter("removeLeadingZeros", function() {
    return function(a) {
        if (void 0 !== a) {
            for (var b = 0, c = 0, d = a.length; d > c; c++) if ("0" != a[c]) {
                b = c;
                break;
            }
            var e = a.length - b;
            return a.slice(b, b + Math.min(e, 6));
        }
    };
});

var test = 0;

!function() {
    var a = angular.module("myApp.masterPage", [ "ngRoute", "blockExplorerServices" ]);
    a.config([ "$routeProvider", function(a) {
        a.when("/", {
            templateUrl: "masterPage/masterPage.html",
            controller: "MasterPageCtrl"
        });
    } ]), a.controller("MasterPageCtrl", [ "$http", "$scope", "BlockService", function(a, b, c) {
        var d = this, e = "Error! Could not load blocks.";
        d.oldestBlock = "", d.errorMessage = "", this.previousTenFromLatest = function() {
            c.getLatestHash().then(function(a) {
                d.errorMessage = "", d.previousTenBlocks(a);
            }, function(a) {
                d.previousTenBlocks("000000008d9dc510f23c2657fc4f67bea30078cc05a90eb89e84cc475c080805");
            });
        }, this.previousTenBlocks = function(a) {
            c.getBlocks(a, 10).then(function(a) {
                d.errorMessage = "", d.rawBlocks = a, d.oldestBlock = d.rawBlocks[d.rawBlocks.length - 1].hash;
            }, function(a) {
                d.errorMessage = e, b.$apply(), d.previousTenBlocks("000000008d9dc510f23c2657fc4f67bea30078cc05a90eb89e84cc475c080805");
            });
        }, this.previousTen = function() {
            d.previousTenBlocks(d.oldestBlock);
        }, this.convertHexToDecimal = function(a) {
            return parseInt(a, 16);
        }, this.previousTenFromLatest();
    } ]), a.filter("blockHashFilter", function() {
        return function(a, b) {
            if (!a || !b) return a;
            var c = a.filter(function(a, c, d) {
                var e = a.hash.indexOf(b) > -1;
                return e;
            });
            return c;
        };
    }), a.directive("blockCard", function() {
        return {
            restrict: "E",
            template: '<a href="#/block/{{rawBlock.hash}}"><div><div class="arrow-right"></div><h1>{{ rawBlock.hash | removeLeadingZeros }}</h1><p># Transactions: {{ rawBlock.tx.length }}</p></div></a>',
            scope: {
                rawBlock: "=rawBlock"
            }
        };
    });
}(), function() {
    var a = angular.module("blockExplorerServices", []);
    a.factory("BlockService", [ "$http", function(a) {
        var b = {};
        return b.getLatestHash = function() {
            return new Promise(function(b, c) {
                a.get("/blockExplorer/q/latesthash").then(function(a) {
                    b(a.data);
                }, function(a) {
                    c();
                });
            });
        }, b.getBlocks = function(a, c) {
            var d = [], e = function(a, f, g) {
                return d.length === c ? void f(d) : void a.then(function(a) {
                    var c = a;
                    d.push(c), e(b.getBlock(c.prev_block), f);
                }.bind(this), g);
            };
            return new Promise(function(c, d) {
                e(b.getBlock(a), function(a) {
                    c(a);
                }, function(a) {
                    d();
                });
            });
        }, b.getBlock = function(b) {
            return new Promise(function(c, d) {
                a.get("/blockExplorer/rawblock/" + b).then(function(a) {
                    c(a.data);
                }, function(a) {
                    d();
                });
            });
        }, b.getTransactions = function(a, c) {
            var d = function(a, e, f, g, h) {
                return f === c ? void g() : void e.then(function(c) {
                    var e = [];
                    c.forEach(function(c, d) {
                        c.forEach(function(c) {
                            0 !== Object.getOwnPropertyNames(c).length && (a[d].children.push({
                                hash: c.hash,
                                children: []
                            }), e.push(b.getChildTransactions(c)));
                        });
                    });
                    for (var i = [], j = 0; j < a.length; j++) {
                        var k = a[j];
                        k && (i = i.concat(k.children));
                    }
                    d(i, Promise.all(e), f + 1, g, h);
                });
            };
            return new Promise(function(c, e) {
                b.getTransaction(a).then(function(a) {
                    var f = [ {
                        hash: a.hash,
                        children: []
                    } ];
                    d(f, Promise.all([ b.getChildTransactions(a) ]), 0, function() {
                        c(f);
                    }, e);
                });
            });
        }, b.getChildTransactions = function(a) {
            return new Promise(function(c, d) {
                for (var e = [], f = 0; f < a["in"].length; f++) {
                    var g = a["in"][f].prev_out.hash;
                    e.push(b.getTransaction(g));
                }
                Promise.all(e).then(function(a) {
                    c(a);
                });
            });
        }, b.getTransaction = function(b) {
            return new Promise(function(c, d) {
                a.get("/blockExplorer/rawtx/" + b).then(function(a) {
                    c(a.data);
                }, function(a) {
                    c({});
                });
            });
        }, b;
    } ]);
}(), function(a) {
    var b = angular.module("myApp.blockDetailPage", [ "ngRoute", "blockExplorerServices" ]);
    b.config([ "$routeProvider", function(a) {
        a.when("/Block/:blockHash", {
            templateUrl: "blockDetail/blockDetail.html",
            controller: "BlockDetailPageCtrl"
        });
    } ]), b.controller("BlockDetailPageCtrl", [ "$scope", "$routeParams", "BlockService", function(a, b, c) {
        var d = this;
        c.getBlock(b.blockHash).then(function(b) {
            a.$apply(function() {
                d.block = b;
            });
        }).then(function() {
            a.$apply(function() {
                d.rootHash = d.block.tx[0].hash;
            });
        });
    } ]), b.directive("transactionBrowser", function() {
        return {
            templateUrl: "blockDetail/transactionBrowser.html",
            restrict: "E",
            scope: {
                transactions: "=transactions",
                visualisationHash: "=visualisationHash"
            },
            controller: "TrransactionBrowserController",
            controllerAs: "controller"
        };
    }), b.controller("TrransactionBrowserController", [ "$scope", function(a) {
        var b = this;
        a.updateHash = function(b) {
            a.visualisationHash = b;
        }, a.$watch(function() {
            return a.transactions;
        }, function() {
            a.transactions && (b.transactions = a.transactions, 0 !== b.transactions.length && (b.currentIndex = 0, 
            b.currentTransactionsFromIndex(b.currentIndex, 10)));
        }), b.currentTransactionsFromIndex = function(a, c) {
            b.currentTransactions = b.transactions.slice(a, a + c);
        }, b.previousTen = function() {
            b.currentIndex < 10 || (b.currentIndex -= 10, b.currentTransactionsFromIndex(b.currentIndex, 10));
        }, b.nextTen = function() {
            b.currentIndex > b.transactions.length - 10 || (b.currentIndex += 10, b.currentTransactionsFromIndex(b.currentIndex, 10));
        }, b.remainingTransactions = function() {
            return b.transactions ? Math.min(b.transactions.length, b.currentIndex + 10) : void 0;
        };
    } ]), b.directive("visualisation", [ "d3Service", "BlockService", function(a, b) {
        return {
            restrict: "EA",
            scope: {
                rootHash: "=rootHash"
            },
            link: function(c, d, e) {
                var f, g, h = [], i = [], j = 480, k = 640;
                a.then(function(a) {
                    g = a.layout.force(), g.nodes(h), g.links(i), f = a.select("svg").attr("width", k).attr("height", j).style("background-color", "transparent").style("overflow", "visible"), 
                    f.append("g").attr("class", "tx-links"), f.append("g").attr("class", "tx-nodes");
                });
                var l = function() {
                    if (f && g) {
                        d3.selectAll("svg g.tx-nodes g").remove(), d3.selectAll("svg g.tx-links line").remove();
                        var a = f.selectAll("g.tx-links").selectAll(".link").data(i);
                        a.enter().append("line").attr("class", "link"), a.exit().remove();
                        var b = f.selectAll("g.tx-nodes").selectAll(".node-group").data(h), d = b.enter().append("g");
                        d.attr("class", "node-group").attr("tx-hash", function(a) {
                            return a.hash;
                        }).on("click", function(a) {
                            c.$apply(function() {
                                c.rootHash = a.hash;
                            });
                        }), d.append("circle").attr("r", 20).attr("class", "node"), d.append("text").style("text-anchor", "middle").attr("fill", "white"), 
                        f.selectAll("svg text").text(function(a) {
                            return a.hash.slice(0, 3);
                        }), b.exit().remove(), g.on("tick", function() {
                            b.attr("transform", function(a) {
                                return "translate(" + a.x + ", " + a.y + ")";
                            }), a.attr("x1", function(a) {
                                return a.source.x;
                            }).attr("y1", function(a) {
                                return a.source.y;
                            }).attr("x2", function(a) {
                                return a.target.x;
                            }).attr("y2", function(a) {
                                return a.target.y;
                            });
                        }), g.size([ k, j ]).nodes(h).links(i).linkDistance(function(a) {
                            return 15 / (1 / a.layer);
                        }).charge(-1800).chargeDistance(140).alpha(2), g.start();
                    }
                };
                c.$watch(function() {
                    return c.rootHash;
                }, function() {
                    void 0 !== c.rootHash && b.getTransactions(c.rootHash, 3).then(function(a) {
                        var b = function() {
                            var a = 0;
                            return function(c, d) {
                                c.uid = a, h.push(c), 0 !== c.children.length && c.children.forEach(function(e) {
                                    a++, i.push({
                                        source: c,
                                        target: e,
                                        layer: d
                                    }), b(e, d + 1);
                                });
                            };
                        }();
                        h.length = 0, i.length = 0, b(a[0], 0), h.slice().splice(0, 1).forEach(function(a, b) {
                            0 === b ? (a.fixed = !0, a.x = k / 2, a.y = j / 2) : (a.y = 0, a.x = 0);
                        }), l();
                    });
                });
            }
        };
    } ]);
}(this), function() {
    angular.module("d3", []).factory("d3Service", [ "$document", "$q", "$rootScope", function(a, b, c) {
        return new Promise(function(b, d) {
            function e() {
                c.$apply(function() {
                    b(window.d3);
                });
            }
            var f = a[0].createElement("script");
            f.type = "text/javascript", f.async = !0, f.src = "http://d3js.org/d3.v3.min.js", 
            f.onreadystatechange = function() {
                "complete" == this.readyState && e();
            }, f.onload = e;
            var g = a[0].getElementsByTagName("body")[0];
            g.appendChild(f);
        });
    } ]);
}(), angular.module("myApp.version", [ "myApp.version.interpolate-filter", "myApp.version.version-directive" ]).value("version", "0.1"), 
angular.module("myApp.version.version-directive", []).directive("appVersion", [ "version", function(a) {
    return function(b, c, d) {
        c.text(a);
    };
} ]), angular.module("myApp.version.interpolate-filter", []).filter("interpolate", [ "version", function(a) {
    return function(b) {
        return String(b).replace(/\%VERSION\%/gm, a);
    };
} ]), function(a, b, c) {
    function d() {
        function a(a, c) {
            return b.extend(new (b.extend(function() {}, {
                prototype: a
            }))(), c);
        }
        function c(a, b) {
            var c = b.caseInsensitiveMatch, d = {
                originalPath: a,
                regexp: a
            }, e = d.keys = [];
            return a = a.replace(/([().])/g, "\\$1").replace(/(\/)?:(\w+)([\?\*])?/g, function(a, b, c, d) {
                var f = "?" === d ? d : null, g = "*" === d ? d : null;
                return e.push({
                    name: c,
                    optional: !!f
                }), b = b || "", "" + (f ? "" : b) + "(?:" + (f ? b : "") + (g && "(.+?)" || "([^/]+)") + (f || "") + ")" + (f || "");
            }).replace(/([\/$\*])/g, "\\$1"), d.regexp = new RegExp("^" + a + "$", c ? "i" : ""), 
            d;
        }
        var d = {};
        this.when = function(a, e) {
            if (d[a] = b.extend({
                reloadOnSearch: !0
            }, e, a && c(a, e)), a) {
                var f = "/" == a[a.length - 1] ? a.substr(0, a.length - 1) : a + "/";
                d[f] = b.extend({
                    redirectTo: a
                }, c(f, e));
            }
            return this;
        }, this.otherwise = function(a) {
            return this.when(null, a), this;
        }, this.$get = [ "$rootScope", "$location", "$routeParams", "$q", "$injector", "$http", "$templateCache", "$sce", function(c, e, f, g, h, i, j, k) {
            function l(a, b) {
                var c = b.keys, d = {};
                if (!b.regexp) return null;
                var e = b.regexp.exec(a);
                if (!e) return null;
                for (var f = 1, g = e.length; g > f; ++f) {
                    var h = c[f - 1], i = e[f];
                    h && i && (d[h.name] = i);
                }
                return d;
            }
            function m() {
                var a = n(), d = q.current;
                a && d && a.$$route === d.$$route && b.equals(a.pathParams, d.pathParams) && !a.reloadOnSearch && !p ? (d.params = a.params, 
                b.copy(d.params, f), c.$broadcast("$routeUpdate", d)) : (a || d) && (p = !1, c.$broadcast("$routeChangeStart", a, d), 
                q.current = a, a && a.redirectTo && (b.isString(a.redirectTo) ? e.path(o(a.redirectTo, a.params)).search(a.params).replace() : e.url(a.redirectTo(a.pathParams, e.path(), e.search())).replace()), 
                g.when(a).then(function() {
                    if (a) {
                        var c, d, e = b.extend({}, a.resolve);
                        return b.forEach(e, function(a, c) {
                            e[c] = b.isString(a) ? h.get(a) : h.invoke(a);
                        }), b.isDefined(c = a.template) ? b.isFunction(c) && (c = c(a.params)) : b.isDefined(d = a.templateUrl) && (b.isFunction(d) && (d = d(a.params)), 
                        d = k.getTrustedResourceUrl(d), b.isDefined(d) && (a.loadedTemplateUrl = d, c = i.get(d, {
                            cache: j
                        }).then(function(a) {
                            return a.data;
                        }))), b.isDefined(c) && (e.$template = c), g.all(e);
                    }
                }).then(function(e) {
                    a == q.current && (a && (a.locals = e, b.copy(a.params, f)), c.$broadcast("$routeChangeSuccess", a, d));
                }, function(b) {
                    a == q.current && c.$broadcast("$routeChangeError", a, d, b);
                }));
            }
            function n() {
                var c, f;
                return b.forEach(d, function(d, g) {
                    !f && (c = l(e.path(), d)) && (f = a(d, {
                        params: b.extend({}, e.search(), c),
                        pathParams: c
                    }), f.$$route = d);
                }), f || d[null] && a(d[null], {
                    params: {},
                    pathParams: {}
                });
            }
            function o(a, c) {
                var d = [];
                return b.forEach((a || "").split(":"), function(a, b) {
                    if (0 === b) d.push(a); else {
                        var e = a.match(/(\w+)(?:[?*])?(.*)/), f = e[1];
                        d.push(c[f]), d.push(e[2] || ""), delete c[f];
                    }
                }), d.join("");
            }
            var p = !1, q = {
                routes: d,
                reload: function() {
                    p = !0, c.$evalAsync(m);
                }
            };
            return c.$on("$locationChangeSuccess", m), q;
        } ];
    }
    function e() {
        this.$get = function() {
            return {};
        };
    }
    function f(a, c, d) {
        return {
            restrict: "ECA",
            terminal: !0,
            priority: 400,
            transclude: "element",
            link: function(e, f, g, h, i) {
                function j() {
                    n && (n.remove(), n = null), l && (l.$destroy(), l = null), m && (d.leave(m, function() {
                        n = null;
                    }), n = m, m = null);
                }
                function k() {
                    var g = a.current && a.current.locals, h = g && g.$template;
                    if (b.isDefined(h)) {
                        var k = e.$new(), n = a.current, q = i(k, function(a) {
                            d.enter(a, null, m || f, function() {
                                !b.isDefined(o) || o && !e.$eval(o) || c();
                            }), j();
                        });
                        m = q, l = n.scope = k, l.$emit("$viewContentLoaded"), l.$eval(p);
                    } else j();
                }
                var l, m, n, o = g.autoscroll, p = g.onload || "";
                e.$on("$routeChangeSuccess", k), k();
            }
        };
    }
    function g(a, b, c) {
        return {
            restrict: "ECA",
            priority: -400,
            link: function(d, e) {
                var f = c.current, g = f.locals;
                e.html(g.$template);
                var h = a(e.contents());
                if (f.controller) {
                    g.$scope = d;
                    var i = b(f.controller, g);
                    f.controllerAs && (d[f.controllerAs] = i), e.data("$ngControllerController", i), 
                    e.children().data("$ngControllerController", i);
                }
                h(d);
            }
        };
    }
    var h = b.module("ngRoute", [ "ng" ]).provider("$route", d);
    h.provider("$routeParams", e), h.directive("ngView", f), h.directive("ngView", g), 
    f.$inject = [ "$route", "$anchorScroll", "$animate" ], g.$inject = [ "$compile", "$controller", "$route" ];
}(window, window.angular);