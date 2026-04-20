# Security Policy

## Supported Versions

We actively maintain the following versions of MeetFlow AI:

| Version | Supported          |
| ------- | ------------------ |
| v2.x    | :white_check_mark: |
| v1.x    | :x:                |

## Reporting a Vulnerability

We take the security of our event attendees seriously. If you discover a security vulnerability within MeetFlow AI, please report it via the following process:

1. **Do not disclose publicly**: Please avoid opening public issues for security vulnerabilities.
2. **Email**: Send a detailed report to security@meetflow.ai (Simulated for Hackathon).
3. **Response**: We will acknowledge your report within 24 hours and provide a fix within 7 days.

## Security Architecture

MeetFlow AI employs a **Defense in Depth** strategy:

- **Input Sanitization**: All user-provided and AI-generated content is sanitized via `DOMPurify`.
- **Schema Validation**: 100% of LLM outputs are validated against `Zod` schemas before execution.
- **Environment Isolation**: Sensitive API keys are restricted to specific Google Cloud origins.
- **Content Security Policy (CSP)**: Strict policies prevent unauthorized script execution and data exfiltration.
