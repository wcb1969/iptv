function main(item) {
    //杭州TV
    const id = item.id || 'hzzh';
    const channelMap = {
        hzzh: [16, 'hztv1'], //杭州综合
        hzmz: [17, 'hztv2'], //西湖明珠
        hzsh: [18, 'hztv3'], //杭州生活
        hzys: [21, 'hztv4'], //杭州影视
        hzqsty: [20, 'hztv5'], //青少体育
        hzds: [22, 'hztv6'], //杭州导视
        fyxwzh: [32, 'fyxwzh'] //富阳新闻综合
    };
    const channelInfo = channelMap[id];
    if (!channelInfo) return { url: 'ID不存在...' };

    const apiUrl = `https://mapi.hoolo.tv/api/v1/channel_detail.php?channel_id=${channelInfo[0]}`;
    const apiRes = ku9.request(apiUrl, 'GET', { Referer: 'https://tv.hoolo.tv/' });
    if (apiRes.code !== 200) return { url: '获取频道信息，Error...' };
    const data = JSON.parse(apiRes.body);
    const m3u8Url = data[0]?.m3u8;
     if (!m3u8Url) return { url: 'm3u8 Error...' };
    const uri = ku9.Uri(m3u8Url);
    const baseUrl = `${uri.Scheme}://${uri.Host}/`;
    const channelPath = `${baseUrl}${channelInfo[1]}/`;

    const liveRes = ku9.request(m3u8Url, 'GET', { Referer: 'https://tv.hoolo.tv/' });
    if (liveRes.code !== 200 || !liveRes.body) return { url: '无法获取数据...' };
    const liveContent = liveRes.body;
    
    let streamPath;
    if (['hzzh', 'hzmz', 'hzsh'].includes(id)) {
        const hdPos = liveContent.indexOf('hd');
        if (hdPos === -1) return { url: '' };
        streamPath = liveContent.slice(hdPos);
    } else {
        const sdPos = liveContent.indexOf('sd');
        if (sdPos === -1) return { url: '' };
        const sdContent = liveContent.slice(sdPos);
        const extPos = sdContent.indexOf('#EXT');
        streamPath = extPos > -1 ? sdContent.substring(0, extPos) : sdContent;
    }
    const finalUrl = channelPath + streamPath;
    const finalRes = ku9.request(finalUrl, 'GET', { Referer: 'https://tv.hoolo.tv/' });
    if (finalRes.code !== 200 || !finalRes.body) {
        return { url: '' };
    }
    const proxyM3U8 = finalRes.body.replace(/\/(.*?\.ts)/gi, `${baseUrl}$1`);
    return { m3u8: proxyM3U8, headers: { Referer: 'https://tv.hoolo.tv/' }};
}
