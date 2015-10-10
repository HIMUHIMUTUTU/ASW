var common = {
	socket: null, lstorage: localStorage, client:{ id: null, type: "dj", name: "djview"}, config:commonConfig 
};

window.onload = function() {
	var main = new MAIN();
};

function MAIN(){
	//get html object
	//this.reset = document.getElementById("reset");
	this.time = document.getElementById("time");
	this.startTimer = document.getElementById("startTimer");
	this.sumtabletd = [];
	for(var tri=0; tri < 5; tri++){
		this.sumtabletd[tri] = [];
		for(var tdi=0; tdi < 9; tdi++){
			this.sumtabletd[tri][tdi] = document.getElementById("td" + tri + tdi);
		}
	}
	this.p1 = document.getElementById("p1");
	this.p2 = document.getElementById("p2");
	this.p3 = document.getElementById("p3");
	this.soundf = [];
	for(var si=0; si < common.config.feedback.sound.length; si++){
		this.soundf[si] = document.getElementById("soundf" + si);
	}
	this.messagef = [];
	for(var mi=0; mi < common.config.feedback.message.length; mi++){
		this.messagef[mi] = document.getElementById("messagef" + mi);
	}
	this.messageLevelf = [];
	for(var mli=0; mli < common.config.feedback.messageLevel.length; mli++){
		this.messageLevelf[mli] = document.getElementById("messageLevelf" + mli);
	}
	this.imagef = [];
	for(var ii=0; ii < common.config.feedback.image.length; ii++){
		this.imagef[ii] = document.getElementById("imagef" + ii);
	}
	this.timer = new Timer(); 
	this.sp = new SpeakPanel(); 

	var self = this;
	loopShowTimer();

	common.socket = io.connect();
	console.log("CONNECTING NETWORK..");

	common.socket.on('connect', function(data) {
		common.socket.emit('auth', common.client);
	});

	common.socket.on('setdata', function(data) {
		console.log("RECEIVEDATA");
		var date =new Date();
		self.timer.startTime = date.getTime() - data;
		self.timer.status_flag = 1;
	});

	common.socket.on('updateTable', function(data) {
		if(data != null){
			self.UpdateTable(data);
			self.sp.display(data);
			TotalSpeakChart(data);
		}
	});

	//this.reset.onclick = function(){self.Reset();} 
	this.startTimer.onclick = function(){self.StartTimer();} 
	this.p1.onclick = function(){self.sp.page = 0;} 
	this.p2.onclick = function(){self.sp.page = 1;} 
	this.p3.onclick = function(){self.sp.page = 2;} 
	for(var si = 0; si < this.soundf.length; si++){ 
		(function(_si){ self.soundf[_si].onclick = function(){self.Feedback("sound",_si);} }(si));
	}
	for(var mi = 0; mi < this.messagef.length; mi++){ 
		(function(_mi){ self.messagef[_mi].onclick = function(){self.Feedback("message",_mi);} }(mi));
	}
	for(var mli = 0; mli < this.messageLevelf.length; mli++){ 
		(function(_mli){ self.messageLevelf[_mli].onclick = function(){self.Feedback("messageLevel",_mli);} }(mli));
	}
	for(var ii = 0; ii < this.imagef.length; ii++){ 
		(function(_ii){ self.imagef[_ii].onclick = function(){self.Feedback("image",_ii);} }(ii));
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

	function loopShowTimer(){
		if(self.timer.status_flag == 1){
			var t = self.timer.getTime();
			t = Math.floor(t / 1000); //sec
			var h =  Math.floor(t / 3600);
			if(h < 10){h = "0" + h;}
			var m =  Math.floor((t % 3600) / 60);
			if(m < 10){m = "0" + m;}
			var s =  t % 60;
			if(s < 10){s = "0" + s;}
			this.time.innerHTML = h + ":" + m + ":" + s	
		}
		setTimeout(loopShowTimer,500);
	}

	function SpeakPanel(){
		this.canvas = document.getElementById('speakPanel');
		this.ctx = this.canvas.getContext('2d');
		this.ctx.font = "14px Arial";
		this.name_x = 100;
		this.page = 0;
	}

	SpeakPanel.prototype.reset = function(){
		this.ctx.clearRect(0, 0, this.canvas.width,this.canvas.height);
		this.ctx.strokeStyle='#696969';
		this.ctx.strokeRect(0, 0, this.name_x - 1,this.canvas.height);
		var gw = (this.canvas.width - this.name_x)/2 ;
		for(var gi = 0; gi < 2; gi++){
			this.ctx.strokeRect(this.name_x - 1 + gw * gi, 0, gw + 0.5, this.canvas.height);
		}
	}

	SpeakPanel.prototype.display = function(data){
		console.log(data);
		this.reset();
		var uw = 30;
		var bw = 3;
		for(var di = 0; di < data.length; di++){

			//id and name
			this.ctx.fillStyle = "rgb(0, 0, 0)";
			this.ctx.fillText(data[di].id + ":" +data[di].name , 7 , data[di].id * uw + 21);  
			console.log(data[di].speakTime.length);

			//speak
			for(var si = 0; si < data[di].speakTime.length; si++){
				if(data[di].speakTime[si][0] > this.page * 10 * 60 * 1000 && data[di].speakTime[si][0] < (this.page + 1) * 10 * 60 * 1000){ 
					this.ctx.fillStyle = "#F08080";
					this.ctx.fillRect(data[di].speakTime[si][0] * 1.5 / 1000 + this.name_x - this.page * 900, data[di].id * uw + 10 ,(data[di].speakTime[si][1] - data[di].speakTime[si][0]) * 1.5 /1000 , bw * 2);
				}
			}

			//mindwave
			for(var mi = 1; mi < data[di].mindwaveTime.length; mi++){
				if(data[di].mindwaveTime.length != 1 && data[di].mindwaveTime[mi] > this.page * 10 * 60 * 1000 && data[di].mindwaveTime[mi] < (this.page + 1) * 10 * 60 * 1000){
					this.ctx.fillStyle = MindwaveColor(data[di].attention[mi],"attention"); 
					this.ctx.fillRect(data[di].mindwaveTime[mi - 1] * 1.5 / 1000 + this.name_x - this.page * 900, data[di].id * uw + 10 + bw * 2 + 3 ,(data[di].mindwaveTime[mi] - data[di].mindwaveTime[mi - 1]) * 1.5 /1000 , bw);
					this.ctx.fillStyle = MindwaveColor(data[di].meditation[mi],"meditation"); 
					this.ctx.fillRect(data[di].mindwaveTime[mi - 1] * 1.5 / 1000 + this.name_x - this.page * 900, data[di].id * uw + 10 + bw * 3  + 6 ,(data[di].mindwaveTime[mi] - data[di].mindwaveTime[mi - 1]) * 1.5 /1000 , bw);
				}
			}
		}
	}

	function MindwaveColor(strength, type){
		var color;
		if(type == "attention"){
			if(strength >= 75){ color = "#FE9A2E";}
			else if(strength >= 50){ color = "#F7BE81";}
			else if(strength >= 25){ color = "#F6E3CE";}
			else{ color = "#FFFFFF";}
		}else if(type == "meditation"){
			if(strength >= 75){ color = "#2ECCFA";}
			else if(strength >= 50){ color = "#81DAF5";}
			else if(strength >= 25){ color = "#CEECF5";}
			else{ color = "#FFFFFF";}
		}
		return color;
	}

	function TotalSpeakChart(data){ 
		var cdata = [['総発話時間']] 
			for(var di = 0; di < data.length; di++){
				cdata.push([data[di].name, Math.floor(data[di].totalSpeakTime / 1000)]);
			}
		console.dir(cdata);
		var chartdata = {
			"config": {
				"title": "",
				"subTitle": "",
				"type": "pie",
				"percentVal": "yes",
				"useVal": "yes",
				"pieDataIndex": 0,
				"colNameFont": "100 18px 'Arial'",
				"pieRingWidth": 80,
				"pieHoleRadius": 40,
					//		"textColor": "#888",
				"bg": "#fff",
				"textColor": "#696969",
				"useShadow" : "no"
			},
			"data":cdata 
		};
		ccchart.init('totalSpeakChart', chartdata);
	}

}

MAIN.prototype.UpdateTable = function(data){
	console.log("UPDATETABLE");

	for(var i=0; i< data.length; i++){
		var s = "";
		if(data[i].speak == 1){
			var s = "<font color='red'>●</font>"
		}
		var tdData = [data[i].id, data[i].name,data[i].metric[0],data[i].metric[1],data[i].metric[2],s,Math.floor(data[i].totalSpeakTime / 1000), data[i].attention[data[i].attention.length - 1], data[i].meditation[data[i].meditation.length - 1]];

		for(var tri=0; tri<this.sumtabletd.length; tri++){
			if(tri == data[i].id){
				for(var tdi=0; tdi<this.sumtabletd[tri].length; tdi++){
					this.sumtabletd[tri][tdi].innerHTML = tdData[tdi];
				}
			}
		}
	}

}

MAIN.prototype.StartTimer = function(){
	console.log("STARTTIMER");
	this.timer.startTimer();
	common.socket.emit('startTimer');
}

MAIN.prototype.Feedback = function(type,id){
	console.log("FEEDBACK:" + type + id);
	common.socket.emit('feedback', {type: type, id: id});
}
