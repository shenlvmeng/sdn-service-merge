var express = require('express');
var request = require('request');
var path = require('path');

var routes = require('./routes')

var app = express();

var modules = [];
var module_graph = {};

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

routes(app);

app.listen(app.get('port'), function(){
	console.log("Express server is listening on port "+ app.get('port'));
});