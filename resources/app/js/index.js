'use strict';

function addCSS(cssText){
    var style = document.createElement('style'),  //创建一个style元素
        head = document.head || document.getElementsByTagName('head')[0]; //获取head元素
    style.type = 'text/css'; //这里必须显示设置style元素的type属性为text/css，否则在ie中不起作用
    if(style.styleSheet){ //IE
        var func = function(){
            try{ //防止IE中stylesheet数量超过限制而发生错误
                style.styleSheet.cssText = cssText;
            }catch(e){

            }
        }
        //如果当前styleSheet还不能用，则放到异步中则行
        if(style.styleSheet.disabled){
            setTimeout(func,10);
        }else{
            func();
        }
    }else{ //w3c
        //w3c浏览器中只要创建文本节点插入到style元素中就行了
        var textNode = document.createTextNode(cssText);
        style.appendChild(textNode);
    }
    head.appendChild(style); //把创建的style元素插入到head中    
}



function parseData(d) {
  var keys = _.keys(d[0]);
  return _.map(d, function(d) {
    var o = {};
    _.each(keys, function(k) {
      if( k == 'TEAM'||k == 'ID') // Prevent Strings Being Parsed
        o[k] = parseFloat(d[k]);
      else
        o[k] = d[k];
    });
    return o;
  });
}

// Find min and maxes
function getBounds(d, paddingFactor) {
  paddingFactor = typeof paddingFactor !== 'undefined' ? paddingFactor : 1;
  var keys = _.keys(d[0]), b = {};
  _.each(keys, function(k) {
    b[k] = {};
    _.each(d, function(d) {
      if(isNaN(d[k]))
        return;
      if(b[k].min === undefined || d[k] < b[k].min)
        b[k].min = d[k];
      if(b[k].max === undefined || d[k] > b[k].max)
        b[k].max = d[k];
    });
    b[k].max > 0 ? b[k].max *= paddingFactor : b[k].max /= paddingFactor;
    b[k].min > 0 ? b[k].min /= paddingFactor : b[k].min *= paddingFactor;
  });
  return b;
}

// Force-Directed Scatterplot
// Source: http://bl.ocks.org/rpgove/10603627
//var data = d3.csv.parse( d3.select("pre#data").text() );
var data = d3.csv.parse(require('ipc').sendSync('synchronous-message', 'readthedatafile'));
// Resolve collisions between nodes.
function collide(alpha) {
  var quadtree = d3.geom.quadtree(data);
  return function (d) {
    var r = d.radius + radius + 5,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function (quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var qx = d.x - quad.point.x,
            qy = d.y - quad.point.y,
            l = Math.sqrt(qx * qx + qy * qy),
            qr = d.radius + quad.point.radius + (d.color !== quad.point.color);
        if (l < qr) {
          l = (l - qr) / l * alpha;
          qx = qx * l;
          qy = qy * l;
          d.x = d.x - qx;
          d.y = d.y - qy;
          quad.point.x += qx;
          quad.point.y += qy;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}

function moveTowardDataPosition(alpha) {
  return function (d) {
    d.x += (xScale(d[xVar]) - d.x) * 0.1 * alpha;
    d.y += (y(d[yVar]) - d.y) * 0.1 * alpha;
  };
}

function tick(e) {
  node.each(moveTowardDataPosition(e.alpha));
  node.each(collide(e.alpha, false));
//  node
//  .attr("cx", function (d) { return d.x; })
//  .attr("cy", function (d) { return d.y; });
  flags
  .attr('style', function (d) {
    var styleString;
    styleString = 'top:';
    styleString += d.y + 30;
    styleString += 'px; left: ';
    styleString += d.x + 16;   //图片的横坐标
    styleString += 'px;';
    return styleString;
  });
}



data = parseData(data);// Parse numbers to Float
var xVar = "TEAM",
    yVar = "ID",
    xVarOptions = ["TEAM"],
    descriptions = {},
    xScale,
    bounds = getBounds(data, 1),
    formatValue = d3.format(".2s"),
    thisTickFormat = function (d) {
      return formatValue(d).replace('G', 'B');
    },
    margin = {top: 20, right: 20, bottom: 10, left: 20},
    padding = {top: 20, right: 20, bottom: 10, left: 20},
    outerWidth = 960,
    outerHeight = 420,
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom,
    width = innerWidth - padding.left - padding.right,
    height = innerHeight - padding.top - padding.bottom,

    radius = 19,        //图片间距
    //x axis scale
    x = d3.scale.log().base(2).range([0, width]),
    // y axis scale
    y = d3.scale.log().base(2).range([0, height-150]),
    // Declare Axis
    xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(thisTickFormat),
    yAxis = d3.svg.axis()
      .scale(y)
      .orient("right")
      .tickFormat(d3.format("d")),
    force,
    node,
    flags,
    container,
    circles,
    svg,
    dl,
    span;

// THE CREATION
_.each(data,function(d) {
  addCSS('.f32 .'+d["STUID"]+'{background:url(css/images/'+d["STUID"]+'.png) no-repeat;background-size:contain;}');
  addCSS('.'+d["STUID"]+':hover{-moz-transform:scale(1);-webkit-transform:scale(1);-o-transform:scale(1);transform:scale(4);Z-INDEX:999999}');
});


// Create the Container
container = d3.select(".g-container");

// Create the Menu
container.append("div")
  .attr("class", "g-menu btn-group")
  .attr("data-toggle", "buttons-radio")
  .attr("id", "x-axis-menu")
  //.append('<button class="progress-button" data-style="fill" id="start">Submit</button>')
  ;

// Create the SVG
svg = container
  .append("svg")
  .attr("width", outerWidth)
  .attr("height", outerHeight);

svg.append("g").attr("class", "g-circles")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

circles = svg.select("g").append("g");

// Create the nodes
node = circles.selectAll(".dot")
  .data(data)
  .enter()
  .append("circle")
  .attr("class", "dot")
//  .attr("r", radius)
//  .attr("cx", function (d) { return x(d[xVar]); })
//  .attr("cy", function (d) { return y(d[yVar]); })
  .style("fill", function (d) { return 'transparent'; });

// Create the definition list
dl = container
  .append("div")
  .attr("class", "g-dados")
  .append("dl")
  .attr("class", "f32");

span = dl.append("span");

// Create THE FORCE
force = d3.layout.force()
  .nodes(data)
  .size([innerWidth, innerHeight])
  .on("tick", tick)
  .charge(20)
  .gravity(0)
  .chargeDistance(20);

// Create the Visualization
//span.append("dt").text("标志");
//span.append("dd").attr("class", "flag br");
/*
dl.append("dt").text("STUNAME");
dl.append("dd").attr("class", "STUNAME").text("STUNAME");

dl.append("dt").text("性别");
dl.append("dd").attr("class", "sex").text("性别");

dl.append("dt").text("爱好");
dl.append("dd").attr("class", "hobby").text("爱好");

dl.append("dt").text("STUID");
dl.append("dd").attr("class", "STUID").text("STUID");
*/
/*
dl.append("dt").text("PIC");
dl.append("dd").attr("class", "Codigo").text("Brasil");
*/
/*
dl.append("dt").text("ID");
dl.append("dd").attr("class", "SYSID").text("1º");


dl.append("dt").text("TEAM");
dl.append("dd").attr("class", "TEAM").text("19");
*/

//改为采用循环读取所有的属性




var keys = _.keys(data[0]);
var i = 0;
 _.each(keys, function(k) {
        dl.append("dt").text(k);
		dl.append("dd").attr("class", "ATT_"+i).text(k);
		i++;
    });




// Create the Flags
flags = container.append('div')
  .attr("class", "g-flags")
  .append("ul")
  .attr('class',  'f32')
  .selectAll("li")
  .data(force.nodes())
  .enter().append('li')
  //.attr('style','background:url('+__dirname+'/css/home.png) no-repeat;background-size:contain;display:inline-block;height:45px;width:45px;line-height:32px;')
  .attr('class',  function (d) {
    return 'flag ' + d["STUID"];
  }).on("mouseover", function (d) {
   // d3.select('.g-dados span dd').attr('class', 'flag ' + d["STUID"]); //鼠标悬停的图片变换效果
  // alert('\'.'+d["STUID"]);
   // d3.select('.Codigo').html(d.Codigo);
    //d3.select(".SYSID").html(d["ID"]);
	/*
    d3.select(".STUNAME").html(d["STUNAME"]); 
	d3.select(".STUID").html(d["STUID"]);	
	d3.select(".sex").html(d["性别"]);
	d3.select(".hobby").html(d["爱好"]);*/
    //d3.select(".ATT_0").html(d["TEAM"]);
	
	keys = _.keys(data[0]);
	i = 0;
	 _.each(keys, function(k) {
        d3.select(".ATT_"+i).html(d[k]);
		i++;
    });

	
    });

// Set scale domain
x.domain(d3.extent(data, function (d) { return d[xVar]; })).nice();
y.domain(d3.extent(data, function (d) { return d[yVar]; })).nice();

// Set initial positions
data.forEach(function (d) {
  d.x = x(d[xVar]);
  d.y = y(d[yVar]);
  d.radius = radius;
});

// Create the x Axis Menu
//<button class="progress-button" data-style="fill" data-horizontal>Submit</button>
//开始分组
d3.select('#start')
  .on('click', function (d) {
    force.stop();
    xVar = d;
	  //alert(__dirname + '\\TS.exe');
    require('child_process').execFile(__dirname + '\\TS.bat',null,{cwd:__dirname},function (error,stdout,stderr) {
        if (error !== null) {
		      alert('exec error: ' + error);
          console.log('exec error: ' + error);
        }
        else {
  			  console.log('run success!');
  			  location.reload();
  			  //updateChart();
			   }
    });
  });
  
  //恢复出厂设置
  d3.select('#init')
  .on('click', function (d) {
  if(confirm("此操作为清空历史分组信息，请确认是否需要恢复？")){
		require('child_process').execFile(__dirname + '\\init.bat',null,{cwd:__dirname},function (error,stdout,stderr) {
			if (error !== null) {
			  alert('exec error: ' + error);
			  console.log('exec error: ' + error);
			}
			else {
				  console.log('run success!');
				  location.reload();
				  //updateChart();
				}
		});
	}
  });
  
  
  //获取本机IP地址
  function getIPAdress(){
    var interfaces = require('os').networkInterfaces();
    for(var devName in interfaces){
          var iface = interfaces[devName];
          for(var i=0;i<iface.length;i++){
               var alias = iface[i];
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                     return alias.address;
               }
          }
    }
}
   //扫描二维码上传头像
  d3.select('#qrcode')
  .on('click', function (d) {
		//替换qrcode.html的ip地址
		var str = require('fs').readFileSync(__dirname+'\\qrcode.html').toString();
		
		//alert(getIPAdress());
		str = str.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, getIPAdress())
		require('fs').writeFileSync(__dirname+'\\qrcode.html',str);
  
  
		//用bat打开qrcode.html
		require('child_process').execFile(__dirname + '\\qrcode.bat',null,{cwd:__dirname},function (error,stdout,stderr) {
			if (error !== null) {
			  alert('exec error: ' + error);
			  console.log('exec error: ' + error);
			}
			else {
				  console.log('run success!');
				  //location.reload();
				  //updateChart();
				}
		});

  });
  
// Render axes
var gx = svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(40," + (height + 28) +  ")")
  .call(xAxis)
;


/*setTimeout(function() {
 gx.call(customAxis);
}, 1000);*/

/*function customAxis(g) {
  g.selectAll("text")
      .attr("x", -54)
      .attr("dy", 4);
}*/



function makeXAxis(s) {
  s.call(d3.svg.axis()
  .scale(xScale)
  .orient("bottom")
  .ticks(bounds[xVar].max)                       //设置虚线数为最大组数
  .tickSize(-height - 7, 0, 0)
  .tickFormat(function (d) { return "第" + d + "组"; }));
}

/*function makeYAxis(s) {
  s.call(d3.svg.axis()
  .scale(y)
  .orient("left")
  .tickSize(-width, 0, 0)
  .tickFormat(function (d) { return d + "º"; }));
}*/

function updateScales() {
  switch (xVar) {
    case "PIB":   // 这里不执行
	  //alert('PIB');
      formatValue = d3.format(".2s");
      xScale = d3.scale.log().base(2)
      .range([0, width])
      .domain([bounds[xVar].min, bounds[xVar].max]);
      break;
    case "TEAM": // 执行这里
	  //alert(d3.width);
	  formatValue = d3.format("d");
      xScale = d3.scale.linear()
      .range([0, width])
      .domain([bounds[xVar].min, bounds[xVar].max])
	  ;
      break;
  }
}
function updateChart() {
  updateScales();
//  d3.selectAll('.dot')
//  .transition()
  //.duration(1000)
  //.ease('quad-out')
  //.attr('cx', function (d) { return xScale(d[xVar]); })
  //.attr('cy', function (d) { return y(d[yVar]); });

  //Also update the axes
  d3.select('.x')
  .transition()
  .call(makeXAxis);
  d3.select('.y')
  .transition()
  //.call(makeYAxis)
  ;
  // Update axis labels
//  d3.select('.label')
//  .text(descriptions[xVar]);
  // Start THE FORCE
  force.start();
}

/*function updateMenus() {
  d3.select('#x-axis-menu')
  .selectAll('a')
  .classed('active', function (d) {
    return d === xVar;
  });
}*/

updateChart();
//updateMenus();
