/*
 * 
 */

exports.view = function(req, res){
	var c = require('../setting/config.json');
	res.render('dj', {config: c.requirement});
};

