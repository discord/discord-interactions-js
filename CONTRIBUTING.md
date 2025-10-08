# Contributing to discord-interactions-js

Thank you for your interest in contributing to discord-interactions-js!

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Run tests:
   ```bash
   npm test
   ```
5. Run linting:
   ```bash
   npm run lint
   ```

## Code Quality

- We use [Biome](https://biomejs.dev/) for linting and formatting
- Run `npm run fix` to automatically fix linting issues
- All tests must pass before merging
- Code is tested against Node.js 18, 20, and 22

## Release Process

This project uses [release-please](https://github.com/googleapis/release-please) to automate releases. The process is fully automated based on conventional commit messages.

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Your commit messages should be structured as follows:

```
<type>: <description>

[optional body]

[optional footer(s)]
```

**Common types:**
- `feat:` - A new feature (triggers a minor version bump)
- `fix:` - A bug fix (triggers a patch version bump)
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks, dependency updates
- `refactor:` - Code refactoring without behavior changes
- `test:` - Adding or updating tests
- `perf:` - Performance improvements

**Breaking changes:**
Add `BREAKING CHANGE:` in the commit body or append `!` after the type to trigger a major version bump:
```
feat!: change API signature

BREAKING CHANGE: The verifyKey function now requires a second parameter
```

### How Releases Work

1. **Development**:
   - Create a PR with your changes
   - Use conventional commit messages in your commits
   - Once approved, merge to `main`

2. **Automated Release PR**:
   - release-please automatically creates/updates a "release PR"
   - This PR aggregates all changes since the last release
   - It updates the version in `package.json` and generates/updates `CHANGELOG.md`
   - The PR stays open until you're ready to release

3. **Publishing**:
   - When ready to release, merge the release PR
   - release-please creates a GitHub release with the new version tag
   - The package is automatically published to npm with provenance
   - A new release PR will be created for the next release cycle

### Release Notes

Release notes are automatically generated from commit messages. To ensure high-quality release notes:
- Write clear, descriptive commit messages
- Focus on the "what" and "why" in the description
- Use the commit body for additional context if needed

### Manual Version Control

In rare cases where you need to manually adjust versions:
1. Edit `.release-please-manifest.json` to set the desired version
2. Commit and push to `main`
3. release-please will use this as the base for the next release

## Questions?

If you have questions about the contributing process, feel free to open an issue for discussion.
