var express = require('express');
var bodyParser = require("body-parser");
var path = require('path');

var routes = require('./routes')

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
	console.log('Handle request to '+ req.path +'. Method: '+req.method);
	next();
});
routes(app);

app.listen(app.get('port'), function(){
	console.log("Express server is listening on port "+ app.get('port'));
});