#!/usr/bin/env node

/**
 * Render Keep-Alive Script
 * 
 * This script is used by the Render cron job to ping the application
 * and keep it awake. It uses both fetch and curl as fallbacks.
 */

const { exec } = require('child_process');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Get the URL to ping from environment variable
const appUrl = process.env.APP_URL;
const pingPath = '/api/health/ping';

if (!appUrl) {
  console.error('Error: APP_URL environment variable is required.');
  process.exit(1);
}

// Construct the full URL
const pingUrl = new URL(pingPath, appUrl).toString();
console.log(`Pinging ${pingUrl} at ${new Date().toISOString()}`);

// Function to make an HTTP request
function httpRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestModule = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = requestModule.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: data });
        } else {
          reject(new Error(`HTTP error: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Function to use curl as a fallback
function curlRequest(url) {
  return new Promise((resolve, reject) => {
    exec(`curl -s -f "${url}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      if (stderr) {
        reject(new Error(stderr));
        return;
      }
      
      resolve({ statusCode: 200, body: stdout });
    });
  });
}

// Try with HTTP request first, then fall back to curl if needed
httpRequest(pingUrl)
  .then(response => {
    console.log(`Success! Status code: ${response.statusCode}`);
    console.log(`Response: ${response.body}`);
  })
  .catch(error => {
    console.error(`HTTP request failed: ${error.message}`);
    console.log('Falling back to curl...');
    
    return curlRequest(pingUrl)
      .then(response => {
        console.log(`Curl success! Response: ${response.body}`);
      })
      .catch(curlError => {
        console.error(`Curl also failed: ${curlError.message}`);
        process.exit(1);
      });
  });
