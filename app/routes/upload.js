 var querystring = require("querystring");
 var fs = require("fs");
 var formidable = require("formidable");

 sdata = require('fs').readFileSync('./resources/app/data.txt').toString();

exports.upload = function(req, res){
	var sID = req.param('id');
	//上传头像
	function upload(response,request){
		  console.log("request handler 'upload' was called");
		  var form = new formidable.IncomingForm();
		  form.uploadDir = "./tmp"
		  	  
		  form.parse(request,function(error,fields,files){

		  	if(fs.existsSync('app/public/images/'+sID+'.png')){    //判断要删除的文件是否存在
		  		fs.unlinkSync('app/public/images/'+sID+'.png');   //删除文件
		  	}
		    fs.linkSync(files.upload.path,'app/public/images/'+sID+'.png');   //拷贝图片
		    fs.renameSync(files.upload.path,"resources/app/css/images/"+sID+".png");  //移动重命名图片
		      //response.writeHead(200,{"Content-Type":"text/html"});
		     // response.write("image:</br>");
		     // response.write("<image src='/show'/>");
		      //response.end();
 		 }); 
		}

	upload(res,req);
	//上传后展示的页面
  	//res.send("image:</br>");
  	res.render('index', { title: 'TEAM_APP', sid:sID,d:sdata });
};