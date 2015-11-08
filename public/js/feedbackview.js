var common = {
	socket: null, lstorage:localStorage, ctx:null,  client:{ id: gid, type: "feedback", name: "feedback" }, config:commonConfig
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
		var ex = 0;
		for(di = 0; di < data.user.length; di++){
			if(gid == data.user[di]){
				ex = 1;
				break;
			}
		}
		if(ex == 1){
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

}


