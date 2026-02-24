@echo off
echo Installing frontend dependencies...

REM Change to the frontend directory
cd /d "g:\Shipping web\frontend"

REM Install packages needed for the React app
npm install react-router-dom
npm install axios
npm install @types/node @types/react @types/react-dom @types/react-router-dom
npm install tailwindcss postcss autoprefixer

REM Initialize Tailwind
npx tailwindcss init -p

echo Frontend setup complete!
pause