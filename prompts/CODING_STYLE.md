# CODING_STYLE.md

# Coding Style Rules

## Purpose

This document defines coding standards, naming conventions, formatting rules, and best practices for the entire project.

All backend and frontend code must follow these rules.

The goal is to keep the code:

- Clean
- Readable
- Consistent
- Maintainable
- Professional

---

# General Coding Principles

Write code that is easy for another developer to understand.

Prefer:

- Simple solutions
- Clear names
- Small functions
- Reusable code
- Consistent structure

Avoid:

- Complex logic
- Duplicate code
- Unnecessary abstractions
- Extremely long files

---

# Naming Rules

Names must describe their purpose.

Good:

```
user_profile

calculate_total_price

get_user_by_email
```

Bad:

```
data1

process()

temp()
```

---

# Variables

Variable names must be meaningful.

Good:

```python
user_email = "test@example.com"
```

Bad:

```python
x = "test@example.com"
```

---

# Functions

Functions should:

- Do one thing
- Have clear names
- Be small
- Avoid too many parameters

Good:

```python
get_user_by_id()
```

Bad:

```python
handle_everything()
```

---

# Classes

Classes must use PascalCase.

Good:

```python
UserService

ProductRepository
```

Bad:

```python
user_service

productrepository
```

---

# Python Backend Style

Follow:

PEP 8

Use:

- Type hints
- Clear imports
- Proper formatting

Example:

```python
def get_user(user_id: int) -> User:
    return user
```

---

# Python File Organization

Order imports:

1. Standard library
2. Third-party packages
3. Local modules

Example:

```python
import os

from fastapi import FastAPI

from app.services.user import UserService
```

---

# Type Hints

Use type hints whenever possible.

Good:

```python
def create_user(name: str, age: int) -> User:
```

Avoid:

```python
def create_user(name, age):
```

---

# Error Handling Style

Handle errors clearly.

Bad:

```python
try:
    something()
except:
    pass
```

Good:

```python
try:
    something()
except ValueError:
    handle_error()
```

---

# Comments

Comments should explain why.

Bad:

```python
# loop through users
for user in users:
```

Good:

```python
# Filter inactive users because inactive accounts cannot access dashboard
```

---

# Documentation

Complex functions should have documentation.

Example:

```python
def calculate_discount():
    """
    Calculate user discount based on membership level.
    """
```

---

# React Code Style

Components:

Use PascalCase.

Example:

```
UserCard.jsx
```

Hooks:

Start with:

```
use
```

Example:

```
useAuth.js
```

---

# React Component Rules

Components should:

- Be small
- Avoid business logic
- Reuse existing components

Avoid:

Large components with hundreds of lines.

---

# JSX Style

Keep JSX readable.

Bad:

Very long nested JSX.

Good:

Split into smaller components.

---

# State Management Style

Keep state close to where it is used.

Do not create unnecessary global state.

---

# API Code Style

API calls should be separated from UI components.

Good:

```
Component

↓

Service

↓

API Client
```

Bad:

```
Component

↓

Direct API Request
```

---

# CSS / Tailwind Style

Use consistent Tailwind classes.

Avoid random styles.

Prefer reusable components.

---

# File Size Rules

Avoid very large files.

If a file becomes difficult to understand:

Split it.

Suggested:

- Components: small and focused
- Services: separated by feature
- Utilities: reusable only

---

# Duplicate Code

Before writing new code:

Search existing code.

If similar logic exists:

Reuse or refactor.

Do not copy-paste.

---

# Refactoring Rules

When refactoring:

Do not change behavior.

Improve:

- Structure
- Readability
- Maintainability

Test after changes.

---

# Import Rules

Avoid unused imports.

Keep imports clean.

Do not import unnecessary libraries.

---

# Function Length

Prefer short functions.

If a function becomes too long:

Split responsibilities.

---

# Boolean Naming

Boolean variables should indicate true/false.

Good:

```
is_active

has_permission

can_edit
```

Bad:

```
status

check
```

---

# Constant Naming

Constants should use uppercase.

Example:

```python
MAX_LOGIN_ATTEMPTS = 5
```

---

# Security Related Code

Never:

- Log passwords
- Expose secrets
- Store sensitive data

Follow SECURITY.md.

---

# Final Code Review Checklist

Before finishing code:

Check:

- Is the code readable?
- Are names clear?
- Is there duplication?
- Is error handling correct?
- Does it follow architecture?
- Is it secure?
- Is it reusable?

---

# Final Coding Rule

Good code is not the shortest code.

Good code is code that another developer can understand, maintain, and improve easily.