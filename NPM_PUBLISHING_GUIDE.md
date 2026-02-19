# Publishing google-ads-cli to npm

## Current Status
✅ Package name "google-ads-cli" appears to be available on npm
✅ package.json properly configured
✅ .npmignore created (excludes source files)
✅ dist/ folder built and ready
✅ README.md exists
✅ LICENSE file exists

## Prerequisites

1. **npm account** - Create one at https://www.npmjs.com/signup if you don't have one
2. **Email verified** - npm requires verified email to publish

## Option 1: Publish Using npm Login (Recommended)

This is the simplest and most secure method.

### Steps:

1. **Log in to npm** (in your terminal):
   ```bash
   cd /Users/hayden/Code/google-ads-cli
   npm login
   ```
   
   You'll be prompted for:
   - Username
   - Password
   - Email
   - One-time password (if you have 2FA enabled)

2. **Verify you're logged in**:
   ```bash
   npm whoami
   ```
   Should show your npm username

3. **Do a dry-run publish** (test without actually publishing):
   ```bash
   npm publish --dry-run
   ```
   This will show you what files will be included

4. **Publish for real**:
   ```bash
   npm publish
   ```

That's it! Your package will be live at: https://www.npmjs.com/package/google-ads-cli

---

## Option 2: Publish Using Access Token (For Automation)

If you want me to publish it for you or want to automate it:

### Steps:

1. **Generate an Automation Token**:
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token"
   - Select "Automation" type (for publishing from CI/CD)
   - Copy the token (starts with `npm_`)

2. **Give me the token temporarily**:
   - You can paste it here (I won't store it)
   - Or set it as environment variable:
     ```bash
     export NPM_TOKEN="npm_xxxxxxxxxxxxxxxxxxxx"
     ```

3. **I'll run**:
   ```bash
   echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
   npm publish
   rm .npmrc  # Clean up
   ```

4. **Revoke the token** after publishing:
   - Go back to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Delete the token we just created

---

## Option 3: DIY (You Run Commands)

If you prefer to do it yourself:

1. Open terminal
2. Navigate to project:
   ```bash
   cd /Users/hayden/Code/google-ads-cli
   ```

3. Log in to npm:
   ```bash
   npm login
   ```

4. Publish:
   ```bash
   npm publish
   ```

---

## After Publishing

### 1. Test Installation
```bash
# In a different directory
npm install -g google-ads-cli

# Test it works
google-ads-cli --version
google-ads-cli --help
```

### 2. Add npm Badge to README
Add this to the top of README.md:
```markdown
[![npm version](https://badge.fury.io/js/google-ads-cli.svg)](https://www.npmjs.com/package/google-ads-cli)
[![Downloads](https://img.shields.io/npm/dm/google-ads-cli.svg)](https://www.npmjs.com/package/google-ads-cli)
```

### 3. Update Installation Instructions
Add to README.md:
```markdown
### Install from npm (Recommended)

\`\`\`bash
npm install -g google-ads-cli
\`\`\`

Then verify:
\`\`\`bash
google-ads-cli --version
\`\`\`
```

---

## Important Notes

### Package Size
Run this to see what will be published:
```bash
npm pack --dry-run
```

Current package contents:
- dist/ (compiled JavaScript)
- README.md
- LICENSE
- package.json

Excluded (via .npmignore):
- src/ (TypeScript source)
- node_modules/
- tests/
- .git/

### Versioning
For future updates:

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch
npm publish

# Minor version (1.0.0 -> 1.1.0)
npm version minor
npm publish

# Major version (1.0.0 -> 2.0.0)
npm version major
npm publish
```

### Making it Public
The package will be public by default. If you accidentally made it private:
```bash
npm publish --access public
```

---

## Troubleshooting

### "You must verify your email"
- Check your email and click the verification link
- Or go to https://www.npmjs.com/settings/YOUR_USERNAME/profile

### "Package name too similar"
- npm might flag similar names
- Add your username as scope: `@hcassar93/google-ads-cli`
- Update package.json name field

### "You need a paid account"
- Scoped packages (@username/package) require npm Teams for private packages
- Public packages are always free
- Make sure you're publishing as public: `npm publish --access public`

### "403 Forbidden"
- Make sure you're logged in: `npm whoami`
- Check you have publish permissions
- Try logging out and back in: `npm logout && npm login`

---

## Security Best Practices

1. **Use 2FA** on your npm account (https://www.npmjs.com/settings/YOUR_USERNAME/tfa)
2. **Revoke tokens** after one-time use
3. **Never commit** `.npmrc` with tokens to git (already in .gitignore)
4. **Use automation tokens** for CI/CD, not your password

---

## My Recommendation

**Use Option 1** (npm login) - it's the simplest and most secure:

```bash
cd /Users/hayden/Code/google-ads-cli
npm login
npm publish --dry-run  # Test first
npm publish            # Publish for real
```

Then users can install with:
```bash
npm install -g google-ads-cli
```

Let me know which option you prefer, and I can help!
