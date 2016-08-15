module.exports = function(app){
	app.get('/', function(req, res){
		res.redirect('/firewall');
	});
	app.get('/firewall', function(req, res){
		res.render('firewall', {title: 'Firewall', active: module_graph.indexOf('Firewall') != -1});
	});
	app.get('/balance', function(req, res){
		res.render('others', {title: 'Load balance', active: module_graph.indexOf('Balance') != -1});
	});
	app.get('/billing', function(req, res){
		res.render('others', {title: 'Billing', active: module_graph.indexOf('Billing') != -1});
	});
	app.get('/merged', function(req, res){
		request.post({
			url: 'http://locahost:8888/modules',
			form: {module: modules}
		}, function(err, req, body){
			if(err) return console.error('Merge failed:', err);
			module_graph = body;
			console.log("Python server responses with body: ", body);
		});

		res.render('merged', {title: 'Merge results'});
	});
	app.get('/show', function(req, res){
		res.render('show');
	});
	app.get('/graph', function(req, res){
		res.send(module_graph);
	});
	app.get('/flow', function(req, res){
		if(flowPath.src == "" || flowPath.dst == "")
			res.send({flow: 0});
		request.post({
			url: 'http://localhost:8888/flow',
			form: {src: flowPath.src, dst: flowPath.dst}
		}, function(err, req, body){
			if(err){
				console.error('Path search failed:', err);
				res.end();
			}
			res.send(body);
		});
	});
	app.get('/fee',function(req, res){
		request('http://localhost:8888/fee', function(err, response, body){
			if(err) console.error("Fetch fee error: ", err);
			res.send(body);
		});
	});

	app.post('/modules', function(req, res){
		var module = req.body.name,
			operate= req.body.status;
		if(!module) res.send(modules);
		if(operate && modules.indexOf(module) == -1) modules.push(module);
		else if(operate && modules.indexOf(module) != -1)
			modules.splice(modules.indexOf(module), 1);
		res.send(modules);
	});
	app.post('/firewall', function(req, res){
		var ip   = req.body.ip,
			type = req.body.type;
		request.post({
			url: 'http://locahost:8888/firewall',
			form: {ip: ip, type: type}
		}, function(err){
			if(err) console.error('Post firewall failed:', err);
		});
	});
	app.post('/path', function(req, res){
		var src = req.body.src,
			dst = req.bpdy.dst;
		flowPath.src = src;
		flowPath.dst = dst;
		request.post({
			url: 'http://localhost:8888/path',
			form: {src: src, dst: dst}
		}, function(err, req, body){
			if(err) {
				console.error('Path search failed:', err);
				res.end();
			}
			res.send({nodes: body.nodes, links: body.links});
		});
	});
}