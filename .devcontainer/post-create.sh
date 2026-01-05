#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up development environment..."

# Update package managers
sudo apt-get update
sudo apt-get install -y build-essential curl git

# Setup Python environment
echo "📦 Setting up Python dependencies..."
cd /workspaces/RAG-AG_UI-COLE_MEDIN

# Install uv if not already installed
if ! command -v uv &> /dev/null; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Install Python dependencies in agent folder
if [ -f "agent/pyproject.toml" ]; then
    echo "Installing agent dependencies..."
    cd agent
    uv sync
    cd ..
fi

# Setup Node.js environment
echo "🟢 Setting up Node.js dependencies..."
if [ -f "frontend/package.json" ]; then
    cd frontend
    npm install
    cd ..
fi

echo "✅ Development environment setup complete!"
echo "📝 Next steps:"
echo "  - Backend: cd agent && uv run python main.py"
echo "  - Frontend: cd frontend && npm run dev"
