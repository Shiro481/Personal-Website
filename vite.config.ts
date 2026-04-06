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
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              const apiKey = env.VITE_CAL_API_KEY;
              if (!apiKey) return;
              
              if (req.method === 'POST') {
                // Read input body to extract query parameters for Cal API v1 slots endpoint
                let bodyData = '';
                req.on('data', (chunk) => { bodyData += chunk; });
                req.on('end', () => {
                  try {
                    const { eventTypeId, startTime, endTime } = JSON.parse(bodyData);
                    proxyReq.path = `/v1/slots?apiKey=${apiKey}&eventTypeId=${eventTypeId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;
                    proxyReq.method = 'GET';
                    proxyReq.setHeader('Content-Length', '0');
                  } catch (e) {
                    console.error('Error parsing proxy body for slots:', e);
                  }
                });
              }
            });
          }
        },
        '/api/book': {
          target: 'https://api.cal.com',
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              const apiKey = env.VITE_CAL_API_KEY;
              if (!apiKey) return;
              
              // Cal.com API v1 requires apiKey as a query parameter even on POST
              const originalPath = '/v1/bookings';
              proxyReq.path = `${originalPath}?apiKey=${apiKey}`;
            });
          }
        }
      }
    }
  };
});
