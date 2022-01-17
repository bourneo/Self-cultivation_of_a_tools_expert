rem 获取当前目录下文件的全路径名.bat

for /r %%i in (*.*) do (
echo %%i >> filename-list.txt
)
