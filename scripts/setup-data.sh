#!/bin/bash

# Create data directory and seed database if needed
# This script is called during the build process on Render

echo "Setting up data directory..."

# Create data directory if it doesn't exist
if [ ! -d "./data" ]; then
  echo "Creating data directory..."
  mkdir -p ./data
fi

# Check if database is already seeded
if [ ! -f "./data/users.db" ] || [ ! -f "./data/jobs.db" ]; then
  echo "Seeding database..."
  node db/seed.js
else
  echo "Database already exists, skipping seed."
fi

echo "Setup complete."
