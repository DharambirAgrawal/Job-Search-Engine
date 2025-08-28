web: node api/server.js
keepalive: node -e "setInterval(() => fetch('${APP_URL}/api/health/ping').then(r => console.log('Ping successful:', new Date().toISOString())).catch(e => console.error('Ping failed:', e)), ${KEEP_ALIVE_INTERVAL:-14}*60*1000)"
