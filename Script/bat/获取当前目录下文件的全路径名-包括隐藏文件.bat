rem 获取当前目录下文件的全路径名-包括隐藏文件.bat

for /f "delims=" %%a in ('dir /a-d/b/s') do (
@echo %%a >> filename-list.txt
)
