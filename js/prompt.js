// JavaScript Document
// 消息提示js

$(function(){

/* = 判断是否存在父节点 不存在则创建
----------------------------------------------------------------------------------*/
	if(!$("#top_prompt").length >0 ){
		var top_prompt = $("<div id='top_prompt'></div>");
		$('body').append(top_prompt);
	}
})


/* = 创建节点 这里关系到作用域 如果放在$(function()){} 中 那么其它$(function(){}) 访问不了
-----------------------------------------------------------------------------------*/
function setPrompt(statr,text,time){
	var Prompt = $("#top_prompt");
	var Prompt_text = $("<span id='prompt_text' class="+statr+">"+text+"</span>");
	Prompt.append(Prompt_text);
	//设置6s后销毁节点
	setTimeout(function(){ Prompt_text.remove(); },time);
}
