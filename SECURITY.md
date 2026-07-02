# Security Policy

## Supported Versions

The `main` branch is the supported development line.

## Reporting a Vulnerability

Please open a private security advisory if the repository is hosted on GitHub, or contact the maintainer privately before publishing details.

Do not include real agmsg databases, private logs, API keys, tokens, payment data, or account credentials in public issues.

## Local-First Boundary

agmsg-bubblelog reads local agmsg team config files and `messages.db` in read-only mode. It should not write agmsg state or transmit logs to external services.
