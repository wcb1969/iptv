function main(item) {
    const id = item.id || 'nczh';
    const fmt = item.fmt || 'hls'; //hls flv
    const n = { 
        'nczh' : 1, //南昌综合
        'ncds' : 2, //南昌文旅
        'nczx' : 3, //南昌资讯
        'ncgg' : 4, //南昌公共
        'xjtv' : 8, //新建台
        'ncxtv' : 9, //南昌县台
        'aytv' : 10, //安义台
        'jxtv' : 11, //进贤台
        'wltv' : 12, //湾里台    
    }; 
     const url = "https://gapi.nctvcloud.com/zsnc/liveurl";
    const res = ku9.request(url);
    const data = JSON.parse(res.body);
    
    for (let v of data) {
        if (n[id] === v.id) {
            m3u8 = v.live_wx_url;
            flv = v.liveurl;
            break; 
        }
    }
    if (fmt === 'flv') {
        return { url: flv }; 
    } else {
        return { url: m3u8 }; 
    }    
}   
