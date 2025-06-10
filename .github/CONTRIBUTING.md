# Contributing to Envin

Thank you for your interest in contributing to Envin! This document outlines the process for contributing to our environment variable validation library.

## Prerequisites

This project uses [Bun](https://bun.sh) as its package manager and runtime. To install:

```sh
# Linux & macOS
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

## Getting Started

1. **Fork and Clone**
   ```sh
   git clone https://github.com/YOUR_USERNAME/envin.git
   cd envin
   ```

2. **Install Dependencies**
   ```sh
   bun install
   ```

3. **Development Setup**
   
   We recommend using VSCode (or a fork like [Cursor](https://www.cursor.com) or [Windsurf](https://windsurf.com)) with the [recommended extensions](./.vscode/extensions.json) installed:
   - Arktype
   - Biome (formatter/linter)
   - MDX support
   - Vitest Explorer

4. **Start Development**
   ```sh
   bun run dev
   ```
   This starts the build watchers and will recompile packages when you make changes.

## Project Structure

This is a monorepo with the following structure:

- `packages/core/` - Core environment validation library
- `packages/cli/` - CLI tool for live preview and development
- `apps/docs/` - Documentation website
- `apps/example/` - Example application

## Development Workflow

### Creating Changes

1. **Create a Feature Branch**
   ```sh
   git checkout -b feature/your-feature-name
   ```
   
   > **Important:** Always create pull requests from feature branches, not from your main branch.

2. **Make Your Changes**
   - Focus changes in the `packages/core` package when possible
   - Re-export framework-specific code from respective packages
   - Add tests (both runtime and type tests) to verify your changes
   - Update documentation as needed

3. **Test Your Changes**
   ```sh
   # Run all tests
   bun run test
   
   # Type checking
   bun run typecheck
   
   # Linting
   bun run lint
   # Auto-fix linting issues
   bun run lint:fix
   ```

4. **Add a Changeset**
   ```sh
   bun changeset
   ```
   This ensures your changes trigger an appropriate release with changelog.

### Code Style Guidelines

- **Biome Formatting**: The project uses Biome for code formatting and linting
- **TypeScript**: Write type-safe code with proper TypeScript annotations
- **Meaningful Names**: Use clear, descriptive variable and function names
- **Self-Documenting Code**: Write code that explains itself; add comments only for complex logic
- **Consistency**: Follow existing patterns and conventions in the codebase

### Testing Guidelines

- Add tests for new features and bug fixes
- Include both runtime tests and TypeScript type tests
- For bug fixes, consider adding a failing regression test first, then implement the fix
- Use the VSCode test explorer or run `bun run test` to execute tests

### Commit Guidelines

- Write clear, descriptive commit messages
- Make focused, atomic commits
- For bug fixes, create separate commits for tests and fixes when helpful for review
- Individual commit messages don't need to follow strict conventions (PRs are squashed)

## Pull Request Process

### Before Submitting

1. **Run Quality Checks**
   ```sh
   bun run lint      # Check for linting issues
   bun run test      # Run all tests
   bun run typecheck # Verify TypeScript types
   ```

2. **Update Documentation**
   - Update relevant documentation in `apps/docs/`
   - Ensure examples in README are accurate
   - Add JSDoc comments for new public APIs

### Submitting Your PR

1. **PR Description**
   - Provide a clear description of your changes
   - Link relevant issues (e.g., "Closes #123")
   - Explain the motivation and context

2. **Self-Review**
   - Review your own code before submitting
   - Check for any obvious issues or improvements
   - Ensure all files are properly formatted

3. **Keep It Focused**
   - Keep changes atomic and focused on a single feature/fix
   - Split large changes into multiple PRs when possible

## Reporting Issues

- **Check Existing Issues**: Search for existing issues before creating new ones
- **Provide Context**: Include clear reproduction steps, expected behavior, and actual behavior
- **Include Details**: Add relevant environment information (Node.js version, framework, etc.)
- **Use Labels**: Apply appropriate labels to help categorize the issue

## Areas for Contribution

### Code Contributions
- Bug fixes and performance improvements
- New schema library integrations
- Framework-specific adapters
- CLI enhancements and new features

### Documentation
- Improve existing documentation
- Add examples for different use cases
- Create guides for specific frameworks
- Fix typos and improve clarity

### Testing
- Add test cases for edge cases
- Improve test coverage
- Add integration tests

## Questions and Support

- **Discussions**: Use GitHub Discussions for questions and general discussion
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Documentation**: Check https://envin.turbostarter.dev for comprehensive guides

## Review Process

Please note that this project is maintained by individuals with full-time jobs. Reviews are done in spare time, so please allow appropriate time for review. If you haven't received a review within a week, feel free to ping the maintainers.

## Code of Conduct

This project follows a Code of Conduct. By participating, you agree to uphold these standards and create a welcoming environment for all contributors.

---

## License

[MIT](./LICENSE) License © 2025 [Bartosz Zagrodzki](https://github.com/Bartek532)
