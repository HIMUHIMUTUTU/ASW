var common = {totalId:0, clientAuth:{dj:{}, worker:{}, feedback:{}}, clientStatus:[], log:null, timer:null, analysis:null, loop:null, loopTime:2 * 60 * 1000};

for(var i = 0; i < 5; i++){
	common.clientStatus.push({id:i, status_flag:0, name:"", metric:[0,0,0], speak:0, speakTime:[], totalSpeakTime:0, mindwaveTime:[0],attention:[0], meditation:[0]});
}

//var routes = require('./routes');
var fs = require('fs');
var app = module.parent.exports;
var io = app.get('io');

common.timer = new Timer();

//case of receive connection of client 
io.sockets.on('connection', function(socket) {

	//authentication and ID management
	socket.on('auth', function(data){
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
			common.totalId++;
			//send client id to client
			//socket.emit('setid', common.totalId);
			UpdateDJ();
		}else if(data.type == "dj" && common.timer.status_flag == 1){
			socket.emit('setdata', common.timer.getTime());
		}

	}); 

	socket.on('updateName', function(data){
		for(var i = 0; i < common.clientStatus.length; i++){
			if(common.clientStatus[i].id == data.id){
				common.clientStatus[i].name = data.name;
				//common.log.addLog("UPDATEMETRIC," + data.id + "," + data.name);
			}
		}
		UpdateDJ();
	}); 


	socket.on('updateMetric', function(data){
		for(var i = 0; i < common.clientStatus.length; i++){
			if(common.clientStatus[i].id == data.id){
				common.clientStatus[i].metric = data.metric;
				if(common.log != null){
					common.log.addLog("UPDATEMETRIC," + data.id + "," + data.metric + "\r");
				}
			}
		}
		UpdateDJ();
	}); 

	socket.on('updateSpeak', function(data){
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
						common.log.addLog("SPEAK," + data.id + "," + common.clientStatus[i].speakTime[ls - 1][0] + "," + common.clientStatus[i].speakTime[ls - 1][1] + "\r");
					}
				}
				/*total speak time
				  if(data.speak == 0 && ls != 0){
				  common.clientStatus[i].totalSpeakTime += (common.clientStatus[i].speakTime[ls - 1][1] - common.clientStatus[i].speakTime[ls - 1][0]); 
				  }
				  */
			}
		}
		UpdateDJ();
	}); 

	socket.on('updateMindwave', function(data){
		for(var i = 0; i < common.clientStatus.length; i++){
			if(common.clientStatus[i].id == data.id){

				//Mindwave status
				common.clientStatus[i].mindwaveTime.push(data.time);
				common.clientStatus[i].attention.push(data.attention);
				common.clientStatus[i].meditation.push(data.meditation);
				if(common.log != null){
					common.log.addLog("MINDWAVE," + data.id + "," + data.attention + "," + data.meditation + "\r");
				}
			}
		}
		UpdateDJ();
	}); 

	//start timer of clients
	socket.on('startTimer', function(data){
		Reset();
		common.timer.startTimer();
		common.log = new Log();
		common.analysis = new Analysis();
		if(common.loop != null){
			clearTimeout(common.loop);
		}
		loopAnalysis();
		for (key in common.clientAuth['worker']){
			var csocket = common.clientAuth['worker'][key]
				csocket.emit('startTimer');
		}
		UpdateDJ();
	}); 

	function loopAnalysis(){
		console.log("loop");
		var st = common.analysis.getSpeakTransition();
		var tst = common.analysis.getTotalSpeakTime();
		var ma = common.analysis.getMindwaveAverage();
		common.analysis.setLasttime();
		for (key in common.clientAuth['dj']){
			var csocket = common.clientAuth['dj'][key]
				csocket.emit('updateAnalysis', {data:common.clientStatus, speakTransition: st, totalSpeakTime: tst, mindwaveAverage: ma, time:common.analysis.lasttime});
		}
		common.loop = setTimeout(loopAnalysis, common.loopTime);
	}

	//feedback to feedback view
	socket.on('feedback', function(data){
		for (key in common.clientAuth['feedback']){
			var csocket = common.clientAuth['feedback'][key];
			csocket.emit('emitFeedback', {type:data.type, id:data.id , user:data.user});
		}
		if(common.log != null){
			common.log.addLog("FEEDBACK," + data.type + "," + data.id + "," + data.user + "\r");
		}
	}); 

	//disconnect
	socket.on('disconnect', function(){
		if(common.log != null){
			common.log.addLog("DISCONNECT" + "\r");
		}
	});

	function Reset(){
		for(var i = 0; i < 5; i++){
			common.clientStatus[i].metric = [0,0,0];
			common.clientStatus[i].speak=0;
			common.clientStatus[i].speakTime=[];
			common.clientStatus[i].mindwaveTime=[0];
			common.clientStatus[i].attention=[0];
			common.clientStatus[i].meditation=[0];
		}
	}

	function UpdateDJ(){
		//console.dir(common.clientStatus);
		//send client info to dj
		for (key in common.clientAuth['dj']){
			var csocket = common.clientAuth['dj'][key]
				csocket.emit('updateTable', {data:common.clientStatus});
		}
	}
});

function Log(){
	var date =new Date();
	this.makeDate = date;
	data = date + ",STARTLOG\r";
	console.log(data);
	fs.writeFile('log/' + date + '.csv', data , function (err) {
		if(err){console.log(err)};
	});
}

Log.prototype.addLog = function(data){
	var date =new Date();
	data = date + "," + data;
	console.log(data);
	fs.appendFile('log/' + this.makeDate + '.csv', data ,'utf8', function (err) {
		if(err){console.log(err)};
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

function Analysis(){
	this.lasttime = 0;
}

//get speak transition
Analysis.prototype.getSpeakTransition = function(){
	console.log("GETSPEAKTRANSITION");
	var to_client = -1;
	var speakTransition = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];

	//prepare speakstart time data set
	var ss = [[],[],[],[],[]];

	for(var ci = 0; ci < common.clientStatus.length; ci++){
		for(var st = 0; st < common.clientStatus[ci].speakTime.length; st++){
			if(common.clientStatus[ci].speakTime[st][0] > this.lasttime){ 
				ss[ci].push(common.clientStatus[ci].speakTime[st][0]); 
			}
		}
	}
	console.dir(ss);

	//choose first element of each clients speakstart time and get max
	var i = [0,0,0,0,0];	
	var v = new Array(5);	

	while(!(i[0] == ss[0].length && i[1] == ss[1].length && i[2] == ss[2].length && i[3] == ss[3].length && i[4] == ss[4].length)){
		var from_client = to_client;
		for(var x = 0; x < ss.length; x++){
			if(typeof ss[x][i[x]] === "undefined"){v[x] = Infinity}else{v[x] = ss[x][i[x]]}
		}
		var arr = [v[0],v[1],v[2],v[3],v[4]];
		//choose max
		to_client = arr.indexOf(Math.min.apply(null,arr));
		if(from_client != -1){
			speakTransition[from_client][to_client]++;
		}
		i[to_client]++;
	}
	console.dir(speakTransition);
	return speakTransition;
}

Analysis.prototype.getTotalSpeakTime = function(){
	console.log("GETTOTALSPEAKTIME");
	totalSpeakTime = [0,0,0,0,0];
	for(var ci = 0; ci < common.clientStatus.length; ci++){
		for(var st = 0; st < common.clientStatus[ci].speakTime.length; st++){
			if(common.clientStatus[ci].speakTime[st][0] > this.lasttime){ 
				totalSpeakTime[ci] += (common.clientStatus[ci].speakTime[st][1] - common.clientStatus[ci].speakTime[st][0]); 
			}
		}
	}
	console.dir(totalSpeakTime);
	return totalSpeakTime;
}

Analysis.prototype.getMindwaveAverage = function(){
	console.log("GETMINDWAVEAVERAGE");
	var mindwaveAverage = [[0,0],[0,0],[0,0],[0,0],[0,0]];

	for(var ci = 0; ci < common.clientStatus.length; ci++){
		var atotal = 0;
		var mtotal = 0;
		var n = 0;
		for(var st = 0; st < common.clientStatus[ci].mindwaveTime.length; st++){
			if(common.clientStatus[ci].mindwaveTime[st] > this.lasttime && st < common.clientStatus[ci].attention.length && st < common.clientStatus[ci].meditation.length){ 
				atotal += common.clientStatus[ci].attention[st];  
				mtotal += common.clientStatus[ci].meditation[st];  
				n++;
			}
		}
		if(n != 0){
			mindwaveAverage[ci][0] = Math.floor(atotal/n);
			mindwaveAverage[ci][1] = Math.floor(mtotal/n);
		}
	}
	console.dir(mindwaveAverage);
	return mindwaveAverage;
}

Analysis.prototype.setLasttime = function(){
	var arr = [];
	for(var ci = 0; ci < common.clientStatus.length; ci++){
		arr.push(common.clientStatus[ci].mindwaveTime[common.clientStatus[ci].mindwaveTime.length - 1]);
		if(common.clientStatus[ci].speakTime.length != 0){
			arr.push(common.clientStatus[ci].speakTime[common.clientStatus[ci].speakTime.length - 1][0]);
		}
	}
	var lt = Math.max.apply(null,arr);
	console.log(lt);
	this.lasttime = lt;
}
