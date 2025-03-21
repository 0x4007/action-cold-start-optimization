# Example Plugins

This section provides complete, working examples of plugins built with our WebAssembly-Optimized GitHub Actions framework. Each example demonstrates different aspects of the system and includes detailed explanations of implementation choices.

## Available Examples

### JavaScript Examples
- [Issue Responder](/examples/issue-responder.md) - A simple plugin that automatically responds to new issues based on content
- [Label Manager](/examples/label-manager.md) - Applies and manages labels on issues and pull requests

### TypeScript Examples
- [PR Analyzer](/examples/pr-analyzer.md) - Analyzes pull requests for size, complexity, and potential issues
- [Code Review Helper](/examples/code-review-helper.md) - Assists with code reviews by providing automated feedback

## Implementation Tiers

Each example is available in multiple implementation tiers to demonstrate the progressive enhancement capabilities of our framework:

1. **JavaScript Simple** - Accessible to web developers with basic JavaScript knowledge
2. **TypeScript Advanced** - For developers comfortable with TypeScript and some WASM integration
3. **Rust Optimized** - Full-stack implementation with custom Rust code for maximum performance

## Performance Comparisons

Examples include performance comparisons between implementation tiers, demonstrating the benefits of WebAssembly optimization for GitHub Actions. These comparisons include metrics such as:

- Cold start time
- Execution speed
- Memory usage
- Bundle size

## Using Examples

All examples can be used as-is or customized for your specific needs. To use an example:

1. Clone the repository
2. Copy the example directory to your project
3. Update configuration as needed
4. Deploy to GitHub

For detailed instructions, see the README in each example directory.
