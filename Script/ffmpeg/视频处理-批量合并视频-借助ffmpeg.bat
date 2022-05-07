SetLocal EnableDelayedExpansion
echo.>list.txt
for /f "delims=" %%a in ('dir /b/a-d *.mp4') do (
echo file '%cd%\%%a' >> list.txt
)
ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4
pause

rem 需要安装 ffmpeg
rem 文件路径不能包含空格，标点或者特殊符号
rem *.mp4 限定了遍历文件的视频格式
rem out.mp4 指定了输出视频的格式
rem -safe 0: 防止 Operation not permitted

