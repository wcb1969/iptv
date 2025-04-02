#!/bin/sh

if ! [ "$1" ] ; then
echo $0 txt文件 ip:port
echo $0 北京电信.txt 192.168.1.1:18022
exit
fi
name=${1%.txt}
m3u8=$name.m3u8
if [ "$2" ] ; then
ip=$2
else
ip=192.168.1.1:18022
fi
echo "#EXTM3U name=\"$name\"" >$m3u8
cat $1 |tr ',/:' '   ' |awk -v ip="$ip" '{print "#EXTINF:-1,"$1"\r\nhttp://"ip"/"$2"/"$3":"$4}' >> $m3u8
ls -l $name.*
