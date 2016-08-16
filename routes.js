var request = require('request');
var exec = require('child_process').exec;

module.exports = function(app){
	var modules = [];
	var module_graph = {};
	var flowPath = {src: "", dst: ""};
	var denyList = [];

	app.get('/', function(req, res){
		res.redirect('/firewall');
	});

	//site 1
	app.get('/firewall', function(req, res){
		res.render('firewall', {title: 'Admin 1: Firewall', active: modules.indexOf('Firewall') != -1});
	});
	app.post('/firewall', function(req, res){
		var ip    = req.body.ip,
			type  = req.body.type,
			index = req.body.index;
		request.post({
			url: 'http://localhost:5000/firewall',
			form: {ip: ip, type: type}
		}, function(err){
			if(err) console.error('Post firewall failed:', err);
		});
		if(type == 'deny' && denyList.indexOf(index) == -1) denyList.push(index);
		else if(type == 'allow' && denyList.indexOf(index) != -1) denyList.splice(denyList.indexOf(index), 1);
	});
	app.get('/firelist', function(req, res){
		console.log("DenyList: ", denyList);
		res.send(denyList);
	});

	//site 2 & 3
	app.get('/balance', function(req, res){
		res.render('others', {title: 'Admin 2: Load balance', abbre: '负载均衡', active: modules.indexOf('Balance') != -1});
	});
	app.get('/billing', function(req, res){
		res.render('others', {title: 'Admin 3: Billing', abbre: '计费系统', active: modules.indexOf('Billing') != -1});
	});

	//site 4
	app.get('/merged', function(req, res){
		request.post({
			url: 'http://localhost:5000/modules',
			form: {module: modules}
		}, function(err, req, body){
			if(err){
				console.error('Merge failed:', err);
				res.end();
			}
			module_graph = body;
			console.log("Python server responses with body: ", body);
		});
		res.render('merged', {title: 'Merge results'});
	});
	app.get('/graph', function(req, res){
		console.log("Merged logic graph: ", module_graph);
		res.send(module_graph);
	});

	//site 5
	app.get('/show', function(req, res){
		res.render('show');
	});
	app.post('/path', function(req, res){
		var src = req.body.src,
			dst = req.body.dst;
		flowPath.src = src;
		flowPath.dst = dst;
		console.log("FlowPath: ", flowPath);
		request.post({
			url: 'http://localhost:5000/path',
			form: {src: src, dst: dst}
		}, function(err, req, body){
			if(err){
				console.error('Path search failed:', err);
				res.end();
			}
			else res.send({nodes: body.nodes, links: body.links});
		});
	});
	app.get('/flow', function(req, res){
		if(flowPath.src == "" || flowPath.dst == "")
			res.send({flow: 0});
		else{
			request.post({
				url: 'http://localhost:5000/flow',
				form: {src: flowPath.src, dst: flowPath.dst}
			}, function(err, req, body){
				if(err){
					console.error('Getting flow statistics failed:', err);
					res.send({flow: 0});
				} else res.send(body);
			});
		}
	});
	app.get('/fee',function(req, res){
		request('http://localhost:5000/fee', function(err, response, body){
			if(err){
				console.error("Fetch fee error: ", err);
				res.send([0,0,0,0]);
			} else res.send(body);
		});
	});

	//switch button & merge button
	app.get('/modules', function(req, res){
		res.send(modules);
	});
	app.post('/modules', function(req, res){
		var module = req.body.name,
			operate= req.body.status;
		if(module == "Firewall" && operate == 0) denyList = [];
		if(operate == 1 && modules.indexOf(module) == -1) modules.push(module);
		else if(operate == 0 && modules.indexOf(module) != -1) modules.splice(modules.indexOf(module), 1);
		request.post({
			url: 'http://localhost:5000/module_state',
			form: {module: module, state: operate}
		}, function(err, req, body){
			if(err) console.error('Modules state transfer failed:', err);
		});
		console.log("modules: ", modules);
		res.send(modules);
	});

	//fire a terminal
	app.get('/terminal', function(req, res){
		var sys = process.platform;
		var cmd = 'gnome-terminal';
		exec(cmd,(error,stdout,stderr) => {
			if(error)
				console.error("exec error: ", error);
			res.end();
		});
	});
}