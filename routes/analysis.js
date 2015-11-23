/*
 * 
 */
var fs = require('fs');
exports.view = function(req, res){
	if(req.query.f && req.query.s && req.query.e){
		if(!(req.query.s.match(/[^0-9]+/)) && !(req.query.e.match(/[^0-9]+/)) && req.query.f.length < 64){
			var contents = fs.readFileSync('./log/' + req.query.f + '.csv', 'utf8')
				var contents = contents.split("\r");
			for(var ci = 0; ci < contents.length; ci++){
				contents[ci] = contents[ci].split(",");
			}
			//console.log(contents);
			var trans = Transition(contents,req.query.s,req.query.e);
			var total = Totalspeak(contents,req.query.s,req.query.e);
			res.render('analysis', {gdata:{trans:trans, total:total}});
		}else{
			res.render('caution' , {message: "invalid url"});
		}
	}else{
		res.render('caution', {message: "get変数としてf=ファイル名、s=開始時間、e=終了時間を入力してください。"});
	}
};

//get speak transition
function Transition(data,_s,_e){
	var to_client = -1;
	var speaktoWho = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
	var ss = [[],[],[],[],[]];
	for(var ci = 0; ci < 5; ci++){
		for(var st = 0; st < data.length; st++){
			if(data[st][2] == ci && data[st][1] == "SPEAK" && Number(data[st][3]) > _s && Number(data[st][3]) < _e ){ //select by user id
				ss[ci].push(Number(data[st][3])); //start time
			}
		}
	}
	console.dir(ss);

	//choose first element of each clients speakstart time and get max
	var i = [0,0,0,0,0];	
	var v = new Array(5);	
	while(!(i[0] == ss[0].length && i[1] == ss[1].length && i[2] == ss[2].length && i[3] == ss[3].length && i[4] == ss[4].length)){
		var from_client = to_client;
		for(var x = 0; x < ss.length; x++){
			if(typeof ss[x][i[x]] === "undefined"){v[x] = Infinity}else{v[x] = ss[x][i[x]]}
		}
		var arr = [v[0],v[1],v[2],v[3],v[4]];
		console.log(arr);
		//choose max
		to_client = arr.indexOf(Math.min.apply(null,arr));
		if(from_client != -1){
			speaktoWho[from_client][to_client]++;
		}
		i[to_client]++;
	}
	console.dir(speaktoWho);
	return speaktoWho;
}

function Totalspeak(data, _s, _e){
	console.log(_s);
	console.log(_e);
	totalSpeakTime = [0,0,0,0,0];
	for(var st = 0; st < data.length; st++){
		if(data[st][1] == "SPEAK"){
			if(Number(data[st][4]) > _s && Number(data[st][3]) < _e){
				if(Number(data[st][3]) < _s){
					var stime = Number(data[st][4]) - _s;
				}else if(Number(data[st][4]) > _e){
					var stime = _e - Number(data[st][3]);
				}else{
					var stime = Number(data[st][4]) - Number(data[st][3]);
				}
				console.log(st + ":" + data[st][3] + "," + data[st][4] + ":" + data[st][2] + ":" + stime);
				totalSpeakTime[data[st][2]] += stime;
			}
		}
	}
	console.dir(totalSpeakTime);
	return totalSpeakTime;
}
