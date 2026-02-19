# ⚠️ NPM Token Issue - Action Required

## Problem

The publish failed with this error:
```
403 Forbidden - Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

## Solution Options

### Option 1: Enable 2FA on npm Account (Recommended & Most Secure)

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tfa
2. Click "Enable Two-Factor Authentication"
3. Follow the setup (use an authenticator app like Google Authenticator)
4. **Important**: Save your recovery codes!

Once 2FA is enabled, the current token will work fine.

### Option 2: Create a Granular Access Token with Bypass 2FA

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click "Generate New Token" → "Granular Access Token"
3. Configure the token:
   - **Token Name**: `github-actions-google-ads-cli`
   - **Expiration**: Choose your preference (90 days recommended)
   - **Packages and scopes**:
     - Select "Read and write"
     - Choose "All packages" or select "google-ads-cli" specifically
   - **Organizations**: Leave default
   - **IP ranges**: Leave empty (unless you want to restrict)
   - ✅ **Check "Bypass 2FA"** - This is the critical setting!

4. Copy the new token (starts with `npm_...`)

5. Update GitHub secret:
   ```bash
   gh secret set NPM_TOKEN --body "YOUR_NEW_TOKEN" --repo hcassar93/google-ads-cli
   ```

6. Re-run the workflow:
   ```bash
   gh run rerun 22167750611 --repo hcassar93/google-ads-cli
   ```

---

## My Recommendation

**Do Option 1** (Enable 2FA) - It's more secure and the token you already gave me will work.

Then just re-run the failed workflow:
```bash
cd /Users/hayden/Code/google-ads-cli
gh run rerun 22167750611 --repo hcassar93/google-ads-cli
```

---

## About the Current Token

The token you provided is:
- ✅ Already securely stored in GitHub secrets
- ✅ Has proper permissions for publishing
- ❌ Can't bypass 2FA requirement (it's a classic automation token)

You can either:
- Keep it and enable 2FA on your account, OR
- Replace it with a granular token that has "bypass 2FA" enabled

---

## After Fixing

Once you've either enabled 2FA or updated the token, re-trigger the publish:

**Method 1: Re-run the failed workflow**
```bash
gh run rerun 22167750611 --repo hcassar93/google-ads-cli
```

**Method 2: Delete and recreate the tag**
```bash
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
git tag v1.0.0
git push origin v1.0.0
```

---

## Security Note

If you create a new granular token:
1. Delete the old automation token from npmjs.com
2. The new token is more secure (can be scoped to specific packages)
3. Set an expiration date and rotate it periodically

Let me know which option you choose and I'll help with the next steps!
