var common = {totalId:0, clientAuth:{dj:{}, worker:{}}, clientStatus:[]};
/**
 * New node file
 */
//var routes = require('./routes');
//var referlog = require('./models/referlog');
//var handwrite_recognition = require('./models/handwrite_recognition');
var app = module.parent.exports;
var io = app.get('io');

//case of receive connection of client 
io.sockets.on('connection', function(socket) {

	//authentication and ID management
	socket.on('auth', function(data){
		common.clientAuth[data.type][socket.id] = socket;
		
		if(data.id == null && data.type == "worker"){
			common.clientStatus.push({id:common.totalId, name:data.name, metric:null});
			console.dir(common.clientAuth);
			console.dir(common.clientStatus);

			//send client id to client
			socket.emit('setid', common.totalId);

			common.totalId++;

		}

		//send client info to dj
		for (key in common.clientAuth['dj']){
			var csocket = common.clientAuth['dj'][key]
				csocket.emit('updateTable', common.clientStatus);
		}
	}); 

	socket.on('updateMetric', function(data){
		console.log(data);
		for(var i = 0; i < common.clientStatus.length; i++){
			if(common.clientStatus[i].id == data.id){
				common.clientStatus[i].metric = data.metric;
			}
		}
		console.log(common.clientStatus);

		for (key in common.clientAuth['dj']){
			var csocket = common.clientAuth['dj'][key]
				csocket.emit('updateTable', common.clientStatus);
		}
	}); 

	/**
	  socket.on('loadRequest', function(data){
	  referlog.selectScript(data.value, 1, function(script_data){
//send it to editor
for (key in client['editor']){
var csocket = client['editor'][key]
csocket.emit('loadedScript', { value: script_data });
}
});
});

socket.on('sentScript', function(data) {
console.log("SERVER:RECIVE SENT SCRIPT:");
console.dir(data.value);

referlog.insertScript(data.value, function(err, data){
if(err){
console.log(err);
}else{
console.log("SERVER:SAVE COMPLETE");
for (key in client['editor']){
var csocket = client['editor'][key]
csocket.emit('savedScriptId', { value: data });
}
}
});
});
	 **/

/** クライアントが切断したときの処理 **/
socket.on('disconnect', function(){
	console.log("disconnect");
});
});



