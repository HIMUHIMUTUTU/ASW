var common = {
	socket: null, lstorage: localStorage, client:{ id: null, type: "worker", name: "name" }
};

window.onload = function() {
	//emerge name input popup
	common.client.name = window.prompt("お名前を入力してください", common.user);
	var main = new MAIN();
};

function MAIN(){
	this.username = document.getElementById('username');
	this.metric = document.getElementById('metric');
	this.metricValue = document.getElementById('metricValue');
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
	this.metric.onchange = function(){
		self.metricValue.innerHTML = self.metric.value;
		common.socket.emit('updateMetric', {id:common.client.id, metric:self.metric.value});
	}
}
/**
  var categorychart = new Array();
  categorychart.push(["利用時間"]);	

  for(var ci = 0; ci < category.length; ci++){ 
  categorychart.push([category[ci].appname, category[ci].usetime/1000/60]);	
  }

  console.log(categorychart);
  var chartdata1 = {
  "config": {
  "title": "アプリ利用割合[min]",
  "subTitle": "",
  "type": "pie",
  "percentVal": "yes",
  "useVal": "yes",
  "pieDataIndex": 0,
  "colNameFont": "100 18px 'Arial'",
  "pieRingWidth": 80,
  "pieHoleRadius": 40,
  "bg": "#fff",
  "useShadow" : "no"
  },
  "data":categorychart 
  };

  ccchart.init('chart1', chartdata1);

//activeness
var active = [['id'],['キーボード打鍵数']]; 
for(var ai = 0; ai < activeness.length; ai++){ 
active[0].push(activeness[ai].id);
active[1].push(activeness[ai].active);
}
console.log(active);
var chartdata2 = {
"config": {
"title": "キーボード打鍵数[hit/5min]",
"type": "line",
"lineWidth": 4,
"colorSet": 
["red"],
"bg": "#fff",
"useShadow" : "no"
},
"data":active
};
ccchart.init('chart2', chartdata2)
 **/
