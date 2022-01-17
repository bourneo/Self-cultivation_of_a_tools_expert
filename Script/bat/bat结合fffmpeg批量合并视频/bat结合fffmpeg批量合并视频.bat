rem bat结合fffmpeg批量合并视频.bat

SetLocal EnableDelayedExpansion
echo.>file-list.txt
for /f "delims=" %%a in ('dir /b/a-d *.webm') do (
echo file '%cd%\%%a' >> file-list.txt
)
ffmpeg.exe -f concat -safe 0 -i file-list.txt -c copy out.webm
pause

rem 需要安装 ffmpeg
rem -safe 0: 防止 Operation not permitted
rem *.webm 限定了遍历文件的视频格式
rem out.webm 指定了输出视频的格式
