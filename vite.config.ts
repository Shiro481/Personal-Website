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
          rewrite: (_path) => {
            // The actual URL rewrite with apiKey happens in configure below
            return '/v1/slots';
          },
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              const apiKey = env.VITE_CAL_API_KEY;
              if (!apiKey) return;

              // Read the POST body to extract params and rebuild the URL with apiKey
              // For GET-style params the rewrite already handles the path
              // We append the apiKey to the query string on the outgoing request
              const originalPath = proxyReq.path;
              const separator = originalPath.includes('?') ? '&' : '?';
              proxyReq.path = `${originalPath}${separator}apiKey=${apiKey}`;

              // If this is a POST (from BookingPage), also handle forwarding body
              if (req.method === 'POST') {
                let body = '';
                req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
                req.on('end', () => {
                  try {
                    const { eventTypeId, startTime, endTime } = JSON.parse(body);
                    const calPath = `/v1/slots?apiKey=${apiKey}&eventTypeId=${eventTypeId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;
                    proxyReq.path = calPath;
                    proxyReq.method = 'GET';
                    proxyReq.removeHeader('content-length');
                    proxyReq.removeHeader('content-type');
                  } catch (_e) {
                    // ignore parse errors
                  }
                });
              }
            });
          }
        }
      }
    }
  };
});
