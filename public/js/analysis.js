var common = {gdata: gdata};

window.onload = function() {
	var main = new MAIN();
};

function MAIN(){
	var self = this;
	TotalSpeakChart(common.gdata.total);
	SpeakNetwork(common.gdata.total,common.gdata.trans);

	function TotalSpeakChart(data){ 
		var cdata = [['総発話時間']] 
				cdata.push(["0", Math.floor(data[0] / 1000)]);
				cdata.push(["1", Math.floor(data[1] / 1000)]);
				cdata.push(["2", Math.floor(data[2] / 1000)]);
				cdata.push(["3", Math.floor(data[3] / 1000)]);
				cdata.push(["4", Math.floor(data[4] / 1000)]);
		console.dir(cdata);
		var chartdata = {
			"config": {
				"title": "",
				"subTitle": "",
				"type": "pie",
				"percentVal": "yes",
				"useVal": "yes",
				"pieDataIndex": 0,
				"colNameFont": "100 18px 'Arial'",
				"pieRingWidth": 80,
				"pieHoleRadius": 40,
					//		"textColor": "#888",
				"bg": "#fff",
				"textColor": "#696969",
				"useShadow" : "no"
			},
			"data":cdata 
		};
		ccchart.init('totalSpeakChart', chartdata);
	}

	function SpeakNetwork(total,data){ 
		// create an array with nodes
		var nodes = new vis.DataSet([
				{id: 0, shape:"dot", size:total[0]/5000, label:"0(" + Math.floor(total[0]/1000) + ")", x:0, y:0},
				{id: 1, shape:"dot", size:total[1]/5000, label:"1(" + Math.floor(total[1]/1000) + ")", x:200, y:0},
				{id: 2, shape:"dot", size:total[2]/5000, label:"2(" + Math.floor(total[2]/1000) + ")", x:0, y:200},
				{id: 3, shape:"dot", size:total[3]/5000, label:"3(" + Math.floor(total[3]/1000) + ")", x:200, y:200},
				{id: 4, shape:"dot", size:total[4]/5000, label:"4(" + Math.floor(total[4]/1000) + ")", x:100, y:300}
		]);

		// create an array with edges
		var edgedata = []
			for(var ci = 0; ci < 5; ci++){
				for(var toci = 0; toci < 5; toci++){
					if(data[ci][toci] != 0 && ci != toci){
						edgedata.push({from: ci, to: toci, label:data[ci][toci], value: data[ci][toci] , arrows:{to:{scaleFactor:0.2}}});
					}				
				}
			}
		console.log(edgedata);
		var edges = new vis.DataSet(edgedata);

		// create a network
		var container = document.getElementById('speakNetwork');

		// provide the data in the vis format
		var ne = {
			nodes: nodes,
			edges: edges
		};
		var options = {
			nodes:{
				//fixed: true,
				physics: false
			},
			layout:{
				hierarchical: false 
			},
			physics:{
				//stabilization: false
			},
			interaction:{
				dragNodes: false,
				zoomView: false,
				dragView: false
			}
		}
		// initialize your network!
		var network = new vis.Network(container, ne, options);
	}

}

