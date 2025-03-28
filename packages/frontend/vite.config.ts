import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [ react() ],
    server: {
        port: 5173,
        allowedHosts: [
            '730d-194-87-30-250.ngrok-free.app', // Ваш ngrok-хост
            'localhost', // Для локального тестирования
        ],
    },
})
