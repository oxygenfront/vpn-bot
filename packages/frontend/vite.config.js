import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        allowedHosts: ['a79a-212-193-1-106.ngrok-free.app', 'vpn-by-oxy.ru', 'localhost'],
    },
});
