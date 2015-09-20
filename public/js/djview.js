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

}

MAIN.prototype.UpdateTable = function(data){
	console.log("UPDATETABLE");
	document.getElementById("sumtable").innerHTML = "";
	var t = document.createElement("table");
	for(var i=-1; i< data.length; i++){
		var tr = t.insertRow(-1);
		var tc = [];
		for(var tci = 0; tci < 8; tci++){
			tc[tci] = tr.insertCell(-1);
			if(i == -1){
				//table title
				var tcTitle = ["id", "お名前", common.config.usermetric[0], common.config.usermetric[1], common.config.usermetric[2], "発話", "発話期間", "総発話時間"];
				tc[tci].innerHTML = tcTitle[tci]; 
			}else{
				//table data 
				var tcData = [data[i].id, data[i].name,data[i].metric[0],data[i].metric[1],data[i].metric[2],"",data[i].speakTime,data[i].totalSpeakTime];
				tc[tci].innerHTML = tcData[tci]; 
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

