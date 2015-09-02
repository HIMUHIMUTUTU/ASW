var common = {
	socket: null, lstorage: localStorage, client:{ id: null, type: "dj", name: "djview" }
};

window.onload = function() {
	var main = new MAIN();
};

function MAIN(){

	common.socket = io.connect();
	console.log("CONNECTING NETWORK..");
	common.socket.on('connect', function(data) {
		common.socket.emit('auth', common.client);
		console.log("CONNECTED");
	});

	common.socket.on('updateTable', function(data) {
		console.log("UPDATETABLE");
		var t = document.createElement("table");

		for(var i=-1; i< data.length; i++){
			var tr = t.insertRow(-1);
			var tc0 = tr.insertCell(-1);
			var tc1 = tr.insertCell(-1);
			var tc2 = tr.insertCell(-1);
			var tc3 = tr.insertCell(-1);
			var tc4 = tr.insertCell(-1);
			if(i == -1){
				tc0.innerHTML = "id" 
					tc1.innerHTML = "お名前" 
					tc2.innerHTML = "測定指標1" 
					tc3.innerHTML = "測定指標2" 
					tc4.innerHTML = "測定指標3" 
			}else{
				tc0.innerHTML = data[i].id;
				tc1.innerHTML = data[i].name;
				tc2.innerHTML = data[i].metric[0];
				tc3.innerHTML = data[i].metric[1];
				tc4.innerHTML = data[i].metric[2];
			}
		}

		document.getElementById("sumtable").innerHTML = "";
		document.getElementById("sumtable").appendChild(t);
	});

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
