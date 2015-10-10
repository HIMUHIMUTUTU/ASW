/**
 * Module dependencies.
 */

var express = require('express');
//var bodyParser = require('body-parser');
//var routes = require('./routes');
var terminal = require('./routes/terminal');
var djview = require('./routes/djview');
var workerview = require('./routes/workerview');
var feedbackview = require('./routes/feedbackview');
var http = require('http');
var path = require('path');

var app = module.exports = express();

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(express.favicon());
var settingconfig = require('./config.json');
//app.use(express.basicAuth(settingconfig.basicAuth.user, settingconfig.basicAuth.pass));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// parse application/x-www-form-urlencoded and application/json
//app.use(bodyParser.urlencoded({ extended: false }))
//app.use(bodyParser.json())

	// development only
	if ('development' == app.get('env')) {
		app.use(express.errorHandler());
	}

//app.get('/', routes.index);
app.get('/terminal', terminal.view);
app.get('/djview', djview.view);
app.get('/workerview', workerview.view);
app.get('/feedbackview', feedbackview.view);

server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

/* For socket-io */ 
var socketIO = require('socket.io');
var io = socketIO.listen(server);
app.set('io', io);
require('./socketio');
