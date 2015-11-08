/*
 * 
 */

exports.view = function(req, res){
	var c = require('../setting/config.json');
	if(req.query.id){
		if(!(req.query.id.match(/[^0-9]+/))){
			res.render('feedbackview', {config: c.requirement, id:req.query.id});
		}else{
			res.render('caution');
		}
	}else{
		res.render('caution');
	}
};

