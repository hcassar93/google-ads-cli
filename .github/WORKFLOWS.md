# GitHub Actions Workflows

This repository uses GitHub Actions for automated CI/CD.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Trigger**: On every push to master/main, and on pull requests

**What it does**:
- Tests build on Node.js 18, 20, and 22
- Installs dependencies
- Builds the project
- Runs linter (if configured)
- Runs tests (if configured)
- Checks package size

**Status**: Runs on every commit to verify nothing is broken

---

### 2. Publish Workflow (`.github/workflows/publish.yml`)

**Trigger**: When you push a version tag (e.g., `v1.0.1`, `v1.1.0`)

**What it does**:
1. Checks out code
2. Sets up Node.js 20
3. Installs dependencies
4. Builds the project
5. Publishes to npm
6. Creates a GitHub Release with notes

**How to use**:

#### Publish a new version:

1. **Update version in package.json**:
   ```bash
   # For patch (1.0.0 -> 1.0.1)
   npm version patch
   
   # For minor (1.0.0 -> 1.1.0)
   npm version minor
   
   # For major (1.0.0 -> 2.0.0)
   npm version major
   ```

2. **Push the tag**:
   ```bash
   git push --follow-tags
   ```

3. **Watch the magic happen**:
   - Go to https://github.com/hcassar93/google-ads-cli/actions
   - The "Publish to npm" workflow will start automatically
   - After ~2-3 minutes, your package will be live on npm!

#### Manual tag creation:

If you prefer manual control:

```bash
# Update package.json version manually, then:
git add package.json
git commit -m "Bump version to 1.0.1"
git tag v1.0.1
git push origin master
git push origin v1.0.1
```

---

## Secrets Configuration

The following secrets are configured in the repository:

- `NPM_TOKEN` - Automation token for publishing to npm (already set)

To view/manage secrets:
```bash
gh secret list --repo hcassar93/google-ads-cli
```

---

## First Publish

To publish version 1.0.0 to npm for the first time:

```bash
cd /Users/hayden/Code/google-ads-cli

# Create and push the v1.0.0 tag
git tag v1.0.0
git push origin v1.0.0
```

This will trigger the publish workflow and your package will be live on npm!

---

## Viewing Workflow Runs

**In the browser**:
- Go to: https://github.com/hcassar93/google-ads-cli/actions

**From CLI**:
```bash
gh run list --repo hcassar93/google-ads-cli
gh run watch --repo hcassar93/google-ads-cli  # Watch latest run
```

---

## Troubleshooting

### Workflow fails at "Publish to npm"

**Check**:
1. NPM_TOKEN secret is set correctly
2. Token hasn't expired
3. Token has publish permissions
4. Package name isn't taken

**Fix**:
```bash
# Regenerate token at npmjs.com/settings/YOUR_USER/tokens
# Update the secret:
gh secret set NPM_TOKEN --body "npm_YOUR_NEW_TOKEN" --repo hcassar93/google-ads-cli
```

### Version already exists on npm

You can't republish the same version. Bump the version:
```bash
npm version patch
git push --follow-tags
```

### Build fails in CI

Test locally first:
```bash
npm ci
npm run build
npm test
```

---

## Workflow Badges

Add these to your README.md:

```markdown
[![CI](https://github.com/hcassar93/google-ads-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/hcassar93/google-ads-cli/actions/workflows/ci.yml)
[![Publish](https://github.com/hcassar93/google-ads-cli/actions/workflows/publish.yml/badge.svg)](https://github.com/hcassar93/google-ads-cli/actions/workflows/publish.yml)
```

---

## Automatic vs Manual Publishing

**Current setup**: Automatic publishing on version tags

**If you want manual approval**:
Add to publish.yml before the "Publish to npm" step:
```yaml
- name: Manual approval
  uses: trstringer/manual-approval@v1
  with:
    secret: ${{ github.TOKEN }}
    approvers: hcassar93
```

---

## Future Enhancements

Ideas for additional workflows:
- **Release Notes**: Auto-generate from commits
- **Changelog**: Update CHANGELOG.md automatically
- **Security**: Run npm audit on dependencies
- **Code Coverage**: Track test coverage
- **Performance**: Benchmark package size over time

---

## Summary

✅ **NPM_TOKEN** - Securely stored as GitHub secret
✅ **CI Workflow** - Tests on every push
✅ **Publish Workflow** - Automatically publishes to npm on version tags

**To publish right now**:
```bash
git tag v1.0.0
git push origin v1.0.0
```

Then watch at: https://github.com/hcassar93/google-ads-cli/actions
