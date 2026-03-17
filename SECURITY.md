# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in api-replay, please report it responsibly.

**Do NOT open a public GitHub issue.**

Instead, email: **ashok1706@users.noreply.github.com**

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Fix release**: Depending on severity, typically within 2 weeks

### Security Considerations

api-replay handles HTTP request/response data which may contain sensitive information. The package includes built-in protections:

- **Header masking**: Sensitive headers (e.g., `authorization`, `cookie`) can be masked via `maskHeaders` option
- **Body masking**: Sensitive body fields can be masked via `maskBody` option with deep recursive masking
- **Path traversal protection**: Recording IDs are validated to prevent directory traversal attacks
- **Body size limits**: Configurable `maxBodySize` to prevent memory exhaustion

### Best Practices for Users

1. **Always mask sensitive headers** — at minimum: `authorization`, `cookie`, `x-api-key`
2. **Mask sensitive body fields** — passwords, tokens, PII
3. **Don't commit recordings to git** — add `recordings/` to `.gitignore`
4. **Use in staging, not production** — unless you've audited the performance impact
5. **Restrict file permissions** — ensure the `recordings/` directory is not publicly accessible

## Acknowledgments

We appreciate security researchers who help keep api-replay and its users safe.
