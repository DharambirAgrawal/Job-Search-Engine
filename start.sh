#!/bin/bash

echo "Starting Job Search Engine..."

# Check if data directory exists, create if not
if [ ! -d "./data" ]; then
  echo "Creating data directory..."
  mkdir -p ./data
fi

# Check if database is already seeded
if [ ! -f "./data/users.db" ] || [ ! -f "./data/jobs.db" ]; then
  echo "Seeding database..."
  node db/seed.js
fi

# Start the server
echo "Starting server..."
node api/server.js
