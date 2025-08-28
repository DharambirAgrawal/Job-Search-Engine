#!/usr/bin/env node

/**
 * Keep-Alive Test Script
 * 
 * This script tests the keep-alive service without having to run the entire server.
 * Useful for verifying that the keep-alive service is working properly before deployment.
 */

const KeepAliveService = require('./utils/keepAlive');

// Parse command line arguments
const args = process.argv.slice(2);
const url = args[0] || 'http://localhost:3000';
const interval = parseInt(args[1] || '1', 10);

console.log(`Starting keep-alive test for ${url} (interval: ${interval} minutes)`);

// Create and start the keep-alive service
const keepAliveService = new KeepAliveService(url, interval);
keepAliveService.start();

console.log('Press Ctrl+C to stop');

// Keep the script running
process.stdin.resume();

// Handle termination signals
process.on('SIGINT', () => {
  console.log('\nStopping keep-alive service');
  keepAliveService.stop();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('\nStopping keep-alive service');
  keepAliveService.stop();
  process.exit();
});
