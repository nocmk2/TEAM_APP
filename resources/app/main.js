var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var ipc = require('ipc');
//var formidable = require("formidable");    //用来处理文件上传的module
//var server = require("server");   //http服务文件,在node_modules下，自己写的
//var router = require("router");   //route文件,在node_modules下
//var requestHandlers = require("requestHandlers");   //处理图片上传请求的自定义模块
var web = require('../../app/app'); //启动web服务


//var handler = {};

//handler['/'] = requestHandlers.start;
//handler['/start'] = requestHandlers.start;
//handler['/upload'] = requestHandlers.upload;
//handler['/show'] = requestHandlers.show;


//启动http服务器
//server.serverStart(router.route,handler);



// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

//异步通信
ipc.on('asynchronous-message', function(event, arg) {
  console.log(arg);  // prints "ping"
  event.sender.send('asynchronous-reply', 'pong');
});

//同步通信
ipc.on('synchronous-message', function(event, arg) {
  console.log(arg);  // prints "ping"
  var sdata="";
if(arg=="readthedatafile"){
  sdata = require('fs').readFileSync('./resources/app/data.txt').toString();
  //console.log(sdata);
}else if(arg=="readtheteamfile"){
  sdata = require('fs').readFileSync('./resources/app/team.txt').toString();
  //console.log(sdata);
}else if(arg=="readtheprofile"){
  sdata = require('fs').readFileSync('./resources/app/processing.txt').toString();
}
  event.returnValue = sdata;

});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1024, height: 1024});

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');


  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

