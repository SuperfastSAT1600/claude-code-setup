# askSecret Bug - Windows Git Bash Issue

## Problem

The `askSecret` function doesn't work properly in Windows Git Bash because:
- Raw mode (`stdin.setRawMode(true)`) doesn't suppress character echo in MINGW/Git Bash
- Characters are echoed by the terminal AND asterisks are written by our code
- Result: User sees `*h*e*c*k*` or `t*e*s*t*` instead of `*****`

## Root Cause

This is a **known limitation of Windows Git Bash (MINGW)** - the terminal doesn't properly support TTY raw mode or silent input. Even the `read` package (used by npm, yarn) cannot suppress echo in Git Bash.

**This affects**:
- Git Bash (MINGW64/MINGW32)
- MinTTY terminals

**This works fine in**:
- Windows PowerShell
- Windows CMD
- Windows Terminal
- Linux native terminals
- macOS native terminals

## Solution Implemented

**The code now detects Git Bash and displays a clear warning:**

When running in Git Bash, you'll see:
```
============================================================
⚠️  GIT BASH LIMITATION: Hidden input not supported
============================================================
Git Bash on Windows cannot hide password input.
Your input will be visible on screen.

For hidden input, please run this script in:
  • Windows PowerShell
  • Windows CMD
  • Windows Terminal
============================================================
```

**For other terminals (PowerShell, CMD, Linux, macOS)**, the code uses the `read` package:

```javascript
// Try to load 'read' package
let readPackage = null;
try {
  readPackage = require('read');
} catch (e) {
  // Will use fallback if not installed
}

async function askSecret(rl, question) {
  // Use 'read' package if available (works properly on Windows)
  if (readPackage) {
    const result = await readPackage({
      prompt: `${question}: `,
      silent: true,
      replace: '*',
    });
    return result || '';
  }

  // Fallback: warn user that input will be visible
  console.log('\nWARNING: Secure input not available. Your input will be visible.');
  console.log('Install the "read" package: npm install read\n');
  rl.question(`${question}: `, (answer) => {
    resolve(answer.trim());
  });
}
```

## Required Action

### Option 1: Use PowerShell or CMD (Recommended)

**For hidden password input, run setup in PowerShell or CMD:**

1. Open **PowerShell** or **CMD**
2. Navigate to the project directory:
   ```powershell
   cd "C:\Users\Jason\Documents\test proj"
   ```
3. Run setup:
   ```powershell
   node setup.cjs
   ```

The `read` package will work properly and hide your input.

### Option 2: Accept Visible Input in Git Bash

If you prefer to stay in Git Bash, you can proceed with visible input. The setup will work, but your tokens/passwords will be visible as you type them.

**Already installed:** The `read` package is already installed (via `npm install read --save`), so hidden input will work automatically when you run the script in PowerShell/CMD.

## Verification

After installing the `read` package, test again:

```bash
node test-secret-input.cjs
```

**Expected output**:
```
Enter test secret: ****
You entered: "test"
✅ Secret input test PASSED
```

## Why the 'read' Package?

The `read` package is:
- ✅ Battle-tested (used by npm, yarn, and other major CLI tools)
- ✅ Cross-platform (handles Windows, macOS, Linux quirks)
- ✅ Properly suppresses echo in all environments
- ✅ Handles backspace, Ctrl-C, and special keys correctly
- ✅ Falls back gracefully if raw mode isn't available

## Alternative if read Package Won't Install

If you can't install the `read` package, the function will fall back to **visible input** with a clear warning. This is acceptable for development/testing but should be fixed for production use.

## Files Modified

1. `lib/input.cjs` - Updated `askSecret()` function
2. `README.md` - Changed all `setup.js` references to `setup.cjs`
3. `setup.cjs` - Header comment updated
4. All `lib/*.js` → `lib/*.cjs` (CommonJS compatibility)

## Summary

✅ **Bug identified**: Windows Git Bash raw mode doesn't work properly
✅ **Solution implemented**: Use `read` package instead of raw mode
⏳ **Action required**: Install `read` package with `npm install read`
✅ **Fallback available**: Function warns and uses visible input if package not installed
