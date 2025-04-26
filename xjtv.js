function main(item) {
    const id = item.id || 'xjws';
    const n = {
        'xjws': 1,    // 新疆卫视
        'xjwyzh': 3,  // 新疆维语综合
        'xjhyzh': 4,  // 新疆哈语综合
        'xjzy': 16,   // 新疆综艺
        'xjwyys': 17, // 新疆维语影视
        'xjjjsh': 18, // 新疆经济生活
        'xjhyzy': 19, // 新疆哈语综艺
        'xjwyjjsh': 20, // 新疆维语经济生活
        'xjtyjk': 21, // 新疆体育健康
        'xjxxfw': 22, // 新疆信息服务
        'xjse': 23    // 新疆少儿频道
    };    
    const t = Math.round(Date.now());
    const sign = ku9.md5(`@#@$AXdm123%)(ds${t}api/TVLiveV100/TVChannelList`);
    const url = `https://slstapi.xjtvs.com.cn/api/TVLiveV100/TVChannelList?type=1&stamp=${t}&sign=${sign}`;
    const res = ku9.request(url);
    if (res.code === 200) {
        const data = JSON.parse(res.body).data;
        let playurl = '';
        for (const v of data) {
            if (n[id] === v.Id) {
                playurl = v.PlayStreamUrl;
                break;
            }
        }
        if (playurl) {
            return { url: playurl };
        } else {
            return { error: "URL Error..." };
        }
    } else {
        return { error: "获取数据出错..." };
    }
} 
