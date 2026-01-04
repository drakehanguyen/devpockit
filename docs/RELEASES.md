# Release Process

This document describes how to create and deploy releases for DevPockit.

## Release Workflow

Releases are automatically deployed when you create a version tag. The workflow:

1. **Tag Creation**: Create and push a version tag (e.g., `v0.1.0`)
2. **Automated Build**: GitHub Actions builds the application
3. **Testing**: Runs type checking, linting, and tests
4. **Deployment**: Deploys to production (GitHub Pages)
5. **Release Creation**: Creates a GitHub release with notes from CHANGELOG.md

## Creating a Release

### Step 1: Update Version Information

Before creating a release, update:

1. **package.json**: Update the `version` field
   ```json
   {
     "version": "0.1.0"
   }
   ```

2. **CHANGELOG.md**: Add release notes for the new version
   ```markdown
   ## [0.1.0] - 2026-01-05

   ### Added
   - New features

   ### Changed
   - Changes

   ### Fixed
   - Bug fixes
   ```

3. **next.config.js**: Update version in environment variables (if needed)
   ```javascript
   env: {
     NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
   }
   ```

### Step 2: Commit Changes

```bash
git add package.json CHANGELOG.md next.config.js
git commit -m "chore: bump version to 0.1.0"
git push origin main
```

### Step 3: Create and Push Version Tag

```bash
# Create annotated tag
git tag -a v0.1.0 -m "Release version 0.1.0"

# Push tag to trigger deployment
git push origin v0.1.0
```

Or create the tag via GitHub:
1. Go to **Releases** → **Draft a new release**
2. Choose **Create new tag**: `v0.1.0`
3. Select target branch: `main`
4. Release title: `Release 0.1.0`
5. Description: Copy from CHANGELOG.md
6. Click **Publish release**

### Step 4: Monitor Deployment

1. Go to **Actions** tab in GitHub
2. Watch the **Deploy DevPockit to GitHub Pages** workflow
3. Watch the **Create Release** workflow
4. Verify deployment at https://devpockit.hypkey.com/

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Pre-release Versions

- **Alpha**: `v0.1.0-alpha.1`
- **Beta**: `v0.1.0-beta.1`
- **RC**: `v0.1.0-rc.1`

Pre-releases are marked as pre-release in GitHub but still deploy to production.

## Release Checklist

Before creating a release:

- [ ] All tests passing (`pnpm test:ci`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Version updated in `package.json`
- [ ] CHANGELOG.md updated with release notes
- [ ] All changes committed and pushed
- [ ] Tag created and pushed

## Automated Workflows

### Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch
- Push of version tag (`v*`)

**Actions:**
- Type checking
- Linting
- Building application
- Verifying build output
- Deploying to GitHub Pages

### Release Workflow (`.github/workflows/release.yml`)

**Triggers:**
- Push of version tag (`v*`)

**Actions:**
- Type checking
- Linting
- Testing
- Building application
- Generating release notes from CHANGELOG.md
- Creating GitHub release
- Uploading build artifacts

## Manual Release (If Needed)

If automated workflows fail, you can manually deploy:

```bash
# Build locally
pnpm build

# Verify build
pnpm build:verify

# Deploy manually (depends on your hosting)
# For GitHub Pages: Push out/ directory
# For other platforms: Follow their deployment process
```

## Rollback

If a release has issues:

1. **Revert the tag** (if needed):
   ```bash
   git tag -d v0.1.0
   git push origin :refs/tags/v0.1.0
   ```

2. **Redeploy previous version**:
   - Push the previous tag again, or
   - Manually deploy from a previous commit

3. **Create hotfix release**:
   - Fix the issue
   - Create a patch version (e.g., `v0.1.1`)
   - Follow normal release process

## Release Notes

Release notes are automatically generated from `CHANGELOG.md`. The workflow:

1. Extracts the section for the version being released
2. Formats it as release notes
3. Adds a link to the full changelog
4. Includes a link to compare changes

### Format in CHANGELOG.md

```markdown
## [0.1.0] - 2026-01-05

### Added
- Feature 1
- Feature 2

### Changed
- Improvement 1

### Fixed
- Bug fix 1
```

## Environment Variables

The build process uses these environment variables (if set):

- `NEXT_PUBLIC_APP_VERSION`: Application version (defaults to package.json version)
- `NEXT_PUBLIC_APP_NAME`: Application name (defaults to "DevPockit")

These are set automatically during the release build.

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs
2. Verify build succeeds locally: `pnpm build`
3. Check for TypeScript errors: `pnpm type-check`
4. Check for linting errors: `pnpm lint`

### Release Not Created

1. Verify tag format: Must start with `v` (e.g., `v0.1.0`)
2. Check workflow permissions
3. Verify CHANGELOG.md exists and has the version section

### Build Artifacts

Build artifacts are uploaded to GitHub Actions and kept for 30 days. You can download them from the workflow run.

---

For questions or issues with releases, please open an issue on GitHub.

