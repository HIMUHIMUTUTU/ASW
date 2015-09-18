var common = {
	socket: null, lstorage: localStorage, client:{ id: null, type: "dj", name: "djview" }
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
	for(var si=0; si < 3; si++){
		this.soundf[si] = document.getElementById("soundf" + si);
	}
	this.messagef = [];
	for(var mi=0; mi < 3; mi++){
		this.messagef[mi] = document.getElementById("messagef" + mi);
	}
	this.messageLevelf = [];
	for(var mli=0; mli < 5; mli++){
		this.messageLevelf[mli] = document.getElementById("messageLevelf" + mli);
	}
	this.imagef = [];
	for(var ii=0; ii < 3; ii++){
		this.imagef[ii] = document.getElementById("imagef" + ii);
	}

	var self = this;

	common.socket = io.connect();
	console.log("CONNECTING NETWORK..");
	common.socket.on('connect', function(data) {
		common.socket.emit('auth', common.client);
		console.log("CONNECTED");
	});

	common.socket.on('updateTable', function(data) {
		if(data != null){ 
			console.log("UPDATETABLE");
			var t = document.createElement("table");
			for(var i=-1; i< data.length; i++){
				var tr = t.insertRow(-1);
				var tc = [];
				for(var tci = 0; tci < 8; tci++){
					tc[tci] = tr.insertCell(-1);
					if(i == -1){
						//table title
						var tcTitle = ["id", "お名前", "測定指標1", "測定指標2", "測定指標3", "発話", "発話機関", "総発話時間"];
						tc[tci].innerHTML = tcTitle[tci]; 
					}else{
						//table data 
						var tcData = [data[i].id, data[i].name,data[i].metric[0],data[i].metric[1],data[i].metric[2],"",data[i].speakTime,data[i].totalSpeakTime];
						tc[tci].innerHTML = tcData[tci]; 
					}
				}

				document.getElementById("sumtable").innerHTML = "";
				document.getElementById("sumtable").appendChild(t);
			}

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
}

MAIN.prototype.Reset = function(){
	console.log("RESETTABLE");
	common.socket.emit('reset');
}

MAIN.prototype.StartTimer = function(){
	console.log("STARTTIMER");
	common.socket.emit('startTimer');
}

MAIN.prototype.Feedback = function(type,id){
	console.log("FEEDBACK:" + type + id);
	common.socket.emit('feedback', {type: type, id: id});
}

