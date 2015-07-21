/*
 * get csv data and align, analyze it.
 */

var fs = require('fs');
exports.view = function(req, res){
	//load csv data.
	fs.readFile('./logfile/yamada/1.csv', 'utf8', function (err, text) {
		var daystart = new Date(2015, 2, 22, 0, 0, 0, 0); 
		var list = new Array();
		list = text.split("\n");

		//define app category
		var category = new Array();
		var ci = 0;

		//define log 
		var log = new Array();
		var i = 0;

		var lastdate = new Date();
		for(var il = 0; il < list.length; il++){
			if(list[il].slice(0,8).match(/^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/)) {
				//date
				var date = new Date(2015, 2, 22, list[il].slice(0,2), list[il].slice(3,5), list[il].slice(6,8));

				//app name
				if(list[il].slice(9,21) == "Window Title"){type = "app"}else{type = "move"};
				var appname = "";
				if(type == "app"){
					var titleinfo = new Array();
					titleinfo = list[il].slice(22).split(" - ");
					if(titleinfo.length > 1){
						appname = titleinfo[titleinfo.length - 1];
						if(category.length == 0){
							category[ci] = new Category(ci,appname);
							lastdate = date;
						}else{
							var cii = 0;
							for(var ci = 0; ci < category.length; ci++){
								if(appname == category[ci].appname){
									category[ci].usetime += (date.getTime() - lastdate.getTime());
									var cii = 1;
									lastdate = date;
								}
							}
							if(cii == 0){
								category[ci] = new Category(ci,appname);
							}
						}
					}
				}

				//log
				log[i] = {
					'date':date,
					'passtime':date.getTime() - daystart.getTime(),
					'type':type,
					'appname':appname
				}
				i++;
			}
		}	

		//activeness
		var activeness = new Array();
		for(var al = 0; al < (6*24); al++){
			activeness[al] = new Activeness(); 
			activeness[al].id = al;
			activeness[al].time = al*10*60*1000;
			for(var ll = 0; ll < log.length; ll++){
				if(al >= 1){
					if(log[ll].passtime > activeness[al - 1].time && log[ll].passtime < activeness[al].time){
						activeness[al].active++;
					}
				}
			}
		}
		if(err){
			console.log(err);
			return;
		};
		res.render('analysis', { title: 'Work Action Analysis', activeness: activeness, category: category});
	});
};

function Category(_i, _a){
	this.id = _i;
	this.appname = _a;
	this.usetime = 0;
}
function Activeness(){
	this.id;
	this.time;
	this.active = 0;

}
