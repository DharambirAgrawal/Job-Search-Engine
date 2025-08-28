#!/usr/bin/env node

/**
 * Render Cron Job Setup Script
 * 
 * This script creates a cron job on Render using their API.
 * This is an alternative to using render.yaml if you need more control.
 * 
 * Prerequisites:
 * - Render API key with appropriate permissions
 * - Your web service must already be deployed
 * 
 * Usage:
 * RENDER_API_KEY=your_api_key node setup-render-cron.js
 */

const https = require('https');

// Configuration
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const SERVICE_ID = process.env.RENDER_SERVICE_ID;
const APP_URL = process.env.APP_URL;

if (!RENDER_API_KEY || !SERVICE_ID || !APP_URL) {
  console.error('Error: Missing required environment variables.');
  console.error('Please set RENDER_API_KEY, RENDER_SERVICE_ID, and APP_URL.');
  process.exit(1);
}

// Cron job configuration
const cronJob = {
  name: 'job-search-engine-keep-alive',
  schedule: '*/14 * * * *', // Every 14 minutes
  command: `curl -f ${APP_URL}/api/health/ping`,
  serviceId: SERVICE_ID
};

// Create the cron job
function createCronJob() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(cronJob);
    
    const options = {
      hostname: 'api.render.com',
      port: 443,
      path: '/v1/cronjobs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`HTTP Error: ${res.statusCode} - ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Execute
createCronJob()
  .then((response) => {
    console.log('Cron job created successfully:');
    console.log(JSON.stringify(response, null, 2));
  })
  .catch((error) => {
    console.error('Failed to create cron job:', error.message);
  });
