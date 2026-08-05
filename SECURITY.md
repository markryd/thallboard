# Security Policy

## Supported versions

Thallboard is a client-side static web app. Security fixes target the latest code on `main`.

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Report privately using [GitHub’s private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) on this repository (Security → Report a vulnerability), or via [GitHub Security Advisories](https://github.com/svencowart/thallboard/security/advisories).

Include enough detail to reproduce the issue (steps, impact, and any suggested fix). You’ll hear back as soon as practical.

## Non-security bugs

Ordinary bugs, UX issues, and feature requests belong in [public Issues](https://github.com/svencowart/thallboard/issues).

## Scope

Relevant concerns for this project include XSS, unsafe handling of persisted `localStorage` data, and compromised or vulnerable dependencies. There is no server-side authentication or user data API.
