@echo off
REM 검수 화면을 «내가 보고 싶을 때» 여는 파일. 바탕화면에 바로가기를 만들어 두면 편하다.
REM   2026-08-17 사장님: 「꼭 다시 열어 달라고 해야 열리나? 내가 보고 싶을때 보고 싶은데」
REM 이 창을 켜 두는 동안만 살아 있다. 다 보셨으면 창을 닫으면 된다.
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   카페인컬러 검수기를 켭니다. 20~30초 걸립니다.
echo   ※ 이 창을 닫으면 꺼집니다. 보시는 동안은 열어 두세요.
echo.
start "" http://localhost:3000/admin/sns
call npm run dev
pause
