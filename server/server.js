var requirejs = require('requirejs');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

requirejs(['connect', 'http', 'body-parser', 'proxy-middleware', 'url', 'serve-static', 'verifyBlock'],
function   (connect,   http, bodyParser, proxy, url, serveStatic, verifyBlock) {
	var app = connect();

	app.use(serveStatic(__dirname + '/../'));

	// Proxy all requests to blockexplorer.com
	app.use('/blockexplorer', proxy(url.parse('https://blockexplorer.com/')));

	app.use(bodyParser.json({ limit: '10000kb'}));

	app.use('/service/verifyBlock/', function(req, res, next) {
		var response = verifyBlock(req.body);
		res.end(response);
	});

	//create node.js http server and listen on port
	http.createServer(app).listen(8080);

});

