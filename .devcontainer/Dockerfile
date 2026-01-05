# This Dockerfile extends the official Python image with additional tooling
# It's automatically used by VS Code's Dev Containers feature

FROM mcr.microsoft.com/devcontainers/python:3.12-bullseye

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager (Python)
RUN pip install --no-cache-dir uv

# Install PostgreSQL client and other database tools
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*
