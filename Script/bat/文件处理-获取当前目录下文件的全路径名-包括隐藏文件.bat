
for /f "delims=" %%a in ('dir /a-d/b/s') do (
@echo %%a >> filename-list.txt
)
