var common = {
	socket: null, lstorage: localStorage, client:{ id: null, type: "dj", name: "djview"}, config:commonConfig 
};

window.onload = function() {
	var main = new MAIN();
};

function MAIN(){
	//get html object
	this.reset = document.getElementById("reset");
	this.time = document.getElementById("time");
	this.startTimer = document.getElementById("startTimer");
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
		console.log("CONNECTED");
	});

	common.socket.on('updateTable', function(data) {
		if(data != null){
			self.UpdateTable(data);
			self.sp.display(data);
			TotalSpeakChart(data);
		}
	});

	this.reset.onclick = function(){self.Reset();} 
	this.startTimer.onclick = function(){self.StartTimer();} 
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
	}

	SpeakPanel.prototype.reset = function(){
		this.ctx.clearRect(0, 0, this.canvas.width,this.canvas.height);
		this.ctx.strokeStyle='#696969';
		this.ctx.strokeRect(0, 0, this.name_x,this.canvas.height);
		var gw = (this.canvas.width - this.name_x)/3 ;
		for(var gi = 0; gi < 3; gi++){
			this.ctx.strokeRect(this.name_x + gw * gi, 0, gw, this.canvas.height);
		}
	}

	SpeakPanel.prototype.display = function(data){
		this.reset();
		var bw = 10;
		for(var di = 0; di < data.length; di++){
			this.ctx.fillStyle = "rgb(0, 0, 0)";
			this.ctx.fillText(data[di].name , 7 , di * 28 + 21);  
			console.log(data[di].speakTime.length);
			for(var si = 0; si < data[di].speakTime.length; si++){
				this.ctx.fillStyle = "rgb(219, 36, 91)";
				this.ctx.fillRect(data[di].speakTime[si][0]/1000/2 + this.name_x, di * 28 + 10 ,(data[di].speakTime[si][1] - data[di].speakTime[si][0])/1000/2 , bw);
			}
		}

	}

	function TotalSpeakChart(data){ 
		var cdata = [['総発話時間']] 
			for(var di = 0; di < data.length; di++){
				cdata.push([data[di].name, data[di].totalSpeakTime]);
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
	document.getElementById("sumtable").innerHTML = "";
	var t = document.createElement("table");
	for(var i=-1; i< data.length; i++){
		var tr = t.insertRow(-1);
		var tc = [];
		for(var tci = 0; tci < 7; tci++){
			tc[tci] = tr.insertCell(-1);
			if(i == -1){
				//table title
				var tcTitle = ["id", "お名前", common.config.usermetric[0], common.config.usermetric[1], common.config.usermetric[2], "発話", "総発話時間"];
				tc[tci].innerHTML = tcTitle[tci]; 
			}else{
				//table data 
				var s = "";
				if(data[i].speak == 1){
					var s = "<font color='red'>●</font>"
				}
				var tcData = [data[i].id, data[i].name,data[i].metric[0],data[i].metric[1],data[i].metric[2],s,data[i].totalSpeakTime];
				tc[tci].innerHTML = tcData[tci]; 
			}
			if(i != -1){
				console.log(data[i].speakTime);
			}
		}

		document.getElementById("sumtable").appendChild(t);
	}
}

MAIN.prototype.Reset = function(){
	console.log("RESETTABLE");
	common.socket.emit('reset');
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

