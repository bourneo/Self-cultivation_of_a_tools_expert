# FFmpeg 视频音频处理

---

## FFmpeg 精要

---

### 命令格式

```
ffmpeg {全局参数} {输入文件参数} -i {输入文件} {输出文件参数} {输出文件}
```

### 命令参数

| 命令 | 简介 | 备注 |
|:---|:---|:---|
| -i | 设置输入文件 | input |
| -f | 设置输出格式 | format |
| -c copy | 直接复制，不经过重新编码（这样比较快） |  |
| -c:v | 设置视频编码器 | 相当于 -vcodec，是 -codec:v 的简写 |
| -c:a | 设置音频编码器 | 相当于 -acodec，是 -codec:a 的简写 |
| -c:s | 设置字幕编码器 | 相当于 -scodec，是 -codec:s 的简写 |
| -b:v | 设置输出视频的比特率 | bit |
| -b:a | 设置输出音频的比特率 | bit |
| -ss | 设置开始时间 |  |
| -t | 设置持续时间 |  |
| -to | 设置结束时间 |  |
| -vf | 创建和设置过滤图，并用它来过滤流 |  |
| -vf scale= | 设置输出视频的宽度和高度 |  |
| -vf setsar= | 设置过滤器输出视频的样本纵横比 |  |
| -vf subtitles= | 设置字幕 |  |
| -loop 1 | 无限循环 |  |
| -shortest | 让生成的视频最短化 |  |
| -vn | 去除视频流 | video not |
| -an | 去除音频流 | audio not |
| -ar | 设置音频码率 | audio rate |
| -ac | 设置声道数 | 1：单声道；2：立体声；转换单声道的 TVrip 可以用 1（节省一半容量） |
| -frames:v | 设置要输出的视频帧数 | 缩写：-vframes；相当于 -filter:v |
| -crf | 质量控制 | 参数的设置范围是 0~50，数值越小代表清晰度越高，建议值域为 18~28。 |
|<img width=300px/>|<img width=500px/>|<img width=400px/>|

---


备注：

关于 crf 的值：

量化器标度的范围是 0-51：其中 0 是无损，23 是默认值，51 是最坏的。较低的值表示较高的质量，主观上合理的范围是 18-28。

将 18 视为视觉无损或接近无损：它应该与输入看起来相同或几乎相同，但在技术上并非无损。

范围是指数级的，因此增加 CRF 值 +6 大约是比特率的一半，而 -6 大约是比特率的两倍。

一般用法是选择仍能提供可接受质量的最高 CRF 值。如果输出看起来不错，则尝试更高的值，如果看起来很差，则选择较低的值。

## FFmpeg 使用实例——截取操作

---

### 视频截取

```
// FFmpeg 截视频默认采用关键帧，所以输出的时间和设置的时间，可能有若干秒的误差
ffmpeg -i 漠河舞厅.mp4 -ss 00:02:25 -to 00:05:34 -c copy output1.mp4
```

```
// FFmpeg 截视频默认采用关键帧，所以输出的时间和设置的时间，可能有若干秒的误差
ffmpeg -i 漠河舞厅.mp4 -ss 00:02:25 -t 00:02:00 -c copy output2.mp4
```

### 音频截取

```
ffmpeg -i 漠河舞厅.mp3 -ss 00:02:24.5 -to 00:05:38 -c copy output1.mp3
```

```
ffmpeg -i 漠河舞厅.mp3 -ss 00:02:24.5 -t 00:02:00 -c copy output2.mp3
```

---

## FFmpeg 使用实例——提取操作

---

### 从视频提取音频

提取 mp3 格式：

```
ffmpeg -i 漠河舞厅.mp4 -acodec libmp3lame output1.mp3
```

```
ffmpeg -i 漠河舞厅.mp4 -f mp3 -vn output1.mp3
```

```
ffmpeg -i 漠河舞厅.mp4 output1.mp3
```

```
ffmpeg -i 漠河舞厅.mp4 -f mp3 -ar 16000 output1.mp3
```

提取 m4a 格式：

```
ffmpeg -i 漠河舞厅.mp4 -acodec copy -vn output1.m4a
```

提取 aac 格式：

```
ffmpeg -i 漠河舞厅.mp4 -acodec copy -vn output1.aac
```

提取 wav 格式：

```
ffmpeg -i 漠河舞厅.mp4 -ac 1 -ar 16000 -f wav output1.wav
```

```
ffmpeg -i 漠河舞厅.mp4 -acodec pcm_s16le -f s16le -ac 1 -ar 16000 -f wav output1.wav
```

### 视频提取的某一帧

```
ffmpeg -i 漠河舞厅.mp4 -ss 00:00:01 -frames:v 1 output1.png
```

### 视频提取封面

```
ffmpeg -i 漠河舞厅.mp4 -map 0:v -map -0:V -c copy cover.png
```

如果报错信息是：Output file #0 does not contain any stream，说明视频未附有封面。

在文件浏览器看到的封面，只是解码器读到的关键帧缩略图，提取封面就是提取那一帧。

---

## FFmpeg 使用实例——添加操作

---

### 音频和图片合在一起，转成视频

```
ffmpeg -loop 1 -i 漠河舞厅.jpg -i 漠河舞厅.mp3 -c:v libx264 -c:a aac -b:a 330k -vf scale=1080:1080 -shortest output1.mp4
```

### 视频加字幕

加硬字幕：

```
// 直接复制音频可以防止音频压缩
ffmpeg -i 漠河舞厅.mp4 -vf subtitles=漠河舞厅.ass -c:a copy output1.mp4
```

加软字幕：

```
ffmpeg -i 漠河舞厅.mp4 -i 漠河舞厅.ass -c copy -c:s mov_text output2.mp4
```

### 视频加封面

```
ffmpeg -i 漠河舞厅.mp4 -i output1.png -map 0 -map 1 -c copy -c:v:1 png -disposition:v:1 attached_pic output1.mp4
```

---

## FFmpeg 使用实例——转码操作

---

### dvd / iso 直接转 mp4

ffmpeg -i 漠河舞厅.iso -preset superfast -vf yadif -crf 18 output-1.mp4

### vob 格式转 mp4

ffmpeg -i 漠河舞厅.vob output-1.mp4

ffmpeg -i "concat:VTS_01_1.VOB|VTS_01_2.VOB" -vcodec libx265 new-video-h265.mp4

ffmpeg -i 漠河舞厅.vob -c:v libx264 -crf 10 -vf "yadif; scale=1620:1080" -c:a aac -b:a 448k -metadata
title="Movie name" output-1.mp4

ffmpeg -i 漠河舞厅.vob -c:a aac -aq 100 -c:v libx264 -c:s mov_text -map 0:1 -map 0:2 -map 0:3 -movflags
+faststart -vb 1000k -maxrate 1500k -bufsize 500k 漠河舞厅.mp4

### vob 格式转 mkv

ffmpeg -i output.vob -preset superfast -crf 21 \
-c:a ac3 -c:s copy \
-map 0:1 -map 0:2 -map 0:3 -map 0:4 -map 0:5 \
output.mkv


---


---


---

参考链接：

- [FFmpeg 官方英文文档](https://ffmpeg.org/ffmpeg.html)
- [FFmpeg 命令详解](https://www.cnblogs.com/vicowong/archive/2011/03/08/1977088.html)
- []()

---



