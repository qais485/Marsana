# FRONTEND.md

# Frontend Development Rules

## Purpose

This document defines frontend architecture, React development standards, component rules, state management, styling rules, and best practices.

Every frontend feature must follow these rules.

Before creating or modifying frontend code, read this document completely.

---

# Frontend Technology Stack

Framework:

React

Build Tool:

Vite

Language:

JavaScript

Styling:

Tailwind CSS

Communication:

REST API

---

# Frontend Architecture

The frontend must follow a modular component-based architecture.

The application should be divided into:

- Pages
- Components
- Layouts
- Hooks
- Services
- Utilities
- Assets
- State Management

Each part must have a clear responsibility.

---

# Frontend Folder Structure

Recommended structure:

```
frontend/

├── src/
│
├── assets/
│
├── components/
│   ├── common/
│   └── ui/
│
├── layouts/
│
├── pages/
│
├── hooks/
│
├── services/
│
├── api/
│
├── utils/
│
├── context/
│
├── routes/
│
├── App.jsx
│
└── main.jsx
```

---

# Component Rules

Components must be:

- Small
- Reusable
- Independent
- Easy to understand

Avoid creating very large components.

If a component becomes too large:

Split it into smaller components.

---

# Component Naming

React components must use PascalCase.

Good:

```
UserCard.jsx

ProductList.jsx

Navbar.jsx
```

Bad:

```
usercard.jsx

product_list.jsx
```

---

# Component Responsibility

Each component should do one thing.

Bad:

A single component that:

- Fetches data
- Handles authentication
- Displays UI
- Contains business logic

Good:

Separate:

Component

↓

Hook

↓

Service

↓

API

---

# Pages

Pages represent application screens.

Examples:

```
LoginPage.jsx

DashboardPage.jsx

ProfilePage.jsx
```

Pages can combine multiple components.

---

# Layouts

Layouts define common structures.

Examples:

```
MainLayout

DashboardLayout

AuthLayout
```

Avoid repeating:

- Navbar
- Sidebar
- Footer

in every page.

---

# Hooks

Custom logic should be extracted into hooks.

Examples:

```
useAuth()

useFetch()

useUser()
```

Hooks should:

- Be reusable
- Have clear names
- Avoid UI logic

---

# State Management

Use the simplest solution possible.

Local state:

Use React useState.

Shared state:

Use Context API or a state management library when necessary.

Do not create global state for everything.

---

# API Communication

Frontend must communicate with backend only through API services.

Do not call APIs directly inside components.

Bad:

```
Component → fetch()
```

Good:

```
Component

↓

Service

↓

API
```

---

# API Service Structure

Example:

```
services/

authService.js

userService.js

productService.js
```

Each service handles related API calls.

---

# Data Handling

Always handle:

- Loading state
- Success state
- Error state
- Empty state

Never leave users without feedback.

---

# Forms

Forms must include:

- Input validation
- Error messages
- Loading state
- Submit handling

Avoid uncontrolled forms for complex data.

---

# Routing

Routes should be organized separately.

Example:

```
routes/

index.jsx
```

Protected routes must check authentication.

---

# Tailwind CSS Rules

Use Tailwind CSS for styling.

Avoid unnecessary CSS files.

Create reusable UI patterns.

---

# Styling Principles

Design should be:

- Clean
- Consistent
- Responsive
- Accessible

Avoid random styling decisions.

---

# Responsive Design

Every page must support:

- Mobile
- Tablet
- Desktop

Use responsive Tailwind classes.

Example:

```
sm:

md:

lg:

xl:
```

---

# UI Components

Reusable components should be created for common elements:

Examples:

```
Button

Input

Modal

Card

Table

Dropdown
```

Do not duplicate UI code.

---

# Images and Assets

Optimize images before using them.

Use meaningful names.

Example:

Good:

```
profile_avatar.png
```

Bad:

```
image1.png
```

---

# Performance Rules

Avoid unnecessary renders.

Use:

- React.memo when needed
- Lazy loading
- Code splitting

Do not optimize without a reason.

---

# Accessibility

Frontend must consider accessibility.

Examples:

- Proper HTML elements
- Labels for inputs
- Keyboard navigation
- Clear contrast

---

# Error Handling

Always show user-friendly messages.

Never display raw technical errors.

Example:

Bad:

```
AxiosError 500
```

Good:

```
Something went wrong. Please try again.
```

---

# Security Rules

Never store sensitive secrets in frontend.

Never trust frontend validation alone.

Backend must always validate important data.

---

# Adding New Features

When adding a feature:

Create:

1. Page if needed
2. Components
3. Hooks
4. API service
5. Routes
6. Validation

Follow existing patterns.

---

# Code Quality

Frontend code must:

- Be readable
- Avoid duplication
- Use reusable components
- Follow React best practices
- Keep components simple

---

# Final Frontend Rule

The frontend must always be:

Modern

Responsive

Reusable

Maintainable

User-friendly