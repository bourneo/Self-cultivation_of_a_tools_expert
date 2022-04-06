REM Download ffmpeg from https://www.ffmpeg.org/download.html.
REM Place ffmpeg.exe in the folder with the vob files

REM Merge all vob files into one
REM VTS_01_0.VOB is usually the menu which you may not want
if exist VTS_01_7.VOB (
copy /b VTS_01_1.VOB+VTS_01_2.VOB+VTS_01_3.VOB+VTS_01_4.VOB+VTS_01_5.VOB+VTS_01_6.VOB+VTS_01_7.VOB ConCat.vob
) else if exist VTS_01_6.VOB (
copy /b VTS_01_1.VOB+VTS_01_2.VOB+VTS_01_3.VOB+VTS_01_4.VOB+VTS_01_5.VOB+VTS_01_6.VOB ConCat.vob
) else if exist VTS_01_5.VOB (
copy /b VTS_01_1.VOB+VTS_01_2.VOB+VTS_01_3.VOB+VTS_01_4.VOB+VTS_01_5.VOB ConCat.vob
) else if exist VTS_01_4.VOB (
copy /b VTS_01_1.VOB+VTS_01_2.VOB+VTS_01_3.VOB+VTS_01_4.VOB ConCat.vob
) else if exist VTS_01_3.VOB (
copy /b VTS_01_1.VOB+VTS_01_2.VOB+VTS_01_3.VOB ConCat.vob
) else if exist VTS_01_2.VOB (
copy /b VTS_01_1.VOB+VTS_01_2.VOB ConCat.vob
) else (
copy /b VTS_01_1.VOB ConCat.vob
)


REM Store the name of the folder
for %%I in (.) do set CurrDirName=%%~nxI

REM Convert that single vob into mp4
ffmpeg -loglevel warning -i "ConCat.vob" -codec:a copy -codec:v libx264 "%CurrDirName%.mp4"

REM I run into an issue with one DVD where audio was encoded with pcm_dvd
REM which is not supported by x264
REM Stream #0:2[0xa0]: Audio: pcm_dvd, 48000 Hz, stereo, s16, 1536 kb/s
REM To fix that, I encoded audio as well (instead of copy done above)
REM ffmpeg -i "ConCat.vob" -codec:a ac3 -codec:v libx264 "ConCat.mp4"

REM Wait for input to exit batch
pause