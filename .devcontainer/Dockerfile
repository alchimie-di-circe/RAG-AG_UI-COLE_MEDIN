# This Dockerfile extends the official Python image with additional tooling
# It's automatically used by VS Code's Dev Containers feature

FROM mcr.microsoft.com/devcontainers/python:3.11-bullseye

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (for frontend development)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

# Create a non-root user for development
RUN useradd -m -s /bin/bash devuser
USER devuser

# Set working directory
WORKDIR /workspaces/RAG-AG_UI-COLE_MEDIN

# Expose ports for development
EXPOSE 3000 8000 5173

CMD ["/bin/bash"]
