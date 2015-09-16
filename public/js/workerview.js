var javascriptNode;

var common = {
	socket: null, lstorage:localStorage, ctx:null,  client:{ id: null, type: "worker", name: "name" }
};

window.onload = function() {
	//emerge name input popup
	common.client.name = window.prompt("お名前を入力してください", common.user);
	common.ctx = document.getElementById('canvas').getContext('2d'); 
	var main = new MAIN();
	//var microphone = new Microphone();
};

function MAIN(){
	this.username = document.getElementById('username');
	this.metric1 = document.getElementById('metric1');
	this.metric2 = document.getElementById('metric2');
	this.metric3 = document.getElementById('metric3');
	this.metricValue1 = document.getElementById('metricValue1');
	this.metricValue2 = document.getElementById('metricValue2');
	this.metricValue3 = document.getElementById('metricValue3');
	this.username.innerHTML = common.client.name;
	this.timer = new Timer();
	this.sound = new Sound();

	var self = this; 


	common.socket = io.connect();
	console.log("CONNECTING NETWORK..");
	common.socket.on('connect', function(data) {
		common.socket.emit('auth', common.client);
	});

	//receive id after auth
	common.socket.on('setid', function(data) {
		console.log("CONNECTED");
		common.client.id = data;
		console.log("SETTEDCLIENTID:" + common.client.id);
	});

	//timer start
	common.socket.on('startTimer', function(data) {
		console.log("START TIMER");
		self.timer.startTimer();
	});

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
	}

	Timer.prototype.startTimer = function(){
		var date =new Date();
		var startTime = date.getTime();
		console.log("STARTTIME:" + startTime);
	}

	Timer.prototype.getTime = function(){
		var date =new Date();
		var currentTime = date.getTime();
		this.time = currentTime - this.startTime;
		return this.time;
	};


	/** 
	 * sound object
	 */
	function Sound(){
		audioCheck();
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
				common.ctx.fillStyle = "rgb(219, 36, 91)";
				speak.fire();
			}else{
				common.ctx.fillStyle = "rgb(0, 0, 0)";
			}

			//draw bar
			common.ctx.clearRect(0,0,500,5);
			common.ctx.fillRect(0,0,average,5);
		}


		function audioCheck(){
			try{
				window.AudioContext = window.AudioContext || window.webkitAudioContext;
				navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
			}catch(e){
				alert('ブラウザに音声またはマイク認識機能がありません。');
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
			this.sp = document.getElementById('sp');
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
						this.sp.innerHTML = "&nbsp"; 
						var t = self.timer.getTime();
						common.socket.emit('updateSpeak', {id:common.client.id, speak:0, time:t});
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
					this.sp.innerHTML = "<font color='red'>発話中</font>"; 
					var t = self.timer.getTime();
					common.socket.emit('updateSpeak', {id:common.client.id, speak:1, time:t});
				}
			}		
		}

	}
}


