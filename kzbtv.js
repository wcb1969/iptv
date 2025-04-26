function main(item) {
    if (!item.id) {
        return { error: "请指定url参数如 ?id=484）" };
    }

    const CACHE_KEY = "iptv_channel_list";
    const cachedList = ku9.getCache(CACHE_KEY);
    let list = cachedList ? JSON.parse(cachedList) : null;

    if (!list) {
        const apiUrl = "https://kzb29rda.com/prod-api/iptv/getIptvList?liveType=0&deviceType=1";
        const res = ku9.request(apiUrl);
        
        if (res.code !== 200) {
            return { error: `API请求失败（状态码 ${res.code}）` };
        }

        try {
            const data = JSON.parse(res.body);
            if (data.code !== "0") {
                return { error: `API错误：${data.msg || "未知错误"}` };
            }
            list = data.list;
            ku9.setCache(CACHE_KEY, JSON.stringify(list), 1800000);
        } catch (e) {
            return { error: "数据解析失败" };
        }
    }

    const target = list.find(ch => ch.id === parseInt(item.id));
    if (!target) {
        return { error: `未找到ID为 ${item.id} 的频道` };
    }

    return {
        url: target.play_source_url
    };
}
