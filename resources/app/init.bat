@echo offset
if exist "%cd%\resources\app\run_info\Students.txt" del /Q %cd%\resources\app\run_info\Students.txt
copy /Y %cd%\resources\app\run_info\student.xls %cd%\resources\app\student.xls
echo.>%cd%\resources\app\data.txt
echo.>%cd%\resources\app\team.txt