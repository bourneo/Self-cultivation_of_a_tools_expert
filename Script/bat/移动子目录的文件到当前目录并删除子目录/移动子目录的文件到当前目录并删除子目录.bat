rem 移动子目录的文件到当前目录并删除子目录.bat

@echo off
attrib -s -h -r -a
for /f "delims=" %%i in ('dir /a:-d/b/s') do ( move /y "%%i" "%cd%" )
for /f "delims=" %%j in ('dir /a:d/b') do ( RD /s/q "%%j" )
exit
