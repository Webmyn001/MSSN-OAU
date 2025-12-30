# MSSN Website API Specification

**Version:** 1.2  
**Base URL:** `/api/v1`  
**Last Updated:** 2025-01-27

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Authentication & User Management](#1-authentication--user-management)
   - [Event Management](#2-event-management)
   - [E-Library](#3-e-library)
   - [Form Management](#4-form-management)
   - [Blog & Articles](#5-blog--articles)
   - [Social Media & Messaging](#6-social-media--messaging)
   - [Website Configuration](#7-website-configuration)
   - [Payment Webhooks](#8-payment-webhooks)
   - [AI Integration](#9-ai-integration)
   - [Marketing/Public Endpoints](#10-marketingpublic-endpoints)
6. [WebSocket Events](#websocket-events)
7. [External Service Integrations](#external-service-integrations)

---

## Overview

This API specification defines all endpoints for the MSSN (Muslim Students' Society of Nigeria) website. The API follows RESTful principles and uses JSON for request/response payloads.

### Base URL Structure

- **Main API:** `/api/v1`
- **Authentication:** Required for most endpoints (except public marketing endpoints)
- **Permissions:** Role-based access control (Regular Member vs Exco Member)

### User Roles

- **Regular Member:** Standard authenticated user with limited permissions
- **Exco Member:** Executive member with full administrative permissions (requires 2FA)

### Academic Sessions

The system tracks data per academic session (e.g., "2023/2024", "2024/2025"):
- **Dues Payments:** Users pay dues per academic session
- **Exco Positions:** Exco members hold positions for specific academic sessions
- **Advisors:** Advisors are assigned per academic session
- **Current Session:** One academic session is marked as active/current at any time

---

## Authentication

### Authentication Methods

1. **Session-based Authentication:** Standard username/password login
2. **Two-Factor Authentication (2FA):** Required for Exco members
   - Setup: `POST /auth/2fa/setup`
   - Verification: `POST /auth/2fa/verify`

### Authentication Headers

```http
Authorization: Bearer <session_token>
```

Or via session cookie (preferred for web applications).

---

## Response Format

### Success Response

```json
{
  "status": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "status": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

### Paginated Response

```json
{
  "status": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## Error Handling

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions (Exco-only endpoint)
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "status": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details (optional)
  }
}
```

---

## API Endpoints

### 1. Authentication & User Management

#### 1.1 User Authentication

##### `POST /auth/login`

User login with username/password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "member" | "exco",
      "requires2FA": boolean
    },
    "sessionToken": "string",
    "expiresAt": "ISO8601 datetime"
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `400` - Missing required fields

---

##### `POST /auth/register`

User registration.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phone": "string",
  "matricNumber": "string"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    },
    "message": "Registration successful"
  }
}
```

**Errors:**
- `400` - Validation error (duplicate email, weak password, etc.)
- `422` - Invalid input data

---

##### `POST /auth/reset-password`

Initiate password reset process.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "message": "Password reset email sent"
  }
}
```

---

#### 1.2 Two-Factor Authentication (2FA)

##### `POST /auth/2fa/setup`

Set up 2FA for Exco members.

**Authentication:** Required (Exco only)

**Response:**
```json
{
  "status": true,
  "data": {
    "secret": "string",
      "qrCode": "string (R2 URL or data URI)",
    "backupCodes": ["string", "string"]
  }
}
```

---

##### `POST /auth/2fa/verify`

Verify 2FA code during login.

**Request Body:**
```json
{
  "code": "string",
  "sessionToken": "string"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "authenticated": true,
    "sessionToken": "string",
    "expiresAt": "ISO8601 datetime"
  }
}
```

**Errors:**
- `401` - Invalid 2FA code
- `400` - Missing code or session token

---

#### 1.3 User Profile Management

##### `GET /users/me`

Get current user's profile.

**Authentication:** Required

**Response:**
```json
{
  "status": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "matricNumber": "string",
    "role": "member" | "exco",
    "has2FA": boolean,
    "duesPaid": boolean, // * Computed: true if user has paid dues for current active session
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime"
  }
}
```

---

##### `PATCH /users/me`

Update current user's profile.

**Authentication:** Required

**Request Body:**
```json
{
  "fullName": "string",
  "phone": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "user": {
      // Updated user object
    },
    "message": "Profile updated successfully"
  }
}
```

---

##### `PATCH /users/me/pay`

Pay for dues for the current active academic session. Returns payment link.

**Authentication:** Required

**Request Body:**
```json
{
  "amount": number,
  "currency": "NGN",
  "sessionId": "string (optional, defaults to current active session)"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "paymentUrl": "string",
    "reference": "string",
    "amount": number,
    "currency": "string",
    "sessionId": "string",
    "sessionName": "string"
  }
}
```

**Note:** Payment is processed via Paystack. Webhook will create a record in `dues_payments` table for the specified academic session.

---

#### 1.4 Exco-Only User Management

##### `GET /users`

Get all users (with pagination).

**Authentication:** Required (Exco only)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string, optional) - Search by name, email, or matric number
- `role` (string, optional) - Filter by role: "member" | "exco"
- `duesPaid` (boolean, optional) - Filter by dues payment status for current active session
- `sessionId` (string, optional) - Filter dues status for specific academic session (defaults to current active session)

**Response:**
```json
{
  "status": true,
  "data": {
    "users": [
      {
        "id": "string",
        "username": "string",
        "email": "string",
        "fullName": "string",
        "role": "member" | "exco",
        "duesPaid": boolean, // * Computed: true if user has paid dues for current active session
        "createdAt": "ISO8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

##### `GET /users/{userId}`

Get specific user details.

**Authentication:** Required (Exco only)

**Response:**
```json
{
  "status": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "phone": "string",
      "matricNumber": "string",
      "role": "member" | "exco",
      "duesPaid": boolean, // * Computed: true if user has paid dues for current active session
      "createdAt": "ISO8601 datetime",
      "updatedAt": "ISO8601 datetime"
    }
  }
}
```

---

##### `PATCH /users/{userId}`

Update specific user details.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "role": "member" | "exco",
  "duesPaid": boolean
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "user": {
      // Updated user object
    },
    "message": "User updated successfully"
  }
}
```

---

##### `DELETE /users/{userId}`

Delete a user.

**Authentication:** Required (Exco only)

**Response:**
```json
{
  "status": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

---

#### 1.5 Exco Management

##### `POST /excos/invite`

Invite an Exco member for the current active academic session.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "email": "string",
  "fullName": "string",
  "position": "string",
  "phone": "string",
  "sessionId": "string (optional, defaults to current active session)"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "message": "Invitation sent successfully",
    "inviteToken": "string"
  }
}
```

---

##### `GET /excos`

Get all Excos for a specific academic session.

**Authentication:** Required (Exco only)

**Query Parameters:**
- `sessionId` (string, optional) - Get excos for specific academic session (defaults to current active session)

**Response:**
```json
{
  "status": true,
  "data": {
    "excos": [
      {
        "id": "string",
        "userId": "string",
        "sessionId": "string",
        "sessionName": "string",
        "fullName": "string",
        "position": "string",
        "email": "string",
        "phone": "string",
        "imageUrl": "string",
        "createdAt": "ISO8601 datetime"
      }
    ]
  }
}
```

---

##### `PATCH /excos/{excoId}`

Update Exco details.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "position": "string",
  "phone": "string"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "exco": {
      // Updated exco object
    },
    "message": "Exco updated successfully"
  }
}
```

---

##### `DELETE /excos/{excoId}`

Remove an Exco member.

**Authentication:** Required (Exco only)

**Response:**
```json
{
  "status": true,
  "data": {
    "message": "Exco removed successfully"
  }
}
```

---

#### 1.6 Alumnae Management

##### `GET /alumnae/requests`

Get all alumnae requests.

**Authentication:** Required (Exco only)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional) - Filter by status: "pending" | "approved" | "rejected"

**Response:**
```json
{
  "status": true,
  "data": {
    "requests": [
      {
        "id": "string",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "graduationYear": number,
        "status": "pending" | "approved" | "rejected",
        "message": "string",
        "createdAt": "ISO8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

#### 1.7 Academic Sessions Management

##### `GET /sessions`

Get all academic sessions.

**Authentication:** Required (Exco only)

**Query Parameters:**
- `active` (boolean, optional) - Filter by active status

**Response:**
```json
{
  "status": true,
  "data": {
    "sessions": [
      {
        "id": "string",
        "name": "string",
        "startDate": "ISO8601 datetime",
        "endDate": "ISO8601 datetime",
        "isActive": boolean,
        "createdAt": "ISO8601 datetime"
      }
    ]
  }
}
```

---

##### `POST /sessions`

Create a new academic session.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "name": "string",
  "startDate": "ISO8601 datetime",
  "endDate": "ISO8601 datetime",
  "isActive": boolean
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "session": {
      "id": "string",
      "name": "string",
      "startDate": "ISO8601 datetime",
      "endDate": "ISO8601 datetime",
      "isActive": boolean,
      "createdAt": "ISO8601 datetime"
    }
  }
}
```

**Note:** When setting a new session as active, the previous active session will be automatically deactivated.

---

##### `GET /sessions/current`

Get the current active academic session (public endpoint).

**Response:**
```json
{
  "status": true,
  "data": {
    "session": {
      "id": "string",
      "name": "string",
      "startDate": "ISO8601 datetime",
      "endDate": "ISO8601 datetime",
      "isActive": true
    }
  }
}
```

---

### 2. Event Management

#### 2.1 Event CRUD Operations

##### `POST /events`

Create a new event.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "startDate": "ISO8601 datetime",
  "endDate": "ISO8601 datetime",
  "venue": "string",
  "image": "string (R2 URL)",
  "ticketPrice": number,
  "maxTickets": number,
  "isPublic": boolean
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "event": {
      "id": "string",
      "title": "string",
      "description": "string",
      "startDate": "ISO8601 datetime",
      "endDate": "ISO8601 datetime",
      "venue": "string",
      "image": "string",
      "ticketPrice": number,
      "maxTickets": number,
      "ticketsSold": number,
      "isPublic": boolean,
      "createdAt": "ISO8601 datetime",
      "createdBy": "string (user ID)"
    }
  }
}
```

---

##### `GET /events`

Get all events.

**Query Parameters:**
- `limit` (number, default: 20, max: 100)
- `skip` (number, default: 0)
- `dateFrom` (ISO8601 datetime, optional) - Filter events from this date
- `dateTo` (ISO8601 datetime, optional) - Filter events until this date
- `isPublic` (boolean, optional) - Filter by public/private events
- `search` (string, optional) - Search by title or description

**Response:**
```json
{
  "status": true,
  "data": {
    "events": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "startDate": "ISO8601 datetime",
        "endDate": "ISO8601 datetime",
        "venue": "string",
        "image": "string",
        "ticketPrice": number,
        "maxTickets": number,
        "ticketsSold": number,
        "isPublic": boolean
      }
    ],
    "pagination": {
      "limit": 20,
      "skip": 0,
      "total": 50
    }
  }
}
```

---

##### `GET /events/{eventId}`

Get details of a specific event.

**Response:**
```json
{
  "status": true,
  "data": {
    "event": {
      "id": "string",
      "title": "string",
      "description": "string",
      "startDate": "ISO8601 datetime",
      "endDate": "ISO8601 datetime",
      "venue": "string",
      "image": "string",
      "ticketPrice": number,
      "maxTickets": number,
      "ticketsSold": number,
      "ticketsAvailable": number,
      "isPublic": boolean,
      "createdAt": "ISO8601 datetime",
      "createdBy": {
        "id": "string",
        "fullName": "string"
      }
    }
  }
}
```

---

##### `PATCH /events/{eventId}`

Update event details.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "startDate": "ISO8601 datetime",
  "endDate": "ISO8601 datetime",
  "venue": "string",
  "image": "string",
  "ticketPrice": number,
  "maxTickets": number,
  "isPublic": boolean
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "event": {
      // Updated event object
    },
    "message": "Event updated successfully"
  }
}
```

---

##### `DELETE /events/{eventId}`

Delete an event.

**Authentication:** Required (Exco only)

**Response:**
```json
{
  "status": true,
  "data": {
    "message": "Event deleted successfully"
  }
}
```

---

#### 2.2 Ticket Management

##### `POST /events/{eventId}/tickets/new`

Request purchase of event ticket. Returns payment URL and ticket details.

**Authentication:** Required

**Request Body:**
```json
{
  "quantity": number,
  "attendeeName": "string",
  "attendeeEmail": "string",
  "attendeePhone": "string"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "ticket": {
      "id": "string",
      "eventId": "string",
      "quantity": number,
      "totalAmount": number,
      "status": "pending",
      "ticketCode": "string (unique ticket identifier for QR code generation)",
      "createdAt": "ISO8601 datetime"
    },
    "paymentUrl": "string",
    "reference": "string"
  }
}
```

**Note:** After successful payment (via webhook), ticket status changes to "confirmed". The frontend generates QR codes client-side using the `ticketCode` field. QR codes are not stored on the server.

---

##### `GET /events/{eventId}/tickets`

View all tickets for an event.

**Authentication:** Required (Exco only)

**Query Parameters:**
- `status` (string, optional) - Filter by status: "pending" | "confirmed" | "used" | "cancelled"
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "status": true,
  "data": {
    "tickets": [
      {
        "id": "string",
        "eventId": "string",
        "userId": "string",
        "attendeeName": "string",
        "attendeeEmail": "string",
        "quantity": number,
        "totalAmount": number,
        "status": "pending" | "confirmed" | "used" | "cancelled",
        "ticketCode": "string (unique ticket identifier for client-side QR code generation)",
        "purchasedAt": "ISO8601 datetime",
        "usedAt": "ISO8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
}
```

---

##### `GET /events/{eventId}/tickets/verify/{ticketId}`

Verify a ticket (frontend passes code from QR code to backend).

**Authentication:** Required (Exco only)

**Response:**
```json
{
  "status": true,
  "data": {
    "ticket": {
      "id": "string",
      "eventId": "string",
      "attendeeName": "string",
      "status": "confirmed" | "used",
      "isValid": boolean,
      "message": "Ticket is valid" | "Ticket already used"
    }
  }
}
```

---

##### `GET /events/{eventId}/tickets/use/{ticketId}`

Use (invalidate) a ticket (frontend passes code from QR code to backend).

**Authentication:** Required (Exco only)

**Response:**
```json
{
  "status": true,
  "data": {
    "ticket": {
      "id": "string",
      "status": "used",
      "usedAt": "ISO8601 datetime"
    },
    "message": "Ticket marked as used"
  }
}
```

---

### 3. E-Library

#### 3.1 Book Management

##### `POST /library/books`

Add a new book.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "title": "string",
  "author": "string",
  "description": "string",
  "isbn": "string",
  "category": "string",
  "coverImage": "string (R2 URL)",
  "fileUrl": "string (R2 URL to book file)",
  "fileSize": number,
  "fileType": "pdf" | "epub" | "docx"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "book": {
      "id": "string",
      "title": "string",
      "author": "string",
      "description": "string",
      "isbn": "string",
      "category": "string",
      "coverImage": "string",
      "fileUrl": "string",
      "fileSize": number,
      "fileType": "string",
      "downloadCount": number,
      "createdAt": "ISO8601 datetime",
      "createdBy": "string (user ID)"
    }
  }
}
```

---

##### `GET /library/books`

Get all books (with search and pagination).

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string, optional) - Search by title, author, or description
- `category` (string, optional) - Filter by category
- `sortBy` (string, optional) - Sort by: "title" | "author" | "createdAt" | "downloadCount"
- `sortOrder` (string, optional) - "asc" | "desc"

**Response:**
```json
{
  "status": true,
  "data": {
    "books": [
      {
        "id": "string",
        "title": "string",
        "author": "string",
        "description": "string",
        "category": "string",
        "coverImage": "string",
        "downloadCount": number,
        "createdAt": "ISO8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 200,
      "totalPages": 10
    }
  }
}
```

**Note:** Search uses PostgreSQL `pg_trgm` extension for fuzzy text matching (BM25) combined with vector embeddings for semantic search. Books have their metadata (markdown or first few pages) converted to vector embeddings. Hybrid search uses reciprocal rank fusion (RRF) to combine BM25 and semantic search results.

---

##### `GET /library/books/{bookId}`

Get details of a specific book.

**Response:**
```json
{
  "status": true,
  "data": {
    "book": {
      "id": "string",
      "title": "string",
      "author": "string",
      "description": "string",
      "isbn": "string",
      "category": "string",
      "coverImage": "string",
      "fileUrl": "string",
      "fileSize": number,
      "fileType": "string",
      "downloadCount": number,
      "createdAt": "ISO8601 datetime",
      "createdBy": {
        "id": "string",
        "fullName": "string"
      }
    }
  }
}
```

---

##### `PATCH /library/books/{bookId}`

Update book details.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "title": "string",
  "author": "string",
  "description": "string",
  "category": "string",
  "coverImage": "string"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "book": {
      // Updated book object
    },
    "message": "Book updated successfully"
  }
}
```

---

##### `DELETE /library/books/{bookId}`

Delete a book.

**Authentication:** Required (Exco only)

**Response:**
```json
{
  "status": true,
  "data": {
    "message": "Book deleted successfully"
  }
}
```

---

##### `GET /library/books/{bookId}/download`

Download a book (requires authentication).

**Authentication:** Required

**Response:**
- `302 Redirect` to signed download URL, or
- `200 OK` with file stream

**Note:** Download should be tracked (increment `downloadCount`).

---

##### `GET /library/books/recent`

Get recently downloaded books (for frontend showcase).

**Authentication:** Required

**Response:**
```json
{
  "status": true,
  "data": {
    "books": [
      {
        "id": "string",
        "title": "string",
        "author": "string",
        "coverImage": "string",
        "downloadedAt": "ISO8601 datetime"
      }
    ]
  }
}
```

---

### 4. Form Management

#### 4.1 Form CRUD Operations

##### `POST /forms`

Create a new form.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "fields": [
    {
      "type": "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio",
      "label": "string",
      "name": "string",
      "required": boolean,
      "options": ["string"] // For select, checkbox, radio
    }
  ],
  "isPublic": boolean,
  "allowMultipleSubmissions": boolean
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "form": {
      "id": "string",
      "title": "string",
      "description": "string",
      "fields": [...],
      "isPublic": boolean,
      "allowMultipleSubmissions": boolean,
      "submissionCount": number,
      "createdAt": "ISO8601 datetime",
      "createdBy": "string (user ID)"
    }
  }
}
```

---

##### `GET /forms`

Get all forms.

**Authentication:** Required (Exco only)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `isPublic` (boolean, optional)

**Response:**
```json
{
  "status": true,
  "data": {
    "forms": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "isPublic": boolean,
        "submissionCount": number,
        "createdAt": "ISO8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

---

##### `GET /forms/{formId}`

Get details of a specific form.

**Response:**
```json
{
  "status": true,
  "data": {
    "form": {
      "id": "string",
      "title": "string",
      "description": "string",
      "fields": [...],
      "isPublic": boolean,
      "allowMultipleSubmissions": boolean,
      "submissionCount": number,
      "createdAt": "ISO8601 datetime"
    }
  }
}
```

---

##### `PATCH /forms/{formId}`

Update form details.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "fields": [...],
  "isPublic": boolean,
  "allowMultipleSubmissions": boolean
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "form": {
      // Updated form object
    },
    "message": "Form updated successfully"
  }
}
```

---

##### `DELETE /forms/{formId}`

Delete a form.

**Authentication:** Required (Exco only)

**Response:**
```json
{
  "status": true,
  "data": {
    "message": "Form deleted successfully"
  }
}
```

---

#### 4.2 Form Submissions

##### `POST /forms/{formId}/submit`

Submit a form (public endpoint, but may require authentication for some forms).

**Request Body:**
```json
{
  "responses": {
    "fieldName1": "value1",
    "fieldName2": "value2"
  }
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "submission": {
      "id": "string",
      "formId": "string",
      "responses": {...},
      "submittedAt": "ISO8601 datetime"
    },
    "message": "Form submitted successfully"
  }
}
```

---

##### `GET /forms/{formId}/submissions`

Get all submissions for a specific form.

**Authentication:** Required (Exco only)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "status": true,
  "data": {
    "submissions": [
      {
        "id": "string",
        "formId": "string",
        "responses": {...},
        "submittedAt": "ISO8601 datetime",
        "submittedBy": "string (user ID or null for anonymous)"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
}
```

---

##### `GET /forms/submissions`

Get all form submissions (across all forms).

**Authentication:** Required (Exco only)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `formId` (string, optional) - Filter by form ID

**Response:**
```json
{
  "status": true,
  "data": {
    "submissions": [
      {
        "id": "string",
        "formId": "string",
        "formTitle": "string",
        "responses": {...},
        "submittedAt": "ISO8601 datetime",
        "submittedBy": "string (user ID or null)"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500
    }
  }
}
```

---

### 5. Blog & Articles

#### 6.1 Article CRUD Operations

##### `POST /blog/articles`

Create a new article.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "title": "string",
  "slug": "string",
  "content": "string (HTML or Markdown)",
  "excerpt": "string",
  "featuredImage": "string (R2 URL)",
  "tags": ["string"],
  "category": "string",
  "isPublished": boolean,
  "publishedAt": "ISO8601 datetime"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "article": {
      "id": "string",
      "title": "string",
      "slug": "string",
      "content": "string",
      "excerpt": "string",
      "featuredImage": "string",
      "tags": ["string"],
      "category": "string",
      "isPublished": boolean,
      "publishedAt": "ISO8601 datetime",
      "viewCount": number,
      "createdAt": "ISO8601 datetime",
      "createdBy": "string (user ID)",
      "updatedAt": "ISO8601 datetime"
    }
  }
}
```

---

##### `GET /blog/articles`

Get all articles (with search functionality).

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional) - Search by title, content, or tags
- `category` (string, optional) - Filter by category
- `tag` (string, optional) - Filter by tag
- `isPublished` (boolean, optional) - Filter by published status (default: true for non-Exco users)

**Response:**
```json
{
  "status": true,
  "data": {
    "articles": [
      {
        "id": "string",
        "title": "string",
        "slug": "string",
        "excerpt": "string",
        "featuredImage": "string",
        "tags": ["string"],
        "category": "string",
        "viewCount": number,
        "publishedAt": "ISO8601 datetime",
        "author": {
          "id": "string",
          "fullName": "string"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
}
```

**Note:** Search uses PostgreSQL `pg_trgm` extension for fuzzy text matching with proper indexing.

---

##### `GET /blog/articles/{articleId}`

Get a specific article.

**Response:**
```json
{
  "status": true,
  "data": {
    "article": {
      "id": "string",
      "title": "string",
      "slug": "string",
      "content": "string",
      "excerpt": "string",
      "featuredImage": "string",
      "tags": ["string"],
      "category": "string",
      "isPublished": boolean,
      "publishedAt": "ISO8601 datetime",
      "viewCount": number,
      "createdAt": "ISO8601 datetime",
      "author": {
        "id": "string",
        "fullName": "string"
      },
      "updatedAt": "ISO8601 datetime"
    }
  }
}
```

**Note:** Increment `viewCount` on each request.

---

##### `PATCH /blog/articles/{articleId}`

Update an article.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "title": "string",
  "slug": "string",
  "content": "string",
  "excerpt": "string",
  "featuredImage": "string",
  "tags": ["string"],
  "category": "string",
  "isPublished": boolean,
  "publishedAt": "ISO8601 datetime"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "article": {
      // Updated article object
    },
    "message": "Article updated successfully"
  }
}
```

---

##### `DELETE /blog/articles/{articleId}`

Delete an article.

**Authentication:** Required (Exco only)

**Response:**
```json
{
  "status": true,
  "data": {
    "message": "Article deleted successfully"
  }
}
```

---

### 6. Social Media & Messaging

#### 7.1 Social Media Integration

##### `GET /social/login?provider=facebook|x|instagram|linkedin`

Get authorization URL for social media provider.

**Authentication:** Required (Exco only)

**Query Parameters:**
- `provider` (required) - "facebook" | "x" | "instagram" | "linkedin"

**Response:**
```json
{
  "status": true,
  "data": {
    "authorizationUrl": "string",
    "provider": "string"
  }
}
```

---

##### `POST /social/post?provider`

Post to social media platforms.

**Authentication:** Required (Exco only)

**Query Parameters:**
- `provider` (required) - "facebook" | "x" | "instagram" | "linkedin"

**Request Body:**
```json
{
  "content": "string",
  "image": "string (URL, optional)",
  "platforms": ["facebook", "x", "instagram", "linkedin"] // Multiple platforms for simultaneous posting
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "posts": [
      {
        "platform": "string",
        "postId": "string",
        "url": "string",
        "status": "success" | "failed",
        "error": "string (if failed)"
      }
    ]
  }
}
```

---

#### 6.2 SMS Messaging

##### `POST /sms/send?phone[]&message[]`

Send bulk SMS messages.

**Authentication:** Required (Exco only)

**Query Parameters:**
- `phone[]` (array of strings) - Phone numbers
- `message[]` (array of strings) - Messages (supports variables like `{{name}}`, `{{phone}}`)

**Request Body (Alternative):**
```json
{
  "recipients": [
    {
      "phone": "string",
      "name": "string",
      "variables": {
        "name": "string",
        "phone": "string",
        // Custom variables
      }
    }
  ],
  "messageTemplate": "string (with {{variable}} placeholders)"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "sent": number,
    "failed": number,
    "results": [
      {
        "phone": "string",
        "status": "success" | "failed",
        "messageId": "string",
        "error": "string (if failed)"
      }
    ]
  }
}
```

**Note:** Integration with Kudisms.net. Variables like `{{name}}` and `{{phone}}` are replaced with actual values.

---

#### 6.3 WhatsApp (UI-Only)

**Note:** WhatsApp messaging is handled client-side only. The frontend constructs WhatsApp links using the `wa.me` URL format:

```
https://wa.me/{phone_number}?text={url_encoded_message}
```

**Example:**
```
https://wa.me/2341234567890?text=Hello%20{{name}}%2C%20this%20is%20a%20message
```

The frontend should:
1. Replace variables (e.g., `{{name}}`, `{{phone}}`) in the message template
2. URL-encode the message
3. Construct the `wa.me` link
4. Open the link in a new window/tab (user's WhatsApp will open)

**No API endpoint is required for WhatsApp messaging.**

---

### 7. Website Configuration

#### 8.1 Configuration Management

##### `GET /config`

Get website constants.

**Response:**
```json
{
  "status": true,
  "data": {
    "phoneNumbers": ["string"],
    "address": "string",
    "contactEmail": "string",
    "advisors": [
      {
        "id": "string",
        "name": "string",
        "position": "string",
        "email": "string",
        "phone": "string",
        "image": "string"
      }
    ],
    "excos": [
      {
        "id": "string",
        "name": "string",
        "position": "string",
        "email": "string",
        "phone": "string",
        "image": "string"
      }
    ],
    "prayerTimes": [
      {
        "mosque": "string",
        "fajr": "string",
        "dhuhr": "string",
        "asr": "string",
        "maghrib": "string",
        "isha": "string"
      }
    ],
    "websiteSettings": {
      // Additional website variables
    }
  }
}
```

---

##### `PATCH /config`

Update website constants.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "phoneNumbers": ["string"],
  "address": "string",
  "contactEmail": "string",
    "advisors": [...], // * Advisors for current active session
    "excos": [...], // * Excos for current active session
  "prayerTimes": [...],
  "websiteSettings": {...}
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "config": {
      // Updated config object
    },
    "message": "Configuration updated successfully"
  }
}
```

---

### 8. Payment Webhooks

#### 9.1 Payment Processing

##### `POST /payment/webhook`

Process payment webhook notifications (handles ticket purchase, annual dues payment).

**Authentication:** Webhook signature verification (Paystack)

**Request Body:**
```json
{
  // Paystack webhook payload
  "event": "charge.success",
  "data": {
    "reference": "string",
    "amount": number,
    "customer": {
      "email": "string",
      "phone": "string"
    },
    "metadata": {
      "type": "ticket" | "dues",
      "eventId": "string (for tickets)",
      "userId": "string",
      "ticketId": "string (for tickets)"
    }
  }
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "message": "Webhook processed successfully"
  }
}
```

**Note:** This endpoint should:
1. Verify webhook signature
2. Update ticket status to "confirmed" (for ticket purchases) - QR codes are generated client-side by the frontend
3. Create record in `dues_payments` table for the specified academic session (for dues payments)
4. Send confirmation email/SMS

---

### 9. AI Integration

#### 10.1 AI Content Generation

##### `POST /ai/prompt`

Communicate with Gemini AI API.

**Authentication:** Required (Exco only)

**Request Body:**
```json
{
  "prompt": "string",
  "context": "string (optional)",
  "type": "blog-suggestion" | "content-edit" | "general"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "response": "string",
    "suggestions": ["string"],
    "metadata": {
      "model": "string",
      "tokens": number
    }
  }
}
```

**Note:** Used primarily for blog content suggestions and editing. Single flexible endpoint for various AI prompts.

---

### 10. Marketing/Public Endpoints

#### 11.1 Public Information Endpoints

##### `GET /advisors`

Get all advisors for a specific academic session (public endpoint).

**Query Parameters:**
- `sessionId` (string, optional) - Get advisors for specific academic session (defaults to current active session)

**Response:**
```json
{
  "status": true,
  "data": {
    "advisors": [
      {
        "id": "string",
        "sessionId": "string",
        "sessionName": "string",
        "name": "string",
        "position": "string",
        "email": "string",
        "phone": "string",
        "imageUrl": "string",
        "createdAt": "ISO8601 datetime"
      }
    ]
  }
}
```

---

##### `GET /excos`

Get all Excos for a specific academic session (public endpoint).

**Query Parameters:**
- `sessionId` (string, optional) - Get excos for specific academic session (defaults to current active session)

**Response:**
```json
{
  "status": true,
  "data": {
    "excos": [
      {
        "id": "string",
        "userId": "string",
        "sessionId": "string",
        "sessionName": "string",
        "name": "string",
        "position": "string",
        "email": "string",
        "phone": "string",
        "imageUrl": "string",
        "createdAt": "ISO8601 datetime"
      }
    ]
  }
}
```

---

##### `GET /committees`

Get all committees (public endpoint).

**Response:**
```json
{
  "status": true,
  "data": {
    "committees": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "members": [
          {
            "name": "string",
            "position": "string",
            "image": "string"
          }
        ]
      }
    ]
  }
}
```

---

##### `GET /info`

Get general website information (public endpoint).

**Response:**
```json
{
  "status": true,
  "data": {
    "info": {
      "about": "string",
      "mission": "string",
      "vision": "string",
      "history": "string"
    }
  }
}
```

---

##### `GET /programmes`

Get all programmes (public endpoint).

**Response:**
```json
{
  "status": true,
  "data": {
    "programmes": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "image": "string",
        "schedule": "string"
      }
    ]
  }
}
```

---

##### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": true,
  "message": "alive and kicking 💪"
}
```

---

## WebSocket Events

**Note:** WebSocket events are not currently required. This section is reserved for future implementation.

---

## External Service Integrations

### Payment Gateways

- **Paystack:** For ticket purchases and annual dues

### Email Services

- **Zoho:** Free tier for email hosting (info@domain.com, Amir, Naib Ameer, etc.)
- **Plunk Email API:** For transactional emails

### SMS & Messaging

- **Kudisms.net:** Bulk SMS service
- **WhatsApp:** Client-side only, using `wa.me` links (no API integration required)

### AI Services

- **Gemini AI API:** For blog content suggestions and editing

### Social Media APIs

- **Facebook API:** For posting to Facebook
- **X (Twitter) API:** For posting to X/Twitter
- **Instagram API:** For posting to Instagram
- **LinkedIn API:** For posting to LinkedIn

### Storage

- **Cloudflare R2:** Object storage for files, images, and book uploads
  - All file uploads should use R2 presigned URLs
  - Avoid using base64 encoding for file data in API requests/responses
  - Generate R2 URLs for images, book files, and other media assets

---

## Implementation Notes

### Authentication Flow

1. User logs in with `POST /auth/login`
2. If user is Exco and has 2FA enabled, response includes `requires2FA: true`
3. Frontend prompts for 2FA code
4. User submits code via `POST /auth/2fa/verify`
5. On success, session token is returned

### Permission Enforcement

All Exco-only endpoints must:
1. Verify authentication token
2. Check user role is "exco"
3. Return `403 Forbidden` if user is not Exco

### Payment Flow

1. User requests ticket purchase via `POST /events/{eventId}/tickets/new`
2. Backend creates pending ticket with unique `ticketCode` and returns payment URL
3. User completes payment on Paystack
4. Paystack sends webhook to `POST /payment/webhook`
5. Backend verifies webhook signature
6. Backend updates ticket status to "confirmed"
7. Frontend generates QR code client-side using the `ticketCode` from the ticket data
8. Backend sends confirmation email/SMS

### Search Implementation

- **Blog articles:** Use PostgreSQL `pg_trgm` extension for fuzzy text matching with proper indexing
- **Library books:** Hybrid search implementation:
  - **BM25 (Keyword Search):** Using PostgreSQL `pg_trgm` extension for fuzzy text matching on title, author, description
  - **Semantic Search:** Vector embeddings generated from book metadata (markdown or first few pages of content)
  - **Reciprocal Rank Fusion (RRF):** Combines BM25 and semantic search results for optimal relevance
  - Books should have their metadata extracted and converted to vector embeddings on upload
  - Consider using pgvector extension for vector similarity search

### File Uploads & Storage

- **Storage Provider:** Cloudflare R2 for all file storage
- **File Types:**
  - Book files (PDF, EPUB, DOCX): Store in R2, generate presigned URLs for secure downloads
  - Images (covers, featured images, avatars): Store in R2, serve via R2 URLs
  - QR codes: Generated client-side by the frontend (not stored on server)
- **Best Practices:**
  - **Never use base64 encoding** in API requests/responses for file data
  - Upload files directly to R2 using presigned URLs
  - Return R2 URLs in API responses
  - Generate presigned URLs with appropriate expiration times for secure downloads

---

## Version History

- **v1.2** (2025-01-27): Added LinkedIn platform, pg_trgm for search, R2 for storage, vector embeddings for book hybrid search
- **v1.1** (2025-01-27): Removed quiz platform, updated WhatsApp to UI-only, removed Flutterwave/Algolia/Recombee/Pantry references
- **v1.0** (2025-01-27): Initial API specification based on PRD

---

## Appendix: Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `AUTH_INVALID` | Invalid authentication credentials |
| `AUTH_2FA_REQUIRED` | 2FA verification required |
| `AUTH_2FA_INVALID` | Invalid 2FA code |
| `PERMISSION_DENIED` | Insufficient permissions (Exco-only endpoint) |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Resource not found |
| `RESOURCE_EXISTS` | Resource already exists (e.g., duplicate email) |
| `PAYMENT_FAILED` | Payment processing failed |
| `EXTERNAL_SERVICE_ERROR` | External service integration error |
| `INTERNAL_ERROR` | Internal server error |

---

**End of API Specification**

