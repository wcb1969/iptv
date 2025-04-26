/*
    首先需要下载凤凰秀app：
    使用手机浏览器访问 https://share.fengshows.com/download.html?channelID=o02 即可自动下载。
然后注册一个帐号，可以使用大陆手机号注册。以下均以大陆手机号注册为例。

    其次，将JS中的gtData里的phone改为自己的手机号，pwd改为自己的密码。prefix根据手机前缀更改，如大陆为"86"，深圳旁边为"852"，注意这些参数都需要带引号！
    
    帐号将会自动按需刷新登录（一般为一个月一次，不过期不会重复登录）
    
    可回放，但最多只能往前回放今天昨天前天共三天节目。如果当天是星期日，则只能回放当天节目。具体可打开凤凰秀，查看可回放节目
*/

function main(item) {
//酷9专用JS 1.3.4.4及以后版本
    let url = item.url;
    const id = ku9.getQuery( url, "id" ) || 'fhzw';
    const playseek = ku9.getQuery( url, "playseek" );
    
    const gtData = {
        phone : '1***', //手机号
        pwd : '***',   //密码
        prefix : '86'    //手机号前缀
    }
    
    // 定义频道ID与UUID的映射关系
    const n = {
        'fhzw': 'f7f48462-9b13-485b-8101-7b54716411ec', // 凤凰中文
        'fhzx': '7c96b084-60e1-40a9-89c5-682b994fb680', // 凤凰资讯
        'fhhk': '15e02d92-1698-416c-af2f-3e9a872b4d78', // 凤凰深圳
    };
    
    //FHD需要token token有效期一个月 FHD->1280*720 1M ;HD->854*480 0.5M ;LD->640*360 0.3M
    //token有效期一个月，无token最高清晰度为hd 854*480  

    let token = ku9.getCache( 'fhxToken' );
    let isValid = validToken( token, n[id] );
    if(isValid === 0 || isValid === 1){
        token = getToken( gtData.prefix, gtData.phone, gtData.pwd );
        var Cache = ku9.setCache( 'fhxToken', token, 2592000000);//30*24*3600*1000，30天
    }
    
    //直播&回放请求
    const headersR = {
        'User-Agent': 'okhttp/3.14.9',
        'token': token,
        'fengshows-client':'app(android,5041401);Redmi;29',
        'Connection':'Keep-Alive',
        'Accept-Encoding':'gzip'
    };    
    //直播
    const headersPlay = {
        'User-Agent' : 'Dalvik/2.1.0 (Linux; U; Android 10; M2007J3SC MIUI/V12.0.12.0.QJDCNXM)',
        'Accept-Encoding' : 'identity',
        'Connection' : 'close',
     //  'Host' : 'dispatch.fengshows.cn:8484',
        'Referer' : 'dispatch.fengshows.cn'
    };
    //回放
    const headersReplay = {
        'User-Agent' : '2.32.0.00186',
        'Accept-Encoding' : 'identity',
        'Connection' : 'Keep-Alive',
        'Range' : 'bytes=0-',
       // 'Host' : 'timelive.fengshows.cn'
    };    
    
    let liveUrl;
    if (playseek){
    //回放
        liveUrl = getReplay( n[id], playseek, JSON.stringify(headersR) );
        if(liveUrl){
            return JSON.stringify({ url : liveUrl, headers : JSON.stringify(headersReplay) });
        }else{
            return JSON.stringify({ error: "接口返回格式不正确或没有找到直播地址！" });
        }
        
    }else{
    //直播
        liveUrl = getPlay( n[id], JSON.stringify(headersR) );
        if(liveUrl){
            return JSON.stringify({ url : liveUrl, headers : JSON.stringify(headersPlay) });
        }else{
            return JSON.stringify({ error: "接口返回格式不正确或没有找到直播地址！" });
        }
    }   
}

function getToken( prefix, user, pwd) {
//获取token
    let dataBody = {
        "phone":     user,
        "password":  pwd,
        "code":      prefix,
        "keep_alive": false
    };
    let token = "";
    let tokenUrl = 'https://m.fengshows.com/api/v3/mp/user/login';
    let headerT = {
        'Content-Type': 'application/json'
    };
       
    let tokenRes = ku9.post( tokenUrl, JSON.stringify(headerT), JSON.stringify(dataBody) );
    
    if(tokenRes.indexOf('ok') === -1){
        return JSON.stringify({error: "没找到token"})
    
    }
    let json = JSON.parse(tokenRes);
    if ( json && json.data && json.data.token ){
        token = json.data.token;
    }
      
    return token;
}

function validToken( token, idStr ){
    if(!token){
        return 0;//缓存里没有token
    }
    
    const headersR = {
        'User-Agent': 'okhttp/3.14.9',
        'token': token
    };
    // 构建请求URL
    let requestUrl = 'https://api.fengshows.cn/hub/live/auth-url?live_qa=fhd&live_id=' + idStr;  
    // 获取数据
    let res = ku9.get( requestUrl, JSON.stringify(headersR) );
    // 检查返回数据中是否包含http，如果没有，则token失效
    if (res.indexOf('http') === -1) {
        return 1;//缓存token存在但失效
    }else{
        return 2;//缓存token存在且有效
    }    
}

function getReplay(idStr, playseek, headerStr){
//获得凤凰秀的回放地址    
//时间戳
    let starttime = playseek.slice(0,14);
    let endtime = playseek.slice(-14);
    let starttimeH = dateToUTCHex( starttime );
    let endtimeH = dateToUTCHex( endtime );
    
    // 构建请求URL
    let requestUrl = 'https://m.fengshows.com/api/v3/hub/live/auth-url?live_id=' + idStr + '&live_qa=FHD&play_type=replay&ps_time=' + starttimeH + '&pe_time=' + endtimeH;
    // 获取数据
    let res = ku9.get( requestUrl, headerStr );
    // 检查返回数据中是否包含http，如果没有，则使用不同的URL
    if (res.indexOf('http') === -1) {
        requestUrl = 'https://m.fengshows.com/api/v3/hub/live/auth-url?live_id=' + idStr + '&live_qa=HD&play_type=replay&ps_time=' + starttimeH + '&pe_time=' + endtimeH;        
        res = ku9.get( requestUrl, headerStr );
    }   
    // 解析返回的数据
    let json = JSON.parse(res);
    
    // 返回直播URL
    if (json && json.data && json.data.live_url) {
        const liveUrl = json.data.live_url;
        return liveUrl;
    } else {
        return null;
    }
}

function dateToUTCHex( time ){
//输入时间字符串；如 20241022190000
//输出十六进制时间戳字符串 毫秒；
    let t = ku9.toTimestamp( time , "yyyyMMddHHmmss" , "Asia/Shanghai" );
    return t.toString(16);
}

function getPlay( idStr, headerStr ){//获得直播地址
    // 构建请求URL
    let requestUrl = 'https://api.fengshows.cn/hub/live/auth-url?live_qa=fhd&live_id=' + idStr;    
    // 获取数据
    let res = ku9.get( requestUrl, headerStr );    
    // 检查返回数据中是否包含http，如果没有，则使用不同的URL
    if (res.indexOf('http') === -1) {
        requestUrl = 'https://api.fengshows.cn/hub/live/auth-url?live_qa=hd&live_id=' + idStr;
        res = ku9.get( requestUrl, headerStr );
    }   
    // 解析返回的数据
    let json = JSON.parse(res);
    
    // 返回直播URL
    if (json && json.data && json.data.live_url) {
        const liveUrl = json.data.live_url;
        return liveUrl;
    } else {
        return null;
    }
}
