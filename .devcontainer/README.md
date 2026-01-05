# Development Container Configuration

This directory contains the Dev Container configuration for the RAG AI Agent project.

## Quick Start

### Using VS Code

1. Install the **Dev Containers** extension in VS Code
2. Open the repository root in VS Code
3. Click the green button in the bottom-left corner
4. Select **"Reopen in Container"**
5. VS Code will automatically build and start the development container

### Using Command Line

```bash
# Build the container
docker build -t rag-agent-dev -f .devcontainer/Dockerfile .

# Run the container
docker run -it --rm \
  -v $(pwd):/workspaces/RAG-AG_UI-COLE_MEDIN \
  -p 3000:3000 \
  -p 8000:8000 \
  -p 5173:5173 \
  rag-agent-dev
```

## Files in This Directory

- **devcontainer.json** - VS Code Dev Container configuration
- **Dockerfile** - Custom Docker image with Python, Node.js, and development tools
- **post-create.sh** - Setup script that runs after container creation
- **README.md** - This file

## Features

✅ Python 3.11 environment  
✅ Node.js 18 environment  
✅ VS Code extensions pre-installed  
✅ Automatic dependency installation  
✅ Port forwarding (3000, 8000, 5173)  
✅ Non-root user for security  

## Troubleshooting

If you experience issues:

1. **Rebuild the container**: Delete the `.devcontainer/.docker` folder and reopen in VS Code
2. **Check ports**: Ensure ports 3000, 8000, and 5173 are available
3. **View logs**: Check the "Dev Container" output panel in VS Code

## Documentation

For more information, see [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
