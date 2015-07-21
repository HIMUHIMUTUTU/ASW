//category
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
