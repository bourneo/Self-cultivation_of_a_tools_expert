
SetLocal EnableDelayedExpansion
echo.>filename-list.txt
for /f "delims=" %%a in ('dir /b/a-d *.webm') do (
echo file '%cd%\%%a' >> filename-list.txt
)
ffmpeg.exe -f concat -safe 0 -i filename-list.txt -c copy out.webm
pause

rem 需要安装 ffmpeg
rem 文件路径不能包含空格，标点或者特殊符号
rem *.webm 限定了遍历文件的视频格式
rem out.webm 指定了输出视频的格式
rem -safe 0: 防止 Operation not permitted

