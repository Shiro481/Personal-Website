import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api/slots': {
          target: 'https://api.cal.com/v1/slots',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/slots/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              if (env.VITE_CAL_API_KEY) {
                // Cal.com API v1 uses 'apiKey' header or query param
                proxyReq.setHeader('apiKey', env.VITE_CAL_API_KEY);
              }
            });
          }
        }
      }
    }
  };
});
