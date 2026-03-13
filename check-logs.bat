@echo off
echo Monitoring NutriCare Oracle logs...
echo Press Ctrl+C to stop
echo.
%ANDROID_HOME%\platform-tools\adb.exe -s 9624838761000DI logcat | findstr /i "Chat Voice Whisper Recording MelangeModule nutricareoracle"
