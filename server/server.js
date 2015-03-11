var connect = require('connect');
var http = require('http');
var proxy = require('proxy-middleware');
var url = require('url');

var app = connect();

// Proxy all requests to blockexplorer.com
app.use('/blockexplorer', proxy(url.parse('https://blockexplorer.com/')));

//create node.js http server and listen on port
http.createServer(app).listen(8080);
