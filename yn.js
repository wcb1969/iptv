function main(item) {
    const id = item.id || 'ynws';
    
    const channelMap = {
        "ynws": "yunnanweishi",
        "ynds": "yunnandushi",
        "ynyl": "yunnanyule",
        "ynkl": "yunnangonggong",
        "yngj": "yunnanguoji",
        "ynse": "yunnanshaoer"
    };

    const apiUrl = `https://api.yntv.ynradio.com/index/jmd/getRq?name=${channelMap[id]}`;
    const headers = {
        'Referer': 'https://www.yntv.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
    };

    // 获取直播凭证
    const res = ku9.request(apiUrl, "GET", headers);
    if (!res.body) return JSON.stringify({});
    
    try {
        const data = JSON.parse(res.body);
        const liveUrl = `https://tvlive.yntv.cn${data.url}?wsSecret=${data.string}&wsTime=${data.time}`;
        
        return JSON.stringify({
            url: liveUrl,
            headers: {
                'Referer': 'https://www.yntv.cn/',
                'User-Agent': headers['User-Agent']
            }
        });
    } catch (e) {
        return JSON.stringify({});
    }
}
