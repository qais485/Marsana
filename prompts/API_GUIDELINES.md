# API_GUIDELINES.md

# API Development Rules

## Purpose

This document defines API design standards, endpoint structures, response formats, validation rules, and communication patterns.

Every API endpoint must follow these rules.

Before creating a new API, read this document completely.

---

# API Principles

The API must be:

- Predictable
- Consistent
- Secure
- Easy to use
- Easy to maintain
- Scalable

The frontend should always know:

- How to send requests
- What response format to expect
- How to handle errors

---

# API Architecture

The request flow must follow:

```
Client

↓

Router

↓

Service

↓

Repository

↓

Database
```

Rules:

- Router handles HTTP communication.
- Service handles business logic.
- Repository handles database operations.

Do not put business logic inside routers.

---

# API Style

Use REST architecture.

Resources should be represented as nouns.

Good:

```
/users

/products

/orders
```

Bad:

```
/getUsers

/createProduct
```

---

# HTTP Methods

## GET

Used for retrieving data.

Example:

```
GET /users
```

---

## POST

Used for creating resources.

Example:

```
POST /users
```

---

## PUT

Used for full updates.

Example:

```
PUT /users/{id}
```

---

## PATCH

Used for partial updates.

Example:

```
PATCH /users/{id}
```

---

## DELETE

Used for removing resources.

Example:

```
DELETE /users/{id}
```

---

# URL Naming Rules

Use:

- lowercase
- plural nouns
- hyphens when needed

Good:

```
/user-profiles
```

Bad:

```
/UserProfiles
```

---

# API Versioning

APIs should support versioning.

Recommended:

```
/api/v1/users
```

Future versions:

```
/api/v2/users
```

---

# Request Validation

Every request must be validated.

Validate:

- Required fields
- Data types
- Length limits
- Allowed values
- Formats

Use Pydantic schemas.

---

# Response Format

All successful responses should follow a consistent format.

Example:

```json
{
    "success": true,
    "message": "User created successfully",
    "data": {
        "id": 1,
        "name": "John"
    }
}
```

---

# Error Response Format

All errors should have a consistent structure.

Example:

```json
{
    "success": false,
    "message": "Invalid email address",
    "error_code": "INVALID_EMAIL"
}
```

---

# HTTP Status Codes

Use correct status codes.

## 200

Successful request.

## 201

Resource created.

## 204

Successful request with no content.

## 400

Bad request.

## 401

Authentication required.

## 403

Permission denied.

## 404

Resource not found.

## 422

Validation error.

## 500

Server error.

---

# Pagination

Large lists must use pagination.

Example:

```
GET /products?page=1&limit=20
```

Response:

```json
{
    "data": [],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100
    }
}
```

---

# Filtering

Filtering should use query parameters.

Example:

```
GET /products?category=phone
```

---

# Sorting

Sorting should be explicit.

Example:

```
GET /products?sort=price
```

Descending:

```
GET /products?sort=-price
```

---

# Searching

Search should use clear parameters.

Example:

```
GET /products?search=laptop
```

---

# Authentication Headers

Protected APIs should use authentication.

Example:

```
Authorization: Bearer TOKEN
```

---

# Public vs Private Routes

Public:

No authentication required.

Examples:

- Login
- Register

Private:

Authentication required.

Examples:

- Profile
- Orders
- Settings

---

# File Upload APIs

File upload endpoints must validate:

- File type
- File size
- File name

Never trust uploaded files.

---

# API Documentation

FastAPI automatic documentation should remain available.

Use:

Swagger UI

and

ReDoc

Maintain clear:

- Endpoint descriptions
- Request schemas
- Response schemas

---

# Database Rules

API endpoints must never directly access database.

Wrong:

```
Router → Database
```

Correct:

```
Router → Service → Repository → Database
```

---

# Business Logic Rules

Business rules belong in services.

Example:

Wrong:

```python
if user.age > 18:
```

inside router.

Correct:

Service handles the decision.

---

# Authentication API Rules

Login endpoint should:

- Validate credentials
- Generate tokens
- Return safe user information

Never return:

- Password
- Password hash
- Sensitive data

---

# API Security

APIs must:

- Validate input
- Check permissions
- Prevent unauthorized access
- Return safe errors

---

# Naming Response Schemas

Use clear names.

Examples:

```
UserCreateRequest

UserResponse

UserUpdateRequest
```

Avoid:

```
UserData1

Response2
```

---

# API Changes

Before changing an existing API:

Check:

- Frontend dependencies
- Existing clients
- Database impact

Avoid breaking changes.

---

# Final API Rule

Every API should be:

Clear

Consistent

Secure

Documented

Easy to consume