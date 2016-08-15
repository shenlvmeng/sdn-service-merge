const exec = require('child_process').exec;
var http = require('http');
var url = require('url');

var server = http.createServer(function(request, response){
	var pathname = url.parse(request.url).pathname;
	console.log('Request for '+ pathname +' received.');

	response.writeHead(200, {"Content-Type": "text/plain"});
	if(pathname == '/'){
		var sys = process.platform;
		console.log(sys);
		if(sys === 'win32') var cmd = 'start cmd';
		else if(sys === 'linux') var cmd = 'gnome-terminal';
		else{
			console.log('Unsupported OS!');
			response.write('_cb("{\\\"status\\\": \\\"error\\\", \\\"message\\\": \\\"Unsupported OS!\\\"}")');
			response.end();
		}
		exec(cmd,(error,stdout,stderr) => {
			if(error)
				console.error(`exec error: ${error}`);
			response.write('_cb("{\\\"status\\\": \\\"ok\\\"}")');
			response.end();
		});
	} else if(pathname == '/billing') {
		response.write('_cb("{\\\"status\\\": \\\"ok\\\", \\\"bills\\\": [10, 11, 12, 12]}")');
		response.end();
	} else if(pathname == '/kill'){
		var sys = process.platform;
		console.log(sys);
		if(sys != 'linux'){
			console.log('Unsupported OS!');
			response.end('_cb("{\\\"status\\\": \\\"error\\\", \\\"message\\\": \\\"Unsupported OS!\\\"}")');
		}
		exec('sudo kill $(sudo lsof -t -i:6633)', (error,stdout,stderr) => {
			if(error)
				console.error(`exec error: ${error}`);
			response.end('_cb("{\\\"status\\\": \\\"ok\\\"}")');
		});
	} else {
		response.write('_cb("{\\\"status\\\": \\\"error\\\", \\\"message\\\": \\\"Wrong path!\\\"}")');
		response.end();
	}
}).listen(8888);
console.log("Server has started.");