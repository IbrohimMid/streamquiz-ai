#!/bin/bash
set -e

echo "🧹 Cleaning up Ollama processes..."

# Stop service
echo "🛑 Stopping Ollama service..."
sudo systemctl stop ollama || true

# Kill any lingering processes
echo "🔪 Killing lingering Ollama processes..."
sudo killall -9 ollama || true
sudo fuser -k 11434/tcp || true

# Wait a moment
sleep 2

# Restart service
echo "🔄 Starting Ollama service..."
sudo systemctl start ollama

# Verify
echo "✅ Checking status..."
systemctl status ollama --no-pager | head -n 10

echo ""
echo "🎉 Cleanup complete. Try running 'npm run dev:all' again."
