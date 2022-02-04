## ffmpeg 视频音频处理

---

#### ffmpeg 精要

###### 命令格式

```
ffmpeg {全局参数} {输入文件参数} -i {输入文件} {输出文件参数} {输出文件}
```

###### 命令参数

| 命令 | 简介 |
| --- | --- |
| -i | 设置输入文件
| -c copy | 直接复制，不经过重新编码（这样比较快）
| -c:v | 设置视频编码器，相当于 -vcodec，是 -codec:v 的简写
| -c:a | 设置音频编码器，相当于 -acodec，是 -codec:a 的简写
| -c:s | 设置字幕编码器，相当于 -scodec，是 -codec:s 的简写
| -b:v | 设置输出视频的比特率
| -b:a | 设置输出音频的比特率
| -ss | 设置开始时间
| -t | 设置持续时间
| -to | 设置结束时间
| -vf | 创建和设置过滤图，并用它来过滤流
| -vf scale= | 设置输出视频的宽度和高度
| -vf setsar= | 设置过滤器输出视频的样本纵横比
| -vf subtitles= | 设置字幕
| -loop 1 | 无限循环
| -shortest | 让生成的视频最短化
| -vn | 去除视频流
| -an | 去除音频流
| -vframes | 设置要输出的视频帧数，相当于 -filter:v
|<img width=400px/>|<img width=500px/>|

###### 截取视频

```
// ffmpeg 截视频默认采用关键帧，所以输出的时间和设置的时间，可能有若干秒的误差
ffmpeg -ss 00:02:25 -i 漠河舞厅.mp4 -to 00:05:34 -c copy output1.mp4
```

###### 截取音频

```
ffmpeg -ss 00:02:24.5 -i 漠河舞厅.mp3 -to 00:05:38 -c copy output1.mp3
```

###### 音频转视频（加封面）

```
ffmpeg -loop 1 -i 漠河舞厅.jpg -i 漠河舞厅.mp3 -c:v libx264 -c:a aac -b:a 330k -vf scale=1080:1080 -shortest output1.mp4
```

###### 视频加字幕

```
// 加硬字幕：
// 直接复制音频可以防止音频压缩
ffmpeg -i 漠河舞厅.mp4 -vf subtitles=漠河舞厅.ass -c:a copy output1.mp4
```

```
// 加软字幕：
ffmpeg -i 漠河舞厅.mp4 -i 漠河舞厅.ass -c copy -c:s mov_text output2.mp4
```

---



