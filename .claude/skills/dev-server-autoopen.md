# Dev Server Auto-Open Patterns

Quick reference for configuring automatic localhost opening across frameworks.

---

## Overview

Modern development servers can automatically open your application in the default browser when they start. This skill documents the patterns and best practices for configuring auto-open across different frameworks and environments.

**Benefits**:
- Immediate feedback when starting development
- Reduces manual steps in workflow
- Consistent experience across projects
- Better developer experience

---

## 1. Vite (Recommended)

**Most common framework in vibecoders template.**

### Configuration

**File**: `vite.config.ts` or `vite.config.js`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,              // Opens default browser
    port: 3000,              // Optional: custom port
    host: 'localhost',       // Optional: specify host
    // Alternative: open specific path
    // open: '/dashboard',
    // Alternative: open with specific browser
    // open: 'chrome',
  }
})
```

### Options

| Option | Type | Description | Example |
|--------|------|-------------|---------|
| `open` | boolean | Open browser on start | `true` |
| `open` | string | Open specific path | `'/dashboard'` |
| `open` | string | Open with specific browser | `'chrome'`, `'firefox'` |

### Common Paths

```typescript
// Open to root
open: true

// Open to specific route
open: '/dashboard'
open: '/admin/login'
open: '/docs'
```

### Environment-Specific

```typescript
export default defineConfig(({ mode }) => ({
  server: {
    // Only auto-open in development
    open: mode === 'development',
  }
}))
```

### Resources

- [Vite Server Options](https://vitejs.dev/config/server-options.html#server-open)

---

## 2. Next.js

**Popular React framework with built-in routing.**

### Method 1: CLI Flag (Recommended)

**File**: `package.json`

```json
{
  "scripts": {
    "dev": "next dev --open"
  }
}
```

### Method 2: Custom Server

If using a custom Next.js server:

```javascript
// server.js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const open = require('open')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const PORT = process.env.PORT || 3000

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
    if (dev) {
      open(`http://localhost:${PORT}`)
    }
  })
})
```

**Requires**: `npm install --save-dev open`

### Resources

- [Next.js CLI Documentation](https://nextjs.org/docs/api-reference/cli)
- [Next.js Custom Server](https://nextjs.org/docs/advanced-features/custom-server)

---

## 3. Create React App (CRA)

**Note**: CRA is being phased out in favor of Vite, but still in use.

### Method 1: Environment Variable

**File**: `.env` or `.env.local`

```bash
BROWSER=chrome
# or
BROWSER=none  # Disable auto-open
```

### Method 2: BROWSER Script

**File**: `.env`

```bash
BROWSER=none
```

**File**: `package.json`

```json
{
  "scripts": {
    "dev": "BROWSER=chrome react-scripts start"
  }
}
```

### Cross-Platform (Windows Compatible)

**File**: `package.json`

```json
{
  "scripts": {
    "dev": "cross-env BROWSER=chrome react-scripts start"
  }
}
```

**Requires**: `npm install --save-dev cross-env`

### Resources

- [CRA Environment Variables](https://create-react-app.dev/docs/advanced-configuration/)

---

## 4. Custom Node/Express Servers

For custom backend servers or full-stack applications.

### Using `open` Package (Recommended)

**Install**:
```bash
npm install --save-dev open
```

**File**: `server.js` or `app.js`

```javascript
const express = require('express')
const open = require('open')

const app = express()
const PORT = process.env.PORT || 3000

// Your routes here
app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)

  // Only auto-open in development
  if (process.env.NODE_ENV !== 'production') {
    open(`http://localhost:${PORT}`)
  }
})
```

### TypeScript Version

```typescript
import express from 'express'
import open from 'open'

const app = express()
const PORT = process.env.PORT || 3000

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`)

  if (process.env.NODE_ENV !== 'production') {
    await open(`http://localhost:${PORT}`)
  }
})
```

### With Delay (Ensure Server Ready)

```javascript
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)

  // Wait 1 second for server to be fully ready
  setTimeout(() => {
    if (process.env.NODE_ENV !== 'production') {
      open(`http://localhost:${PORT}`)
    }
  }, 1000)
})
```

### Resources

- [open npm package](https://www.npmjs.com/package/open)

---

## 5. Angular

### Development Server

**File**: `angular.json`

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "serve": {
          "options": {
            "open": true,
            "port": 4200
          }
        }
      }
    }
  }
}
```

### CLI Flag

```bash
ng serve --open
# or
ng serve -o
```

**File**: `package.json`

```json
{
  "scripts": {
    "start": "ng serve --open"
  }
}
```

---

## 6. Vue CLI

### Configuration

**File**: `vue.config.js`

```javascript
module.exports = {
  devServer: {
    open: true,
    port: 8080,
    // Open specific page
    // open: '/dashboard',
  }
}
```

### CLI Flag

```bash
vue-cli-service serve --open
```

---

## 7. Cross-Platform Considerations

### Platform Detection

Different operating systems use different commands to open browsers:

| Platform | Command | Example |
|----------|---------|---------|
| macOS | `open` | `open http://localhost:3000` |
| Windows | `start` | `start http://localhost:3000` |
| Linux | `xdg-open` | `xdg-open http://localhost:3000` |

### Cross-Platform Script

**File**: `scripts/open-browser.js`

```javascript
const { exec } = require('child_process')
const os = require('os')

function openBrowser(url) {
  const platform = os.platform()
  let command

  switch (platform) {
    case 'darwin': // macOS
      command = `open "${url}"`
      break
    case 'win32': // Windows
      command = `start "" "${url}"`
      break
    default: // Linux and others
      command = `xdg-open "${url}"`
  }

  exec(command, (error) => {
    if (error) {
      console.error('Could not open browser:', error)
      console.log(`Please open ${url} manually`)
    }
  })
}

module.exports = openBrowser
```

**Usage**:

```javascript
const openBrowser = require('./scripts/open-browser')

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  openBrowser(`http://localhost:${PORT}`)
})
```

### Using `open` Package (Simpler)

The `open` package handles cross-platform automatically:

```javascript
const open = require('open')

// Works on macOS, Windows, Linux
await open('http://localhost:3000')
```

---

## 8. Environment-Specific Configuration

### Disable in Production

Always disable auto-open in production environments:

```javascript
if (process.env.NODE_ENV === 'development') {
  open(`http://localhost:${PORT}`)
}
```

### Environment Variables

**File**: `.env`

```bash
# Development
NODE_ENV=development
AUTO_OPEN_BROWSER=true
PORT=3000

# Production
NODE_ENV=production
AUTO_OPEN_BROWSER=false
PORT=8080
```

**Usage**:

```javascript
const PORT = process.env.PORT || 3000
const shouldOpen = process.env.AUTO_OPEN_BROWSER === 'true'

app.listen(PORT, () => {
  if (shouldOpen) {
    open(`http://localhost:${PORT}`)
  }
})
```

---

## 9. Common Ports

Default ports for popular frameworks:

| Framework | Default Port | Config Location |
|-----------|--------------|-----------------|
| Vite | 5173 | `vite.config.ts` |
| Next.js | 3000 | `.env` or CLI flag |
| CRA | 3000 | `.env` |
| Angular | 4200 | `angular.json` |
| Vue CLI | 8080 | `vue.config.js` |
| Express | 3000 | `.env` or code |

### Port Detection

```javascript
const DEFAULT_PORTS = [3000, 5173, 8080, 4200, 5000, 8000]

function findAvailablePort(preferred = 3000) {
  // Try preferred port first
  // If busy, try DEFAULT_PORTS
  // Use port-finding library like 'get-port'
}
```

---

## 10. Troubleshooting

### Browser Not Opening

**Check 1: Command availability**
```bash
# macOS
which open

# Linux
which xdg-open

# Windows (in PowerShell)
where start
```

**Check 2: Default browser set**
- Ensure system has a default browser configured
- Try specifying browser explicitly: `open('http://localhost:3000', { app: 'chrome' })`

**Check 3: Firewall/permissions**
- Some corporate environments block browser automation
- Check firewall settings
- Try manual URL opening

### Wrong Port Opening

**Check 1: Environment variables**
```bash
# Verify PORT in .env
cat .env | grep PORT
```

**Check 2: Process already using port**
```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

**Solution**: Kill existing process or use different port

### Opens Multiple Browsers

**Cause**: Server restarting or multiple dev processes

**Solutions**:
- Check for duplicate `open()` calls
- Ensure only one dev server running
- Add flag to prevent multiple opens:

```javascript
let browserOpened = false

app.listen(PORT, () => {
  if (!browserOpened) {
    open(`http://localhost:${PORT}`)
    browserOpened = true
  }
})
```

### Headless Environment (CI/CD)

In CI/CD or headless environments, auto-open will fail:

```javascript
// Detect if running in CI
const isCI = process.env.CI || process.env.CONTINUOUS_INTEGRATION

app.listen(PORT, () => {
  if (!isCI && process.env.NODE_ENV === 'development') {
    open(`http://localhost:${PORT}`)
  }
})
```

---

## 11. Best Practices

### 1. Only Enable in Development

```javascript
const isDevelopment = process.env.NODE_ENV === 'development'

if (isDevelopment) {
  open(`http://localhost:${PORT}`)
}
```

### 2. Provide Visual Feedback

```javascript
app.listen(PORT, () => {
  console.log(`✅ Server ready at http://localhost:${PORT}`)

  if (shouldOpenBrowser) {
    console.log('🌐 Opening browser...')
    open(`http://localhost:${PORT}`)
  } else {
    console.log('💡 Visit http://localhost:${PORT} to view your app')
  }
})
```

### 3. Allow User Override

```bash
# .env
AUTO_OPEN=false  # User preference
```

```javascript
const shouldOpen = process.env.AUTO_OPEN !== 'false'
```

### 4. Handle Errors Gracefully

```javascript
try {
  await open(`http://localhost:${PORT}`)
} catch (error) {
  console.warn('Could not open browser automatically')
  console.log(`Please visit http://localhost:${PORT} manually`)
}
```

### 5. Consider Team Preferences

Some developers prefer not to auto-open. Provide configuration:

```javascript
// .env.local (git-ignored, per-developer)
AUTO_OPEN_BROWSER=false
```

---

## 12. Setup Wizard Integration

When creating new projects or configuring existing ones:

### Prompt Template

```
📂 Configure Auto-Open Localhost

Would you like the browser to automatically open when the dev server starts?
(y/n):
```

### Framework-Specific Configuration

```javascript
function configureAutoOpen(framework) {
  switch(framework) {
    case 'vite':
      updateViteConfig({ server: { open: true } })
      break
    case 'nextjs':
      updatePackageJson({ scripts: { dev: 'next dev --open' } })
      break
    case 'custom':
      installPackage('open')
      addOpenCall()
      break
  }
}
```

---

## Quick Reference

### Vite
```typescript
// vite.config.ts
export default defineConfig({
  server: { open: true }
})
```

### Next.js
```json
// package.json
{ "scripts": { "dev": "next dev --open" } }
```

### Custom Server
```javascript
// server.js
const open = require('open')
app.listen(PORT, () => open(`http://localhost:${PORT}`))
```

### Environment Variable
```bash
# .env
AUTO_OPEN_BROWSER=true
```

---

## Resources

- [Vite Server Options](https://vitejs.dev/config/server-options.html#server-open)
- [Next.js CLI](https://nextjs.org/docs/api-reference/cli)
- [open npm package](https://www.npmjs.com/package/open)
- [cross-env npm package](https://www.npmjs.com/package/cross-env)
- [CRA Environment Variables](https://create-react-app.dev/docs/advanced-configuration/)
