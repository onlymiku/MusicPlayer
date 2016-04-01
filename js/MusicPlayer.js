// JavaScript Document

var player = $("#player").get(0);
var play   = $("#play");
var next   = $("#next");
var img    = $("#img-1");
var m_name   = $("#music-name");
var artist = $("#music-artist");
var lrc    = $("#music-lrc");
var lrc_info;
var lrc_interval;

$(function(){
	
	lodaImgWidth();
	window.onresize = function(){
		lodaImgWidth();
	};
	player.volume = 0.6;
	
	play_load();
});

//获取URL参数
function getQueryString(name) { 
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	var r = window.location.search.substr(1).match(reg); 
	if (r != null) return unescape(r[2]); return null; 
}

function getUrlData(){
	var type = getQueryString("type");
	return type !== null ? type : null;
}

//动态改变歌曲图片大小
function lodaImgWidth(){
	$("#music-img").width($("#music-img").height());
}
//播放歌曲/暂停歌曲
play.bind("click",function(){
	if(player.paused){
		player.play();
		
	}else{
		player.pause();
	}
});
//切换下一曲
next.bind("click",function(){
	next_music();
});
//播放
function f_play(){
	play.find("img").attr({"src":"img/pause.png","title":"暂停"});
	img.addClass("roll");
	if (lrc_info !== "null") {
		lrc.html("");
		lrc_interval = setInterval("display_lrc()", 800);
	}else{
		lrc.html("QVQ 没有找到歌词( •̀ ω •́ )y");	
	}
}
//暂停
function f_pause(){
	play.find("img").attr({"src":"img/play.png","title":"播放"});
	img.removeClass("roll");
	//如果播放状态暂停 并且歌词不为空
    if (!player.paused && lrc_info !== "null") {
        clearInterval(lrc_interval);
    }
}
//下一曲
function next_music(){
	setPrompt("warning","下一曲。。。",1200);
	player.pause();
	f_pause();
	play_load();
}
//加载歌曲
function play_load(){
	var type = getUrlData();
	var url;
	if(type !== null){
		url = "player.php?type="+type+"&" + (new Date()).getTime();
	}else {
		url = "player.php?=" + (new Date()).getTime();
	}
	console.log(url);
	$.ajax({
		type:"GET",
		url:url,
		//dataType:"json", 报错
		success: function(data){
	
			var music_info = JSON.parse(data);
			$(player).attr("src", music_info.mp3);
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
	//如果图片加载失败 设置默认图片
	if(img.fileSize <= 0){
		console.log("not img load");
		img.css("background-image","url(../img/cover.png)");
	}
}
//设置歌词
function display_lrc() {
	//获取当前歌曲播放的进度
    play_time = Math.floor(player.currentTime).toString();
	//获取当前歌曲进度同时间内歌词的信息 歌词信息格式为 时间：内容
    lrc.html(lrc_info[play_time]);
}


var progressX;
var width;
$("#sound").bind("mousemove",function(ev){
	var ev = window.event || ev;
	var total = $(this).width();
	progressX = ev.clientX - $(this).get(0).getBoundingClientRect().left;
	width = progressX / total * 100;
	width = Math.round(width);
	$("#sound-slider").fadeIn(200);
	$("#sound-slider").html(width+"%");
	var sliderWidth = $("#sound-slider").width();
	$("#sound-slider").css("left",progressX - (sliderWidth / 2));
}).bind("mouseout",function(){
	$("#sound-slider").fadeOut(200);
}).bind("click",function(ev){
	$("#sound-this").width(progressX);
	$("#sound-show").html(width+"%");
	player.volume = width / 100 ;
});

/*状态提示
--------------------------------------------------------*/
$(document).ready(function(e) {
    //alert("document");
});
//歌曲播放完毕
$(player).bind("ended",function(){
	next_music();
});
//页面加载完成
$(player).bind("loadstart",function(){
	setPrompt("warning","正在加载。。。",1200);
});
//缓冲到可以播放
$(player).bind("canplay",function(){
	setPrompt("success","可以播放。。。",1200);
	player.play();
});
//在浏览器不论何种原因未能取回媒介数据时运行的脚本。
$(player).bind("stalled",function(){
	console.log("error get info no");
	//next_music();
});
//完全缓冲完成
$(player).bind("canplaythrough",function(){
	setPrompt("success","加载完成。。。",1200);
});
//当媒介已停止播放但打算继续播放时（比如当媒介暂停已缓冲更多数据）运行脚本
$(player).bind("waiting",function(){
	setPrompt("warning","正在缓冲。。。",1200);
});
//当媒介已开始播放时运行的脚本。
$(player).bind("playing",function(){
	setPrompt("success","播放。。。",1200);
	f_play();
});
//当媒介被用户或程序暂停时运行的脚本。
$(player).bind("pause",function(){
	setPrompt("warning","暂停。。。",1200);
	f_pause();
});

