//var common = {totalId:0, clientAuth:{dj:{}, worker:{}, feedback:{}}, clientStatus:[], log:null, timer:null};

for(var i = 0; i < 5; i++){
	common.clientStatus.push({id:i, status_flag:0, name:"", metric:[0,0,0], speak:0, speakTime:[], totalSpeakTime:0, mindwaveTime:[0],attention:[0], meditation:[0]});
}
/**
 * New node file
 */
//var routes = require('./routes');
//var referlog = require('./models/referlog');
//var handwrite_recognition = require('./models/handwrite_recognition');
var fs = require('fs');
var app = module.parent.exports;
var io = app.get('io');

common.timer = new Timer();

//case of receive connection of client 
io.sockets.on('connection', function(socket) {

	//authentication and ID management
	socket.on('auth', function(data){
		console.log(data);
		common.clientAuth[data.type][socket.id] = socket;

		if(data.id != null && data.type == "worker"){
			for(var i = 0; i < common.clientStatus.length; i++){
				if(common.clientStatus[i].id == data.id){
					if(common.clientStatus[i].status_flag == 0){
						common.clientStatus[i].status_flag= 1;
					}else if(common.timer.status_flag == 1){
						socket.emit('setdata', common.timer.getTime());
					}
				}
			}
			console.dir(common.clientAuth);
			console.dir(common.clientStatus);
			common.totalId++;
			//send client id to client
			//socket.emit('setid', common.totalId);
			UpdateDJ();
		}else if(data.type == "dj" && common.timer.status_flag == 1){
			socket.emit('setdata', common.timer.getTime());
		}

	}); 

	socket.on('updateName', function(data){
		console.log(data);
		for(var i = 0; i < common.clientStatus.length; i++){
			if(common.clientStatus[i].id == data.id){
				common.clientStatus[i].name = data.name;
				//common.log.addLog("UPDATEMETRIC," + data.id + "," + data.name);
			}
		}
		UpdateDJ();
	}); 


	socket.on('updateMetric', function(data){
		console.log(data);
		for(var i = 0; i < common.clientStatus.length; i++){
			if(common.clientStatus[i].id == data.id){
				common.clientStatus[i].metric = data.metric;
				if(common.log != null){
					common.log.addLog("UPDATEMETRIC," + data.id + "," + data.metric);
				}
			}
		}
		UpdateDJ();
	}); 

	socket.on('updateSpeak', function(data){
		console.log(data);
		for(var i = 0; i < common.clientStatus.length; i++){
			if(common.clientStatus[i].id == data.id){

				//speak status
				common.clientStatus[i].speak = data.speak;
				//speak time
				var ls = common.clientStatus[i].speakTime.length; 
				if(data.speak == 1){
					common.clientStatus[i].speakTime.push([data.time,data.time]);
				}else if(data.speak == 0 && ls != 0){
					common.clientStatus[i].speakTime[ls - 1][1] = data.time; 
					if(common.log != null){
						common.log.addLog("SPEAK," + data.id + "," + common.clientStatus[i].speakTime[ls - 1]);
					}
				}

				//total speak time
				if(data.speak == 0 && ls != 0){
					common.clientStatus[i].totalSpeakTime += (common.clientStatus[i].speakTime[ls - 1][1] - common.clientStatus[i].speakTime[ls - 1][0]); 
				}

			}
		}
		UpdateDJ();
	}); 

	socket.on('updateMindwave', function(data){
		console.log(data);
		for(var i = 0; i < common.clientStatus.length; i++){
			if(common.clientStatus[i].id == data.id){

				//Mindwave status
				common.clientStatus[i].mindwaveTime.push(data.time);
				common.clientStatus[i].attention.push(data.attention);
				common.clientStatus[i].meditation.push(data.meditation);
				if(common.log != null){
					common.log.addLog("MINDWAVE," + data.id + "," + data.attention + "," + data.meditation);
				}
			}
		}
		UpdateDJ();
	}); 

	//start timer of clients
	socket.on('startTimer', function(data){
		Reset();
		common.timer.startTimer();
		//common.log = new Log();
		for (key in common.clientAuth['worker']){
			var csocket = common.clientAuth['worker'][key]
				csocket.emit('startTimer');
		}
		UpdateDJ();
	}); 

	//feedback to feedback view
	socket.on('feedback', function(data){
		if(common.log != null){
			common.log.addLog("FEEDBACK," + data.type + "," + data.id);
		}
		for (key in common.clientAuth['feedback']){
			var csocket = common.clientAuth['feedback'][key];
			csocket.emit('emitFeedback', {type:data.type, id:data.id});
		}
	}); 

	//disconnect
	socket.on('disconnect', function(){
		console.log("disconnect");
	});


	function Reset(){
		for(var i = 0; i < 5; i++){
			common.clientStatus[i].metric = [0,0,0];
			common.clientStatus[i].speak=0;
			common.clientStatus[i].speakTime=[];
			common.clientStatus[i].totalSpeakTime=0;
			common.clientStatus[i].mindwaveTime=[0];
			common.clientStatus[i].attention=[0];
			common.clientStatus[i].meditation=[0];
		}
	}

	function UpdateDJ(){
		console.dir(common.clientStatus);
		//send client info to dj
		for (key in common.clientAuth['dj']){
			var csocket = common.clientAuth['dj'][key]
				csocket.emit('updateTable', common.clientStatus);
		}
	}
});

function Log(){
	var date =new Date();
	fs.writeFile('log/' + date + '.txt', date + ',STARTLOG' , function (err) {
		this.makeDate = date;
		if(!err){console.log(err)};
	});
}

Log.prototype.addLog = function(data){
	var date =new Date();
	data = date + "," + data;
	fs.appendFile('log/' + this.makeDate + '.txt', data ,'utf8', function (err) {
		if(!err){console.log(err)};
	});
}

/** 
 * Timer Object
 **/
function Timer(){
	this.startTime;
	this.time;
	var date =new Date();
	this.startTime = date.getTime();
	this.status_flag = 0;
}

Timer.prototype.startTimer = function(){
	var date =new Date();
	this.startTime = date.getTime();
	this.status_flag = 1;
	console.log("STARTTIME:" + this.startTime);
}

Timer.prototype.getTime = function(){
	var date =new Date();
	var currentTime = date.getTime();
	this.time = currentTime - this.startTime;
	return this.time;
};

