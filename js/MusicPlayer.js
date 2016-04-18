// JavaScript Document


// 歌曲信息dom对象
var music_info 	= '';
var audio 		= $("#audio").get(0);			// audio标签
var play   		= $("#play");					// 播放/暂停 按钮
var next   		= $("#next");					// 下一曲按钮
var cover  		= $("#music-cover"); 			// 封面容器
var img    		= $("#img-1");					// 封面图片
var img2 		= $("#img-2");					// 封面图的小圆点
var m_name   	= $("#music-name");				// 歌曲名
var artist 		= $("#music-artist"); 			// 歌手
var lrc    		= $("#music-lrc");				// 歌词

var lrc_info;									// 歌词信息
var lrc_interval; 								// 歌词时间控制器

// 界面控制dom
var paceSpot 	= $("#pace-spot"); 				// 整个大的圆点
var circle 		= $("#circle"); 				// 小圆点
var circle1 	= $("#circle1");				// 进度小圆点小圈
var circle2 	= $("#circle2"); 				// 进度小圆点大圈		
var pace 		= $("#pace-con"); 				// 进度条
var sound 		= $("#sound");					// 音量

// canvas 画布 
var canvasBox 	= $("#canvas").get(0);				// 画布容器
var canvas 		= document.createElement("canvas");	// 画布
var ctx 		= canvas.getContext("2d");			// 设置画布为2d
var Width,Height;									// canvas画布长宽

canvasBox.appendChild(canvas);


var ShowLrc = ""; 								// 当前显示的歌词


// try {
// 	/*
// 		audioBufferSource 播放音频对象
// 		audioBufferSource.buffer 存储音频资源数据
// 		decodeAudioData() 解码通过ajax请求的音频数据赋值给audioBufferSource.buffer
// 		analyserNode 分析原始音频信号
// 		gainNode 音量控制
// 		连接顺序为 audioBufferSource -> analyserNode -> gainNode -> audioDestination(ac.destination)
// 		requestAnimationFrame analyserNode下的方法 动画？
// 		这里用ac.createMediaElementSource(audio元素) 来代替audioBufferSource
// 	*/
// 	var ac = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext)();

// 	var gainNode = ac.createGain();
// 	gainNode.gain.value = 0.6;
// 	gainNode.connect(ac.destination);

// 	var analyser = ac.createAnalyser();
// 	analyser.fftSize = 1024;
// 	analyser.connect(gainNode);

// 	var audioSrc = ac.createMediaElementSource(audio);
// 	audioSrc.connect(analyser);
// 	// var audioBufferSource = ac.createBufferSource();
// 	// audioBufferSource.connect(analyser);
// 	requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

// } catch(e) {
// 	console.log("You browser does not support AudioContext:"+e);
// }

setType();

loadMusicInfo();

//visualizer();

window.onresize = function(){
	setType();
};


cover.hover(
	function(){
		img2.removeClass("coverHover2").addClass("coverHover1");
	},
	function(){
		img2.removeClass("coverHover1").addClass("coverHover2");;
	}
)

// 动态改变歌曲图片大小
function setType(){
	cover.width(cover.height());

	Height = canvasBox.clientHeight;
	Width = canvasBox.clientWidth;
	canvas.height = Height;
	canvas.width = Width;

	var line = ctx.createLinearGradient(0, 0, 0, Height);

	line.addColorStop(1, '#0f0');
	line.addColorStop(0.5, '#ff0');
	line.addColorStop(0, '#f00');
	ctx.fillStyle = line;
}

// 获取URL参数
function getQueryString(name) { 
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	var r = window.location.search.substr(1).match(reg); 
	if (r != null) return unescape(r[2]); return null; 
}
function getUrlType(){
	var type = getQueryString("type");
	return type !== null ? type : null;
}

// 加载歌曲
function loadMusicInfo(){
	var type = getUrlType();
	var url;
	if(type !== null){
		url = "player.php?type="+type+"&" + (new Date()).getTime();
	}else {
		url = "player.php?=" + (new Date()).getTime();
	}
	//console.log(url);
	$.ajax({
		type:"GET",
		url:url,
		//dataType:"json", 报错
		success: function(data){
			music_info = JSON.parse(data);
			//$(audio).attr("src", "music.mp3");
			//$(audio).attr("src", "http://crossorigin.me/" + music_info.mp3);
			$(audio).attr("src", music_info.mp3);
			img.css("background-image","url("+ music_info.cover +")");
			m_name.html(music_info.name);
			artist.html(music_info.artists);
			console.log(music_info);
			//alert( JSON.stringify(music_info.lrc));
			if(music_info.lrc !== "null"){
				lrc.html("");
				lrc_info = music_info.lrc;
			}else{
				lrc_info = "null";
				lrc.html("QVQ 没有找到歌词( •̀ ω •́ )y");	
			}
			if(music_info.mp3 === ""){
				setPrompt("warning","由于版权问题 无法播放",1200);	
				next_music();
				console.log("由于版权问题 获取歌曲失败 跳过该曲");
			}
		},
		error: function(){
			setPrompt("warning","加载歌曲失败。。。",1200);	
		}
	});
}

// var xhr = new XMLHttpRequest();
// function loadMusicData (url) {
// 	console.log(url);
// 	xhr.open("GET", url);
// 	xhr.responseType = "arraybuffer";
// 	xhr.onload = function() {
// 		console.log(xhr.response);
// 		ac.decodeAudioData(xhr.response, function(buffer){
// 			audioBufferSource.buffer = buffer;
// 			audioBufferSource.start(0);
// 		},
// 		function(err){
// 			console.log("解码失败!"+err);
// 		});
// 	}
// 	xhr.send();
// }

// 绘制频谱函数
function draw(arr) {
	ctx.clearRect(0, 0, Width, Height);
	var w = Width / arr.length;
	for (var i = 0; i < arr.length; i++) {
		var h = arr[i] / 256 * Height;
		ctx.fillRect(w * i, Height - h, w * 0.6, h);
	}
}

function visualizer(){
	// analyser.frequencyBinCount 获取的长度 设置Uint8Array的长度 arr并没有数据 只是指定长度
	var arr = new Uint8Array(analyser.frequencyBinCount);
	
	function v() {
		analyser.getByteFrequencyData(arr);
		draw(arr);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);
}



// 播放歌曲/暂停歌曲
play.bind("click",function(){
	if(audio.paused){
		audio.play();
	}else{
		audio.pause();
	}
});

// 切换下一曲
next.bind("click",function(){
	next_music();
});

// 播放
function f_play(){
	play.find("img").attr({"src":"img/pause.png","title":"暂停"});
	img.addClass("roll");
	circle1.addClass("circleRotate");
	circle2.addClass("circleZoom");

	if (lrc_info !== "null") {
		lrc_interval = setInterval("display_lrc()", 800);
	}
}

// 暂停
function f_pause(){
	play.find("img").attr({"src":"img/play.png","title":"播放"});
	img.removeClass("roll");
	circle1.removeClass("circleRotate");
	circle2.removeClass("circleZoom");
	//如果播放状态暂停 并且歌词不为空
    if (!audio.paused && lrc_info !== "null") {
        clearInterval(lrc_interval);
    }
}

// 下一曲
function next_music(){
	setPrompt("warning","下一曲。。。",1200);
	audio.pause();
	f_pause();
	paceSpot.css("left","0px");
	loadMusicInfo();
}
// 设置歌词
function display_lrc() {
	//获取当前歌曲播放的进度
   	play_time = Math.floor(audio.currentTime).toString();
	//获取当前歌曲进度同时间内歌词的信息 歌词信息格式为 时间：内容
	if(lrc_info[play_time] == undefined || lrc_info[play_time] == ShowLrc) {
		return;
	} else {
		var thisLrc = $("<p>" + lrc_info[play_time] + "</p>");
		ShowLrc = lrc_info[play_time];
		lrc.find("p").removeClass("lrc-in").addClass("lrc-out");
		thisLrc.addClass("ellipsis lrc-in");
	    lrc.append(thisLrc);
	}
}






$(audio).bind("timeupdate", function(){
	stripMove();
	playEnd()
})

/*状态提示
--------------------------------------------------------*/
$(document).ready(function(e) {
    //alert("document");
});
//页面加载完成
$(audio).bind("loadstart",function(){
	setPrompt("warning","正在加载。。。",1200);
});
//缓冲到可以播放
$(audio).bind("canplay",function(){
	setPrompt("success","可以播放。。。",1200);
	audio.play();
});
//在浏览器不论何种原因未能取回媒介数据时运行的脚本。
$(audio).bind("stalled",function(){
	console.log("error get info no");
	//next_music();
});
//完全缓冲完成
$(audio).bind("canplaythrough",function(){
	setPrompt("success","加载完成。。。",1200);
});
//当媒介已停止播放但打算继续播放时（比如当媒介暂停已缓冲更多数据）运行脚本
$(audio).bind("waiting",function(){
	setPrompt("warning","正在缓冲。。。",1200);
});
//当媒介已开始播放时运行的脚本。
$(audio).bind("playing",function(){
	setPrompt("success","播放。。。",1200);
	f_play();
});
//当媒介被用户或程序暂停时运行的脚本。
$(audio).bind("pause",function(){
	setPrompt("warning","暂停。。。",1200);
	f_pause();
});

// 拖动歌曲进度条
circle.bind("mousedown", function(ev){
	console.log("按下");
	$(this).bind("mousemove", function(ev){
		console.log("移动");
		spotMousemove(ev);

	});
}).bind("mouseup", function(){
	console.log("松开");
	$(this).unbind("mousemove");
});

// 点击歌曲进度条
$("#pace-con > a").bind("click", function(ev){
	var ev = window.event || ev;
	var total = $(this).width();
	var progressX = ev.clientX - $(this).get(0).getBoundingClientRect().left;
	//var width = progressX / total * 100;
	//width = Math.round(width);
	paceSpot.css("left",progressX+"px");
});

// 圆点移动函数
function spotMousemove(ev) {
	var ev = window.event || ev;
	// 获取元素左边距离屏幕左边的距离
	var leftX = $("#pace-con a").get(0).getBoundingClientRect().left;
	// 获取元素右边距离屏幕左边的距离
	var rightX = $("#pace-con a").get(0).getBoundingClientRect().right;
	// 获取元素的距离
	var width = rightX - leftX;
	// 获取鼠标位置距离元素的位置
	var progressX = ev.clientX - leftX;
	if( progressX <= 0 ) {
		progressX = 0;
	} else if (progressX >= width) {
		progressX = width;
	}
	paceSpot.css("left",progressX+"px");
}

/* = 进度条自动移动
-----------------------------------------------------*/
function stripMove() {

	var total = audio.duration;			//获取歌曲总长度
	var current = audio.currentTime;	//获取歌曲当前长度
	var slider_total = pace.width(); 	//获取进度条的总长度
	paceSpot.css("left", (current/total)*slider_total);

}
/* = 播放完成
-----------------------------------------------------*/
function playEnd(){

	// 歌曲播放完毕
	if(audio.ended){
		paceSpot.css("left","0px");
		next_music();
	}
}