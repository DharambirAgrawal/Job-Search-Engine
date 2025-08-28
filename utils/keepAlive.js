/**
 * Keep-Alive Service
 * 
 * This script creates a simple cron job that makes requests to the application 
 * at regular intervals to prevent it from sleeping on Render's free tier.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

class KeepAliveService {
  constructor(appUrl, interval = 14) {
    this.appUrl = appUrl;
    this.interval = interval; // Minutes
    this.isRunning = false;
    this.intervalId = null;
  }

  /**
   * Parse the URL to determine if it's HTTP or HTTPS
   * @param {string} url - The URL to parse
   * @returns {Object} - The parsed URL with protocol information
   */
  parseUrl(url) {
    const parsedUrl = new URL(url);
    return {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname || '/',
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      protocol: parsedUrl.protocol
    };
  }

  /**
   * Make a request to the application
   * @returns {Promise} - A promise that resolves when the request is complete
   */
  pingServer() {
    return new Promise((resolve, reject) => {
      try {
        const startTime = Date.now();
        const urlInfo = this.parseUrl(this.appUrl);
        
        const requestModule = urlInfo.protocol === 'https:' ? https : http;
        
        const req = requestModule.get({
          hostname: urlInfo.hostname,
          path: urlInfo.path,
          port: urlInfo.port
        }, (res) => {
          const duration = Date.now() - startTime;
          console.log(`[${new Date().toISOString()}] Keep-alive ping sent. Response: ${res.statusCode} (${duration}ms)`);
          
          // Consume response data to free up memory
          res.resume();
          resolve();
        });

        req.on('error', (err) => {
          console.error(`[${new Date().toISOString()}] Keep-alive error:`, err.message);
          reject(err);
        });

        req.end();
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Failed to send keep-alive ping:`, err);
        reject(err);
      }
    });
  }

  /**
   * Start the keep-alive service
   */
  start() {
    if (this.isRunning) {
      console.log('Keep-alive service is already running');
      return;
    }

    console.log(`Starting keep-alive service for ${this.appUrl} (interval: ${this.interval} minutes)`);
    
    // Immediately ping once
    this.pingServer().catch(err => console.error('Initial ping failed:', err));

    // Set up interval for regular pings
    const intervalMs = this.interval * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.pingServer().catch(err => console.error('Ping failed:', err));
    }, intervalMs);

    this.isRunning = true;
  }

  /**
   * Stop the keep-alive service
   */
  stop() {
    if (!this.isRunning) {
      console.log('Keep-alive service is not running');
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    console.log('Keep-alive service stopped');
  }
}

module.exports = KeepAliveService;
