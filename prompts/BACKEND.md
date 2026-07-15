# BACKEND.md

# Backend Development Rules

## Purpose

This document defines the backend architecture, development standards, and implementation rules.

Every backend feature must follow these rules.

Before creating or modifying backend code, read this document completely.

Never break the backend architecture without approval.

---

# Backend Technology Stack

## Programming Language

Python

## Framework

FastAPI

## Database

PostgreSQL

## ORM

SQLAlchemy

## Data Validation

Pydantic

## Database Migration

Alembic

---

# Backend Architecture

The backend must follow a modular layered architecture.

The main layers are:

- API Layer
- Router Layer
- Schema Layer
- Service Layer
- Repository Layer
- Database Layer
- Model Layer
- Core Layer


Each layer has a specific responsibility.

---

# Backend Folder Structure

The backend should follow this structure:

```
backend/

├── app/
│
│── main.py
│
├── core/
│   ├── config.py
│   ├── security.py
│   └── dependencies.py
│
├── database/
│   ├── session.py
│   └── base.py
│
├── models/
│   └── database_models.py
│
├── schemas/
│   └── request_response_models.py
│
├── repositories/
│   └── database_operations.py
│
├── services/
│   └── business_logic.py
│
├── api/
│   └── routes/
│       └── endpoints.py
│
└── utils/
    └── helpers.py
```

---

# Layer Responsibilities

## Router Layer

Responsible for:

- Receiving HTTP requests
- Validating request data
- Calling services
- Returning responses

Routers must NOT contain business logic.

Bad:

```
Calculate price
Access database
Send email
```

inside router.

Good:

```
Router → Service → Repository → Database
```

---

# Service Layer

The service layer contains business logic.

Examples:

- User registration logic
- Payment calculations
- Permission checking
- Data processing

Services must not handle HTTP requests directly.

---

# Repository Layer

The repository layer is responsible for database communication.

Only repositories can directly interact with SQLAlchemy queries.

Examples:

Allowed:

```
Get user by email
Create product
Update order
Delete record
```

Not allowed:

Business decisions inside repositories.

---

# Database Models

All database tables must be created using SQLAlchemy models.

Rules:

- One model represents one database table.
- Models must only describe database structure.
- Business logic must not exist inside models.

Example:

Good:

```
User
Product
Order
```

Bad:

```
User.send_email()
User.calculate_payment()
```

---

# Pydantic Schemas

Schemas define API input and output.

Every API endpoint must have:

- Request schema
- Response schema

Never return SQLAlchemy models directly.

Example:

Database Model:

```
User
```

Response Schema:

```
UserResponse
```

---

# API Design Rules

All APIs must follow REST principles.

Use:

GET

For retrieving data.


POST

For creating data.


PUT/PATCH

For updating data.


DELETE

For deleting data.

---

# API Naming

Use plural nouns.

Good:

```
/users

/products

/orders
```

Bad:

```
/getUser

/createProduct
```

---

# API Response Format

All responses must have a consistent structure.

Example:

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {}
}
```

---

# Error Handling

Never return raw exceptions.

Use proper HTTP status codes.

Examples:

400

Bad request


401

Unauthorized


403

Forbidden


404

Not found


500

Internal server error


---

# Authentication

Authentication must use secure methods.

Recommended:

JWT Authentication

Rules:

- Store password as hash.
- Never store plain passwords.
- Validate tokens.
- Protect private routes.

---

# Authorization

Authentication:

"Who are you?"

Authorization:

"What can you access?"

Always separate these concepts.

Use role-based permissions when needed.

---

# Dependency Injection

FastAPI dependencies must be used for:

- Database sessions
- Authentication
- Permissions
- Shared services

Avoid creating repeated objects manually.

---

# Environment Configuration

Never hardcode:

- Database URLs
- Secret keys
- API keys

Use environment variables.

Example:

```
DATABASE_URL

SECRET_KEY

ACCESS_TOKEN_EXPIRE_TIME
```

---

# Database Sessions

Database sessions must:

- Open correctly
- Close correctly
- Handle errors safely

Never create unlimited database connections.

---

# Async Rules

Use async when it improves performance.

Do not use async everywhere without reason.

Database operations must follow SQLAlchemy async standards if async mode is selected.

---

# Validation

Every external input must be validated.

Validate:

- Request bodies
- Query parameters
- File uploads
- User data

Never trust client input.

---

# Logging

Important events should be logged.

Examples:

- Authentication attempts
- Errors
- Important operations

Never log:

- Passwords
- Tokens
- Sensitive information

---

# Testing Rules

Every important service should have tests.

Test:

- Business logic
- API responses
- Authentication
- Database operations

---

# Backend Code Quality

Backend code must:

- Be modular
- Be readable
- Avoid duplication
- Follow PEP 8
- Use type hints
- Have clear responsibilities

---

# Adding New Features

When adding a new feature:

Create:

1. Database model if needed
2. Migration
3. Schema
4. Repository
5. Service
6. Router
7. Tests

Follow the existing architecture.

---

# Final Backend Rule

The backend must always remain:

Secure

Modular

Scalable

Maintainable

Easy to understand