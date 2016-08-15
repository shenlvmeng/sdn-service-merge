module.exports = function(app){
	app.get('/', function(req, res){
		res.redirect('/firewall');
	});
	app.get('/firewall', function(req, res){
		res.render('firewall', {title: 'Firewall', active: module_graph.indexOf('Firewall') != -1});
	});
	app.get('/balance', function(req, res){
		res.render('balance', {title: 'Load balance', active: module_graph.indexOf('Balance') != -1});
	});
	app.get('/billing', function(req, res){
		res.render('billing', {title: 'Billing', active: module_graph.indexOf('Billing') != -1});
	});
	app.get('/merged', function(req, res){
		request.post({
			url: 'http://locahost:8888/modules',
			form: {module: modules}
		}, function(err, req, body){
			if(err) return console.error('Post firewall failed:', err);
			module_graph = body;
			console.log("Python server responses with body: ", body);
		});

		res.render('merged', {title: 'Merge results'});
	});
	app.get('/show', function(req, res){
		res.render('show');
	});
	app.get('/graph', function(req, res){
		res.json(module_graph);
	})

	app.post('/modules', function(req, res){
		var module = req.body.name,
			operate= req.body.status;
		if(!module) return false;
		if(operate && modules.indexOf(module) == -1) modules.push(module);
		else if(operate && modules.indexOf(module) != -1)
			modules.splice(modules.indexOf(module), 1);
		return true;
	});
	app.post('/firewall', function(req, res){
		var ip   = req.body.ip,
			type = req.body.type;
		request.post({
			url: 'http://locahost:8888/firewall',
			form: {ip: ip, type: type}
		}, function(err){
			if(err) return console.error('Post firewall failed:', err);
		});
	});
}