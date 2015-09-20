var common = {
	socket: null, lstorage:localStorage, ctx:null,  client:{ id: null, type: "feedback", name: "feedback" }, config:commonConfig
};

window.onload = function() {
	var main = new MAIN();
};

function MAIN(){
	this.imagee = document.getElementById("imagee");
	this.messagee = document.getElementById("messagee");
	this.messageLevele = document.getElementById("messageLevele");
	this.audio = [];
	for(var ai = 0; ai < common.config.feedback.sound.length; ai++){
		this.audio[ai] = new Audio();
		this.audio[ai].src = "/audio/feedback/" + common.config.feedback.sound[ai].file;
	}

	var self = this; 

	common.socket = io.connect();
	console.log("CONNECTING NETWORK..");
	common.socket.on('connect', function(data) {
		common.socket.emit('auth', common.client);
	});

	common.socket.on('emitFeedback', function(data) {
		switch(data.type){
			case "sound":
				emitSound(data.id);
				break;
			case "message":
				emitMessage(data.id);
				break;
			case "messageLevel":
				emitMessageLevel(data.id);
				break;
			case "image":
				emitImage(data.id);
				break;
		}
	});

	function emitSound(i){
		self.audio[i].play();
	}

	function emitMessage(i){
		self.messagee.innerHTML = common.config.feedback.message[i].message; 
	}

	function emitMessageLevel(i){
		self.messageLevele.innerHTML = common.config.feedback.messageLevel[i].message; 
	}

	function emitImage(i){
		document.body.style.backgroundImage = "url(/img/feedback/" + common.config.feedback.image[i].file + ")";
	}


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


