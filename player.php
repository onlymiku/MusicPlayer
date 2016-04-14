<?php


header('Content-type:text/html;charset=UTF-8');
header("Access-Control-Allow-Origin:*");   
include 'list.php';

//获取get请求的数据
function getData(){
	return isset($_GET['type']) ? $_GET['type'] : null;
}

//创建一个http请求
function curl_get($url){
    $refer = "http://music.163.com/";
    $header[] = "Cookie: " . "appver=1.5.0.75771;";
    //创建一个新的curl会话
    $ch = curl_init();
    //设置会话的url
    curl_setopt($ch, CURLOPT_URL, $url);
    //设置会话的头
    curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
    //设定是否显示头信息 设置了会返回信息
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    //在启用CURLOPT_RETURNTRANSFER时候将获取数据返回
    curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
    //在HTTP请求中包含一个”referer”头的字符串。
    curl_setopt($ch, CURLOPT_REFERER, $refer);
    //执行curl会话
    $output = curl_exec($ch);
    //关闭curl会话
    curl_close($ch);
    //返回信息 失败返回false 成功返回true如果开启CURLOPT_RETURNTRANSFER者返回获取信息
    return $output;
}

//获取歌单信息 传入歌单id
function get_playlist_info($playlist_id){
	$url = "http://music.163.com/api/playlist/detail?id=" . $playlist_id;
    return curl_get($url);
}
//获取歌曲信息 传入歌曲id
function get_music_info($music_id)
{
    $url = "http://music.163.com/api/song/detail/?id=" . $music_id . "&ids=%5B" . $music_id . "%5D";
    return curl_get($url);
}
//获取歌曲歌词 传入歌曲id
function get_music_lyric($music_id)
{
    $url = "http://music.163.com/api/song/lyric?os=pc&id=" . $music_id . "&lv=-1&kv=-1&tv=-1";
    return curl_get($url);
}
//预加载歌曲
function rand_music()
{
    global $play_list;
    $sum = count($play_list);
    //$id为数组
    $id = $play_list[rand(0, $sum - 1)];
    return $id;
}

function get_music_id()
{
    $played = isset($_COOKIE["played"]) ? json_decode($_COOKIE["played"]) : null;
    $id = rand_music();
    if ($played != null) {
        global $play_list;
        $sum = count($play_list);
        if ($sum >= 2) {
            $sum = $sum * 0.5;
        } else {
            $sum -= 1;
        }
        //in_array() 函数搜索数组中是否存在指定的值。 判断$player中是否是$id 如果有则重新赋值
        while (in_array($id, $played)) {
            $id = rand_music();
        }
        if (count($played) >= $sum) {
        	//array_shift() 函数删除数组中第一个元素，并返回被删除元素的值(这里的返回值没用。
            array_shift($played);
        }
    }
	//吧得到的歌曲id加入到$player集合中
    $played[] = $id;
    setcookie("played", json_encode($played), time() + 3600);
    return $id;
}

//获取所有歌单
function getArrayData(){
	global $playlist_list;
	global $play_list;
	//循环获取所有歌单列表
	foreach ($playlist_list as $key) {
		//获取歌单所有数据 返回json
		$json = get_playlist_info($key);
		$arr = json_decode($json, true);
		//循环每一首歌 获取歌曲id
		foreach ($arr["result"]["tracks"] as $key2) {
			$id = $key2["id"];
			//如果歌曲列表没有当前$id 则把当前$id加入列表
			if (!in_array($id, $play_list)) {
				$play_list[] = $id;
			}
		}
	}
}
//获取指定歌单
function getStringData(){
	global $playlist_list;
	global $play_list;
	//吧默认的歌曲删除掉
	$play_list = [];
	//获取一个歌单的所有歌曲
	$json = get_playlist_info($playlist_list);
	$arr = json_decode($json, true);
	foreach ($arr["result"]["tracks"] as $key){
		$id = $key["id"];
		if (!in_array($id, $play_list)) {
			$play_list[] = $id;
		}
	}
}

//获取歌单歌曲
if(getData()){
	//判断get获取的类型在数组中是否声明 true:歌单列表改为传入类型歌单 返回数组  false:默认所有歌单返 回字符串
	$playlist_list = isset($playlist_list[getData()]) ? $playlist_list[getData()] : $playlist_list;
	//判断是否为数组
	if(is_array($playlist_list)){
		getArrayData();
	}else {
		getStringData();
	}
}else {
	getArrayData();
}


//获取数据
$id = get_music_id();
$music_info = json_decode(get_music_info($id), true);
$lrc_info = json_decode(get_music_lyric($id), true);

//拿到id。。。
$play_info["id"] = $id;
//处理音乐信息
$play_info["cover"] = $music_info["songs"][0]["album"]["picUrl"];
$play_info["mp3"] = $music_info["songs"][0]["mp3Url"];
//str_replace() 函数以其他字符替换字符串中的一些字符（区分大小写）。 吧http://m 转换为http://p
$play_info["mp3"] = str_replace("http://m", "http://p", $play_info["mp3"]);
$play_info["name"] = $music_info["songs"][0]["name"];
foreach ($music_info["songs"][0]["artists"] as $key) {
    if (!isset($play_info["artists"])) {
        $play_info["artists"] = $key["name"];
    } else {
        $play_info["artists"] .= "," . $key["name"];
    }
}

//处理歌词
if (isset($lrc_info["lrc"]["lyric"])) {
	//exploda 把字符串打散为数组 吧字符串以 “\n”来拆分为字符串 
    $lrc = explode("\n", $lrc_info["lrc"]["lyric"]);
    //array_pop 删除数组的最后一个元素
    array_pop($lrc);
    foreach ($lrc as $rows) {
        $row = explode("]", $rows);
        if (count($row) == 1) {
            $play_info["lrc"] = "null";
            break;
        } else {
            $lyric = array();
            //end 输出数组中的当前元素和最后一个元素的值：
            $col_text = end($row);
            array_pop($row);
            foreach ($row as $key) {
            	//substr() 函数返回字符串的一部分。从第1个位置取
                $time = explode(":", substr($key, 1));
                $time = $time[0] * 60 + $time[1];
                $play_info["lrc"][$time] = $col_text;
            }
        }
    }
} else {
    $play_info["lrc"] = "null";
}
echo json_encode($play_info);