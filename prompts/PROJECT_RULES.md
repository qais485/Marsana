# PROJECT_RULES.md

# Global Project Rules

## Purpose

This document defines the global rules, standards, architecture principles, and development philosophy of the project.

Every piece of code generated for this project must follow these rules.

Before implementing any feature, modifying existing code, or creating new files, read this document completely.

If a user request conflicts with these rules, ask for clarification before proceeding.

Never ignore these rules.

---

# Project Philosophy

The project must always prioritize:

- Simplicity
- Readability
- Maintainability
- Scalability
- Security
- Performance
- Reusability
- Consistency

Code should be written for humans first and computers second.

Readable code is always preferred over clever code.

---

# Technology Stack

## Backend

- Python
- FastAPI
- SQLAlchemy ORM
- PostgreSQL

## Frontend

- React
- Vite
- JavaScript

## Styling

- Tailwind CSS

---

# Architecture

The project follows a modular architecture.

Backend and frontend are completely separated.

The frontend must never access the database directly.

All communication must happen through REST APIs.

Business logic belongs only to the backend.

Database operations must only be performed through SQLAlchemy.

---

# AI Development Rules

Whenever generating code:

Always inspect the existing project structure first.

Reuse existing code whenever possible.

Never create duplicate logic.

Never create duplicate components.

Never introduce unnecessary libraries.

Never change architecture without approval.

Never delete existing functionality unless explicitly requested.

Never rename public APIs without permission.

Always explain why a new dependency is needed before using it.

---

# Project Structure

Each folder must have a single responsibility.

Avoid deeply nested folders unless necessary.

Avoid mixing unrelated features.

Keep modules independent.

Every feature should be easy to locate.

---

# Naming Conventions

Use English only.

Use descriptive names.

Avoid abbreviations.

Examples:

Good

UserService

AuthenticationMiddleware

ProductRepository

Bad

UsrSrv

AuthMid

Repo1

---

# File Naming

Python files

snake_case.py

React components

PascalCase.jsx

Hooks

useSomething.js

Utility files

snake_case.js

Folders

lowercase

---

# Code Quality

Every function should have one responsibility.

Avoid long functions.

Avoid long files.

Avoid unnecessary nesting.

Reduce code duplication.

Prefer composition over repetition.

Keep code easy to understand.

---

# Reusability

Before writing code:

Check if similar functionality already exists.

Reuse existing utilities.

Reuse services.

Reuse validation.

Reuse API clients.

Avoid copy-paste.

---

# Error Handling

Never silently ignore errors.

Always return meaningful messages.

Handle expected errors gracefully.

Log unexpected errors.

Never expose internal implementation details.

---

# Performance

Avoid unnecessary database queries.

Avoid unnecessary API calls.

Avoid unnecessary renders.

Optimize expensive operations.

Lazy load when appropriate.

Do not optimize prematurely.

---

# Security

Never expose:

Passwords

Secrets

API keys

JWT secrets

Environment variables

Always validate user input.

Always sanitize external data.

Never trust client-side data.

---

# Dependencies

Before adding a package:

Verify that it is actually needed.

Prefer stable libraries.

Avoid abandoned packages.

Avoid adding multiple packages that solve the same problem.

---

# Documentation

Public functions should be easy to understand.

Complex logic should include concise explanations.

Avoid obvious comments.

Document why, not what.

---

# Future Features

Every future feature must:

Follow this document.

Follow the backend rules.

Follow the frontend rules.

Follow the UI design rules.

Follow the security rules.

Follow the coding style rules.

---

# Code Generation Rules

Generated code must:

Compile successfully.

Be production-ready.

Be modular.

Be reusable.

Be readable.

Avoid placeholders whenever possible.

Avoid TODO comments unless requested.

Generate complete implementations instead of partial examples.

---

# Decision Priority

When making development decisions, follow this priority:

1. Security
2. Correctness
3. Maintainability
4. Readability
5. Scalability
6. Performance

---

# Final Rule

Whenever there is uncertainty:

Do not guess.

Analyze the existing project.

Ask for clarification if necessary.

Follow the established architecture.

Maintain consistency across the entire codebase.