# DATABASE.md

# Database Development Rules

## Purpose

This document defines database architecture, design principles, naming conventions, relationships, and data management rules.

Every database-related implementation must follow these rules.

---

# Database Technology

Database:

PostgreSQL

ORM:

SQLAlchemy

Migration Tool:

Alembic

---

# Database Design Principles

The database must be:

- Clean
- Consistent
- Scalable
- Secure
- Optimized
- Easy to maintain

Database design decisions should consider future growth.

---

# Database Responsibilities

The database is responsible for:

- Storing data
- Maintaining relationships
- Ensuring data integrity
- Performing efficient queries

Business logic must not be placed inside the database.

Business rules belong to the service layer.

---

# Table Naming Rules

Use plural names for tables.

Use lowercase.

Use snake_case.

Examples:

Good:

```
users

products

orders

order_items
```

Bad:

```
User

ProductTable

tbl_users
```

---

# Column Naming Rules

All columns must use:

- lowercase
- snake_case

Examples:

Good:

```
first_name

created_at

phone_number
```

Bad:

```
firstName

CreatedAt

PhoneNumber
```

---

# Primary Keys

Every table must have a primary key.

Use:

```
id
```

as the default primary key name.

Example:

```
users

id
name
email
```

---

# ID Type

Use UUID for important production systems.

Example:

```
id = UUID
```

Benefits:

- Better security
- Easier distributed systems
- Avoid exposing record counts

Integer IDs can be used for simple internal systems.

---

# Timestamp Columns

Important tables should include:

```
created_at

updated_at
```

Example:

```
created_at TIMESTAMP

updated_at TIMESTAMP
```

These fields help with:

- Tracking changes
- Debugging
- Auditing

---

# Soft Delete

For important data, prefer soft delete.

Instead of removing data:

```
DELETE FROM users
```

Use:

```
is_deleted = true
```

or:

```
deleted_at
```

Benefits:

- Data recovery
- Better auditing
- Safer operations

---

# Relationships

Use proper relational design.

Main relationships:

## One To One

Example:

User → Profile


## One To Many

Example:

User → Orders


## Many To Many

Example:

Users → Roles

---

# Foreign Keys

Always use foreign keys for relationships.

Example:

orders table:

```
user_id
```

references:

```
users.id
```

Foreign keys protect data integrity.

---

# Relationship Rules

Relationships must be clearly defined in SQLAlchemy models.

Example:

User:

```
users
```

has many:

```
orders
```

Order:

```
orders
```

belongs to:

```
user
```

---

# Database Normalization

Avoid duplicate data.

Follow normalization principles.

Do not store the same information in multiple tables.

Example:

Bad:

```
orders

user_name
user_email
```

Good:

```
orders

user_id
```

---

# Indexing Rules

Create indexes for frequently searched fields.

Examples:

Good candidates:

```
email

username

created_at

foreign keys
```

Do not create unnecessary indexes.

Too many indexes reduce write performance.

---

# Unique Constraints

Use unique constraints for fields that must be unique.

Examples:

```
email

username

phone_number
```

Database should enforce important rules.

---

# Data Types

Choose correct PostgreSQL data types.

Examples:

Text:

```
VARCHAR
TEXT
```

Numbers:

```
INTEGER
NUMERIC
```

Dates:

```
TIMESTAMP
DATE
```

Boolean:

```
BOOLEAN
```

IDs:

```
UUID
```

---

# SQLAlchemy Model Rules

SQLAlchemy models must:

- Represent database structure only
- Use clear relationships
- Include type hints
- Avoid business logic

Example:

Good:

```
class User(Base):
    id
    email
    password_hash
```

Bad:

```
class User(Base):
    login()
    send_email()
```

---

# Migration Rules

Every database structure change must use migrations.

Never manually modify production databases.

Migration files should be:

- Small
- Clear
- Reversible

---

# Query Rules

Database queries must:

- Be efficient
- Avoid unnecessary joins
- Avoid N+1 problems
- Use pagination for large datasets

---

# Pagination

Large data lists must use pagination.

Example:

```
?page=1&limit=20
```

Never return thousands of records unnecessarily.

---

# Data Security

Never store:

- Plain passwords
- Sensitive secrets
- API keys

Always hash sensitive information.

---

# Backup Considerations

Important databases should support:

- Regular backups
- Recovery plans
- Data protection

---

# Database Performance Rules

Before optimizing:

Measure the problem.

Use:

- Indexes
- Query optimization
- Proper relationships

Avoid premature optimization.

---

# Adding New Tables

Before creating a new table:

Check:

- Does this data already exist?
- Can an existing table be extended?
- Is the relationship correct?

Avoid unnecessary tables.

---

# Final Database Rule

The database must always be:

Reliable

Consistent

Secure

Scalable

Easy to understand