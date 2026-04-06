import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Custom middleware to proxy /api/slots to cal.com with the API key as a query param
      // This mirrors exactly what functions/api/slots.js does in production
      middlewares: undefined,
      proxy: {
        '/api/slots': {
          target: 'https://api.cal.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/slots/, '/v1/slots'),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              const apiKey = env.VITE_CAL_API_KEY;
              if (!apiKey) return;
              const separator = proxyReq.path.includes('?') ? '&' : '?';
              proxyReq.path = `${proxyReq.path}${separator}apiKey=${apiKey}`;
            });
          }
        },
        '/api/book': {
          target: 'https://api.cal.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/book/, '/v1/bookings'),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              const apiKey = env.VITE_CAL_API_KEY;
              if (!apiKey) return;
              const separator = proxyReq.path.includes('?') ? '&' : '?';
              proxyReq.path = `${proxyReq.path}${separator}apiKey=${apiKey}`;
            });
          }
        }
      }
    }
  };
});
