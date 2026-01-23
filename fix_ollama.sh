#!/bin/bash
set -e

echo "🔧 Applying Ollama Fix for GTX 960M (Forcing CPU Mode)..."

# Create systemd override directory
sudo mkdir -p /etc/systemd/system/ollama.service.d

# Write override configuration
# We disable CUDA to prevent the crash on the older Maxwell GPU
echo "📝 Writing configuration..."
echo -e "[Service]\nEnvironment=\"CUDA_VISIBLE_DEVICES=\"\nEnvironment=\"OLLAMA_DEBUG=1\"" | sudo tee /etc/systemd/system/ollama.service.d/override.conf > /dev/null

# Reload systemd and restart Ollama
echo "🔄 Restarting Ollama service..."
sudo systemctl daemon-reload
sudo systemctl restart ollama

# Verify
echo "✅ Done! Verifying service status..."
systemctl status ollama --no-pager | head -n 10

echo ""
echo "🎉 Fix applied. You can now use Ollama normally."
