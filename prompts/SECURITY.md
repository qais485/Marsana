# SECURITY.md

# Security Development Rules

## Purpose

This document defines security standards and rules for the entire application.

Every backend, frontend, database, and API implementation must follow these security rules.

Security is a priority in every development decision.

---

# Security Principles

The application must always prioritize:

- Data protection
- User privacy
- Secure communication
- Input validation
- Access control
- Safe data handling

Never sacrifice security for convenience.

---

# Secret Management

Never store sensitive information directly in code.

Forbidden:

- Passwords
- API keys
- Database credentials
- JWT secrets
- Private tokens

Use environment variables.

Example:

```
DATABASE_URL

SECRET_KEY

JWT_SECRET_KEY

API_KEY
```

---

# Environment Files

Sensitive configuration must be stored outside the source code.

Example:

```
.env
```

The application must load configuration securely.

---

# Authentication

Authentication must be implemented securely.

Recommended approach:

JWT Authentication

Authentication must handle:

- User login
- Token generation
- Token validation
- Token expiration
- User identity verification

---

# Password Security

Passwords must never be stored as plain text.

Always use secure hashing.

Recommended:

- bcrypt
- Argon2

Rules:

Never:

```
password = "123456"
```

Always:

```
hashed_password
```

---

# Password Requirements

Passwords should support:

- Minimum length rules
- Secure hashing
- Validation
- Protection against common passwords

---

# Authorization

Authentication answers:

"Who is the user?"

Authorization answers:

"What can the user access?"

Always check permissions before sensitive operations.

---

# Role Based Access Control

For applications with multiple user types:

Use roles and permissions.

Example:

```
Admin

Manager

User
```

Never rely only on frontend restrictions.

Backend must enforce permissions.

---

# Input Validation

Never trust user input.

Validate:

- Request body
- Query parameters
- URL parameters
- Uploaded files
- User-generated content

Validation must happen on the backend.

---

# Data Sanitization

External data must be cleaned before processing.

Prevent:

- Invalid data
- Malicious input
- Unexpected formats

---

# SQL Injection Protection

Never build raw SQL queries using user input.

Bad:

```
"SELECT * FROM users WHERE id=" + user_input
```

Good:

Use SQLAlchemy parameters.

---

# API Security

All protected APIs must require authentication.

APIs should:

- Validate permissions
- Limit sensitive responses
- Return safe errors

---

# Error Handling Security

Never expose internal errors.

Bad:

```
Database connection failed at /server/file.py line 50
```

Good:

```
Something went wrong. Please try again.
```

Detailed errors should only appear in logs.

---

# CORS Security

Configure CORS properly.

Do not allow unrestricted access in production.

Avoid:

```
allow_origins=["*"]
```

unless there is a specific reason.

---

# File Upload Security

If file uploads exist:

Validate:

- File type
- File size
- File name
- File content

Never trust uploaded files.

---

# Frontend Security

Never store:

- Secret keys
- Private credentials
- Database information

Frontend code is visible to users.

---

# Token Storage

Choose secure token storage.

Avoid unsafe storage methods for sensitive tokens.

Consider:

- HTTP-only cookies
- Secure cookies
- Proper expiration

---

# Dependency Security

Use trusted libraries.

Keep dependencies updated.

Avoid abandoned packages.

Before adding a dependency:

Check security and maintenance status.

---

# Database Security

Database access must:

- Use secure credentials
- Limit permissions
- Protect sensitive data

Never expose database directly to users.

---

# Logging Security

Logs must never contain:

- Passwords
- Tokens
- Secret keys
- Personal sensitive data

Log only necessary information.

---

# Rate Limiting

Sensitive endpoints should have protection against abuse.

Examples:

- Login
- Password reset
- Registration
- Expensive operations

---

# Session Security

Sessions and tokens must have:

- Expiration
- Validation
- Secure handling

Expired sessions must be rejected.

---

# Authentication Errors

Avoid revealing sensitive information.

Bad:

"Email exists but password is wrong"

Good:

"Invalid credentials"

---

# Production Security Checklist

Before deployment:

Check:

- Secrets are protected
- Debug mode is disabled
- HTTPS is enabled
- Database access is restricted
- Authentication works correctly
- Errors are handled safely
- Dependencies are secure

---

# Security Review

Before adding a new feature ask:

- Does it handle user data?
- Does it need authentication?
- Does it expose sensitive information?
- Can users access unauthorized resources?
- Is input validated?

---

# Final Security Rule

Every part of the application must be designed with security in mind.

Security is not an additional feature.

Security is part of the architecture.