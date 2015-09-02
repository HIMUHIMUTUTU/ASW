var javascriptNode;

var common = {
	socket: null, lstorage:localStorage, ctx:null,  client:{ id: null, type: "worker", name: "name" }
};

window.onload = function() {
	//emerge name input popup
	common.client.name = window.prompt("お名前を入力してください", common.user);
	common.ctx = document.getElementById('canvas').getContext('2d'); 
	var main = new MAIN();
	var sound = new Sound();
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

	//update metric
	this.metric1.onchange = function(){self.SendMetric();} 
	this.metric2.onchange = function(){self.SendMetric();} 
	this.metric3.onchange = function(){self.SendMetric();} 
}

MAIN.prototype.SendMetric = function(){
	console.log("!");
	this.metricValue1.innerHTML = this.metric1.value;
	this.metricValue2.innerHTML = this.metric2.value;
	this.metricValue3.innerHTML = this.metric3.value;
	common.socket.emit('updateMetric', {id:common.client.id, metric:[this.metric1.value,this.metric2.value,this.metric3.value]});
}

function Sound(){
	if(!window.AudioContext){
		if(!window.webkitAudioContext){
			alert('ブラウザに音声認識機能がありません。');
		}
		window.AudioContext = window.webkitAudioContext;
	}

	if(!navigator.getUserMedia){
		if(!navigator.webkitGetUserMedia){
			alert('ブラウザにマイク認識機能がありません。');
		}
		navigator.getUserMedia = navigator.webkitGetUserMedia;
	}

	var speak = new Speak()
	var context = new AudioContext();
	var analyser; 

	setupAudioNodes();
	//loadSound("/audio/wagner-short.ogg");

	function setupAudioNodes(){

		javascriptNode = context.createScriptProcessor(2048,1,1);
		javascriptNode.connect(context.destination);

		analyser = context.createAnalyser();
		analyser.smoothingTimeConstant = 0.3;
		analyser.fftSize = 1024;

		navigator.getUserMedia({audio: true,video: false}, function(stream) {
			var microphone = context.createMediaStreamSource(stream);
			var filter = context.createBiquadFilter();

			/**
			  microphone.connect(analyser);
			  analyser.connect(javascriptNode);
			  microphone.connect(context.destination);
			 **/

			microphone.connect(filter);
			filter.connect(analyser)
				analyser.connect(javascriptNode);
			microphone.connect(context.destination);

		}, function(e){console.log(e)});
	}

	function loadSound(url) {
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		// When loaded decode the data
		request.onload = function() {

			// decode the data
			context.decodeAudioData(request.response, function(buffer) {
				// when the audio is decoded play the sound
				playSound(buffer);
			}, onError);
		}
		request.send();
	}

	function playSound(buffer) {
		sourceNode.buffer = buffer;
		sourceNode.start(0);
	}

	// log if an error occurs
	function onError(e) {
		console.log(e);
	}

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

	function getAverageVolume(array){
		var values = 0;

		for(var i = 0; i < array.length; i++){
			values += array[i];
		}
		var average = values / array.length;
		average = average * 10;
		return average;
	}
}

function Speak(){
	this.sp = document.getElementById('sp');
	this.starttime;
	this.endtime;
	this.status_flag = 0;
	this.morat = 2;
	this.countdown();
}

Speak.prototype.countdown = function(){
	console.log(this.status_flag);
	this.morat = this.morat -1;	
	if(this.morat == 0){
		this.status_flag = 0;
		this.sp.innerHTML = "&nbsp"; 
		this.morat = 2;
	}
	setTimeout(function(e){e.countdown();},1000,this);
}

Speak.prototype.fire = function(){
	if(this.status_flag == 1){
		this.morat = 2;
	}
	if(this.status_flag == 0){
		this.status_flag = 1;
		this.sp.innerHTML = "<font color='red'>発話中</font>"; 
	}
}
