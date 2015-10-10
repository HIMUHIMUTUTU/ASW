var javascriptNode;

var common = {
	socket: null, lstorage:localStorage, ctx:{c1:null, c2:null},  client:{ id: gid, type: "worker", name: "name" }
};

window.onload = function() {
	//emerge name input popup
	common.ctx.c1 = document.getElementById('canvas1').getContext('2d'); 
	common.ctx.c2 = document.getElementById('canvas2').getContext('2d'); 
	var main = new MAIN();
	//var microphone = new Microphone();
};

function MAIN(){
	this.username = document.getElementById('username');
	this.nameChange = document.getElementById('nameChange');
	this.time = document.getElementById("time");
	this.metric1 = document.getElementById('metric1');
	this.metric2 = document.getElementById('metric2');
	this.metric3 = document.getElementById('metric3');
	this.metricValue1 = document.getElementById('metricValue1');
	this.metricValue2 = document.getElementById('metricValue2');
	this.metricValue3 = document.getElementById('metricValue3');
	this.timer = new Timer();
	this.sound = new Sound();
	this.mw = new Mindwave();
	this.lastTime;

	var self = this; 
	loopShowTimer();


	common.socket = io.connect();
	console.log("CONNECTING NETWORK..");
	common.socket.on('connect', function(data) {
		common.socket.emit('auth', common.client);
	});

	//receive id after auth
	common.socket.on('setdata', function(data) {
		console.log("RECEIVEDATA");
		var date =new Date();
		self.timer.startTime = date.getTime() - data;
		self.timer.status_flag = 1;
	});

	//timer start
	common.socket.on('startTimer', function(data) {
		console.log("START TIMER");
		self.timer.startTimer();
		self.lastTime = self.timer.getTime();
	});

	//chnagename
	this.nameChange.onclick = function(){self.NameChange();} 
	this.NameChange = function(){
		common.client.name = window.prompt("お名前を入力してください", common.client.name);
		this.username.innerHTML = common.client.name; 
		var t = self.timer.getTime();
		common.socket.emit('updateName', {id:common.client.id, name:common.client.name, time:t});
	}
	//update metric
	this.metric1.onchange = function(){self.SendMetric();} 
	this.metric2.onchange = function(){self.SendMetric();} 
	this.metric3.onchange = function(){self.SendMetric();} 
	this.SendMetric = function(){
		console.log("UPDATE METRIC");
		this.metricValue1.innerHTML = this.metric1.value;
		this.metricValue2.innerHTML = this.metric2.value;
		this.metricValue3.innerHTML = this.metric3.value;
		var t = self.timer.getTime();
		common.socket.emit('updateMetric', {id:common.client.id, metric:[this.metric1.value,this.metric2.value,this.metric3.value], time:t});
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

	/** 
	 * sound object
	 */
	function Sound(){
		var ac = audioCheck();
		if(ac){
			var speak = new Speak();
			speak.countdown();
			var context = new AudioContext();
			var analyser; 
			//javascriptNode as global valuable
			setupAudioNodes();

			javascriptNode.onaudioprocess = function(){
				var array = new Uint8Array(analyser.frequencyBinCount);
				analyser.getByteFrequencyData(array);
				var average = getAverageVolume(array);
				if(average < 10){
					average = 10;
				}

				if(average > 100){
					common.ctx.c1.fillStyle = "rgb(219, 36, 91)";
					var sp = "●"
						speak.fire();
				}else{
					common.ctx.c1.fillStyle = "rgb(0, 0, 0)";
					var sp = ""
				}

				//draw bar
				common.ctx.c1.clearRect(0,0,700,30);
				common.ctx.c1.fillText("SPEAK:" + sp , 0 , 10);  
				common.ctx.c1.fillRect(100,5,average,5);
			}


			function audioCheck(){
				window.AudioContext = window.AudioContext || window.webkitAudioContext;
				navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
				if(typeof window.AudioContext !== 'undefined' && typeof navigator.getUserMedia !== 'undefined'){
					return true;
				}else{
					alert('ブラウザに音声またはマイク認識機能がありません。');
					return false;
				}
			}

			function setupAudioNodes(){

				javascriptNode = context.createScriptProcessor(2048,1,1);
				javascriptNode.connect(context.destination);

				analyser = context.createAnalyser();
				analyser.smoothingTimeConstant = 0.3;
				analyser.fftSize = 1024;

				navigator.getUserMedia({audio: true,video: false}, function(stream) {
					var microphone = context.createMediaStreamSource(stream);
					var filter = context.createBiquadFilter();
					// microphone.connect(analyser);
					//  analyser.connect(javascriptNode);
					//  microphone.connect(context.destination);
					microphone.connect(filter);
					filter.connect(analyser)
						analyser.connect(javascriptNode);
					microphone.connect(context.destination);

				}, function(e){console.log(e)});
			}

			function getAverageVolume(array){
				var values = 0;

				for(var i = 0; i < array.length; i++){
					values += array[i];
				}
				var average = values / array.length;
				average = average * 10;
				return average;
			}

			/**
			 * speak object
			 */
			function Speak(){
				this.starttime;
				this.endtime;
				this.status_flag = 0;
				this.morat = 2;

				//countdown method
				this.countdown = function(){
					console.log(this.status_flag);
					if(this.status_flag == 1){
						this.morat = this.morat -1;	
						if(this.morat == 0){
							var t = self.timer.getTime();
							if(self.timer.status_flag != 0){
								common.socket.emit('updateSpeak', {id:common.client.id, speak:0, time:t});
							}
							this.status_flag = 0;
						}
					}
					setTimeout(function(e){e.countdown();},1000,this);
				}
				//fire method
				this.fire = function(){
					this.morat = 2;
					if(this.status_flag == 0){
						this.status_flag = 1;
						var t = self.timer.getTime();
						if(self.timer.status_flag != 0){
							common.socket.emit('updateSpeak', {id:common.client.id, speak:1, time:t});
						}
					}
				}		
			}

		}
	}

	function Mindwave(){
		var ws = new WebSocket('ws://127.0.0.1:8080');
		var alist = [];
		var mlist = [];

		ws.onopen = function(){
			console.log("WEBSOCKETCONNECTED");
			self.lastTime = self.timer.getTime();
		}
		ws.onmessage = function(evt){
			if(evt.data == "You are connected to Mindwave Mobile"){console.log("MINDWAVECONNECTED")}else{
				var data = JSON.parse(evt.data);
				// handle "eSense" data
				if(data.eSense){
					attention = data.eSense.attention;
					meditation = data.eSense.meditation;
					alist.push(attention);
					mlist.push(meditation);

					//draw bar
					common.ctx.c2.clearRect(0,0,700,70);
					common.ctx.c2.fillStyle = "#FF8C00";
					common.ctx.c2.fillText("ATTENTION:" + attention , 0 , 10);  
					common.ctx.c2.fillRect(100,5,attention * 3,5);
					common.ctx.c2.fillStyle = "#1E90FF";
					common.ctx.c2.fillText("MEDITATION:" + meditation , 0 , 35);  
					common.ctx.c2.fillRect(100,30,meditation * 3,5);

					var t = self.timer.getTime();
					if(t - self.lastTime > 10 * 1000){
						//get average of 10sec
						var totala = 0;
						for(var ai = 0; ai < alist.length; ai++){
							totala += alist[ai];
						}
						var averagea = Math.floor(totala/alist.length);
						alist = [];
						var totalm = 0;
						for(var mi = 0; mi < mlist.length; mi++){
							totalm += mlist[mi];
						}
						var averagem = Math.floor(totalm/mlist.length);
						mlist = [];
						common.socket.emit('updateMindwave', {id:common.client.id, attention:averagea, meditation:averagem, time:t});
						console.log(t);
						self.lastTime = t;
					}

				}
			}
		};
	}

}


