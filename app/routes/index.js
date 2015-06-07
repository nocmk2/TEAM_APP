sdata = require('fs').readFileSync('./resources/app/data.txt').toString();

/*
 * GET home page.
 */
exports.index = function(req, res){
  res.render('index', { title: 'TEAM_APP' , sid:'S1',d:sdata});
};