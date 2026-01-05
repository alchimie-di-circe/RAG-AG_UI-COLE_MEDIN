# 🔐 Setup with 1Password + direnv (ZERO Manual Key Entry)

This guide explains how to set up the devcontainer to **automatically load API keys from your 1Password vault** using `direnv`. You will **NOT** need to manually copy-paste keys!

## Prerequisites

✅ **1Password account** with your API keys stored  
✅ **1Password CLI** installed (`op`) - included in devcontainer feature  
✅ **direnv installed** - included in devcontainer feature  

## Step 1: Prepare Your 1Password Vault

Make sure your API keys are organized in 1Password:

```
Your Vault Name/
└── RAG-Agent/
    ├── copilotkit_api_key
    ├── openai_api_key
    ├── anthropic_api_key
    ├── tavily_api_key
    ├── langsmith_api_key
    └── (other secrets)
```

**How to create this structure in 1Password:**

1. Open 1Password app
2. Create a new Login item called "RAG-Agent"
3. Add custom fields for each API key:
   - Field Name: `copilotkit_api_key` → Value: your actual key
   - Field Name: `openai_api_key` → Value: your actual key
   - etc.
4. Note your vault name (usually "Personal" or "Private")

## Step 2: Clone & Configure the Repository

```bash
# Clone the repo
git clone https://github.com/alchimie-di-circe/RAG-AG_UI-COLE_MEDIN.git
cd RAG-AG_UI-COLE_MEDIN

# Checkout devcontainer branch
git checkout devcontainer

# EDIT .envrc with your vault details
nano .envrc
```

## Step 3: Update .envrc with Your Vault Path

Edit `.envrc` and replace:

```bash
# FROM THIS:
op read "op://Your Vault Name/RAG-Agent/copilotkit_api_key"

# TO THIS (your actual vault name):
op read "op://Personal/RAG-Agent/copilotkit_api_key"
# OR
op read "op://Private/RAG-Agent/copilotkit_api_key"
```

**Find your vault name:**

```bash
op vault list
```

Do this for ALL API keys in `.envrc`.

## Step 4: Authenticate with 1Password CLI

Once inside the container or in your terminal:

```bash
# Add your 1Password account
op account add

# Follow the prompts to authenticate
# You'll be asked for your 1Password email, password, and secret key
```

## Step 5: Open in Dev Container

```bash
# Open VS Code
code .

# Then:
# 1. Press Cmd+Shift+P
# 2. Type "Dev Containers: Reopen in Container"
# 3. Wait for the container to build
```

## Step 6: Allow direnv (ONE TIME)

When you enter the container:

```bash
# You'll see a message:
# direnv: error: .envrc is blocked. Run: direnv allow

# Run this command:
direnv allow

# Verify secrets loaded:
echo $COPILOTKIT_API_KEY
echo $OPENAI_API_KEY
```

If you see your actual keys printed → **Success! ✅**

## Step 7: Verify Setup

```bash
# All these should show your real API keys:
echo $COPILOTKIT_API_KEY
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY
echo $TAVILY_API_KEY
echo $LANGSMITH_API_KEY

# Start the services
docker-compose up -d

# Backend should be ready
curl http://localhost:8000/docs  # Should show Swagger UI

# Frontend development
cd frontend
npm run dev
# Visit http://localhost:3000
```

## ✅ Result

- **Zero hardcoded secrets** in your repository
- **All keys loaded automatically** from 1Password vault
- **Secrets never exposed** in .env files or git history
- **Team-friendly** - each teammate uses their own 1Password vault
- **Audit trail** - 1Password logs all access to your secrets

## 🔐 Security Best Practices

✅ **DO:**
- Store API keys in 1Password vault
- Use `op read` in .envrc to inject them at runtime
- Let direnv auto-load them when you cd into the directory
- Rotate API keys periodically
- Enable 1Password 2FA

❌ **DON'T:**
- Commit .env with real keys
- Copy-paste keys into terminals
- Share vault access with untrusted parties
- Use the same key across projects

## Troubleshooting

**"op: command not found"**  
→ direnv not loaded, run: `direnv allow`

**"op read" returns empty or error**  
→ Check 1Password CLI is authenticated: `op account get`

**Keys not loading in container**  
→ Make sure you've updated .envrc with correct vault path

**Permission denied on .envrc**  
→ Run: `chmod +x .envrc`
