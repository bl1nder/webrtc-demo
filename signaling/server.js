var static = require('node-static');
var http = require('http');
var file = new (static.Server)();
var app = http.createServer(function (req, res) {
	console.log('got requset')
	file.serve(req, res);
})


app.listen(1235, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}
	console.log(`server is listening on 1235`)
});
