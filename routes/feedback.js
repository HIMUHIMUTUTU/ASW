/*
 * 
 */

exports.view = function(req, res){
	var c = require('../setting/config.json');
	if(req.query.id){
		if(!(req.query.id.match(/[^0-9]+/))){
			res.render('feedback', {config: c.requirement, id:req.query.id});
		}else{
			res.render('caution', {message: "invalid url"});
		}
	}else{
		res.render('caution', {message: "invalid url"});
	}
};

