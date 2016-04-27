var volume = 60;
var volumeBox = $("#volume-box");

var center,Width,Height;

// 创建画布
var canvas = $("<canvas></canvas>").get(0);
// 绘图上下文
var context = canvas.getContext('2d');

$(window).resize(function() {
	resize();
})

function resize() {
	// 动态改变歌曲图片大小
	cover.width(cover.height());
	// 动态改变音量画布大小
	volumeBox.width(volumeBox.height());
	center = volumeBox.width() / 2;
	Width = Height = volumeBox.height();

	canvas.width = Width;
	canvas.height = Height;

	drawCircular();
}

resize();


// 绘制音量界面
function drawCircular() {
    setVolume();
	// 清除画布
    context.clearRect(0, 0, Width, Height);

	// 设置线宽为5
	context.lineWidth = 5;

	/* 画灰色圆 */
	// 开始一条路径，或重置当前的路径
	context.beginPath();
	// 坐标移动到圆心
	context.moveTo(center, center);
	// 画圆 圆心X 圆心Y 圆半径 从0角度开始 2PI结束 是否逆时针
	context.arc(center, center, center, 0, Math.PI * 2, false);
	// 关闭路径
	context.closePath();
	// 设置颜色
	context.fillStyle = "rgba(0,0,0,0.5)";
	// 填充颜色
	context.fill();



	/* 进度条轨道 画线 */
	context.beginPath();
	// 不需要移动到圆点
	//context.moveTo(center, center);
	context.arc(center, center, center - 10, 0, Math.PI * 2, false);
	// 不连接
	//context.closePath();
	context.strokeStyle = "#e1e1e1";
	context.stroke();

	/* 画进度 画线 */
	context.beginPath();
	// 圆点的开始角为3点方向 位置为Math.PI * 0 
	// 所以进度开始位置为12点方向 位置为Math.PI * -0.5
	context.arc(center, center, center - 10, Math.PI * -0.5, Math.PI * -0.5 -  Math.PI * -2 * volume / 100, false);
	context.strokeStyle = "#e74c3c";
	context.stroke();


	/* 中间的字 */
	// 字体
	context.font = "24px 微软雅黑";
	// 字体颜色
	context.fillStyle = "#fff";
	// 文字水平居中
	context.textAlign = "center";
	// 文字垂直居中
	context.textBaseline = "middle";
	context.moveTo(center, center);
	context.fillText(volume+"%", center, center);


	volumeBox.append(canvas);
}

var thisTime;
var Timing;

function plusVolume() {
	volume += 10;
	if(volume >= 100) {
		volume = 100;
	}
	drawCircular()
}
function reduceVolume() {
	volume -= 10;
	if(volume <= 0) {
		volume = 0;
	}
	drawCircular()
}

function scrollFunc(e) {
	thisTime = 0;
	clearInterval(Timing);

	volumeBox.css("display","block");

	e=e || window.event;

	if(thisTime == 0) {
    	Timing = setInterval("volumeHide()",1000);
	}

    if(e.wheelDelta){		//IE/Opera/Chrome
    	if(e.wheelDelta >= 120 ) {
    		reduceVolume();
    	}else {
			plusVolume();
    	}
    }else if(e.detail){		//Firefox
    	if(e.detail >= 0 ) {
    		reduceVolume();
    	}else {
			plusVolume();
    	}
    }
}

function volumeHide() {
	thisTime++;
	if(thisTime >= 2) {
		volumeBox.css("display","none");
		thisTime = 0;
		clearInterval(Timing);
	}
}

function setVolume() {
	audio.volume = volume / 100 ;
}

function touchStart(event) {
	/*
	*
	*	touches:     		//当前屏幕上所有手指的列表
	*	targetTouches:      //当前dom元素上手指的列表，尽量使用这个代替touches
	*	changedTouches:     //涉及当前事件的手指的列表，尽量使用这个代替touches
	*
	*	clientX / clientY:      //触摸点相对浏览器窗口的位置
	*	pageX / pageY:       	//触摸点相对于页面的位置
	*	screenX  /  screenY:    //触摸点相对于屏幕的位置
	*
	*/
	var initY = event.touches[0].pageY;
	var temp = 50;
	var tempY;
	document.addEventListener('touchmove',function(event){
		thisTime = 0;
		clearInterval(Timing);

		if(thisTime == 0) {
	    	Timing = setInterval("volumeHide()",1000);
		}

		var thisY = event.touches[0].pageY;
		tempY = initY - thisY;
		
		console.log(tempY+"tempY");

		if(tempY >= 50 || tempY <= -50) {
			volumeBox.css("display","block");
			if(temp < tempY) {
				plusVolume();
			}else {
				reduceVolume();
			}
			console.log(temp+"temp")
			temp = tempY;
		}
	},false)
}

// 绑定鼠标滚动事件
if(document.addEventListener){
    document.addEventListener('DOMMouseScroll',scrollFunc,false);
    document.addEventListener('touchstart',touchStart,false);
    //document.addEventListener('touchmove',touchMove,false);
    
}
//IE/Opera/Chrome/Safari
window.onmousewheel=scrollFunc;