# Phase 1: Authentication & User Management - Detailed Task Breakdown

**Phase:** 1 - Authentication & User Management  
**Duration:** Week 1 (5 days)  
**Status:** Ready to Start  
**Last Updated:** 2025-01-27

---

## Overview

This document provides a detailed, step-by-step breakdown of Phase 1 tasks. Each task includes:
- **Acceptance Criteria:** How to verify completion
- **Dependencies:** Tasks that must complete first
- **Implementation Steps:** Detailed instructions
- **Testing Requirements:** How to test
- **References:** Relevant documentation

---

## Task T1.1: Authentication Service

### T1.1.1: User Registration Endpoint

**Priority:** Critical  
**Estimated Time:** 2 hours  
**Dependencies:** T0.1.5 (Drizzle Setup), T0.2.1 (Users Table)

#### Acceptance Criteria
- [ ] `POST /auth/register` endpoint implemented
- [ ] Input validation using Zod schema
- [ ] Email uniqueness check
- [ ] Password hashing with bcrypt
- [ ] User created in database
- [ ] Returns standardized success response
- [ ] Handles duplicate email errors (400)

#### Implementation Steps

1. **Create Zod validation schema:**
   - File: `api/src/schemas/auth.ts`
   - Define registration schema:
     - email (string, email format)
     - password (string, min 8 chars)
     - username (string, optional)
     - fullName (string, optional)

2. **Create registration route:**
   - File: `api/src/routes/auth.ts`
   - Use `@hono/zod-validator` middleware
   - Check if email exists
   - Hash password with bcrypt
   - Create user in database
   - Return success response

3. **Add error handling:**
   - Handle duplicate email (400)
   - Handle validation errors (422)
   - Handle database errors (500)

#### Testing Requirements
- [ ] Registration succeeds with valid data
- [ ] Registration fails with duplicate email
- [ ] Registration fails with invalid email format
- [ ] Registration fails with weak password
- [ ] Password is hashed in database
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.1 - Registration endpoint
- `research/integration-guide.md` - Service patterns
- `research/hono-llms.md` - Hono validation patterns

---

### T1.1.2: User Login Endpoint

**Priority:** Critical  
**Estimated Time:** 2.5 hours  
**Dependencies:** T1.1.1, T0.2.1 (Users Table), T0.2.0 (Sessions Table)

#### Acceptance Criteria
- [ ] `POST /auth/login` endpoint implemented
- [ ] Email/password validation
- [ ] Password verification with bcrypt
- [ ] Session creation in database
- [ ] Returns session token
- [ ] Returns `requires2FA: true` for Exco with 2FA enabled
- [ ] Handles invalid credentials (401)

#### Implementation Steps

1. **Create login validation schema:**
   - File: `api/src/schemas/auth.ts`
   - Add login schema:
     - email (string, email format)
     - password (string)

2. **Create login route:**
   - File: `api/src/routes/auth.ts`
   - Find user by email
   - Verify password hash
   - Check if user is Exco and has 2FA enabled
   - If 2FA enabled, return `requires2FA: true` without creating session
   - If no 2FA, create session and return token

3. **Create session service:**
   - File: `api/src/services/session.ts`
   - Generate session token (UUID or JWT)
   - Store session in database
   - Set expiration time (14 days default)

4. **Add error handling:**
   - Handle invalid credentials (401)
   - Handle user not found (401)
   - Handle validation errors (422)

#### Testing Requirements
- [ ] Login succeeds with valid credentials
- [ ] Login fails with invalid email
- [ ] Login fails with wrong password
- [ ] Session created in database
- [ ] Session token returned in response
- [ ] Exco with 2FA returns `requires2FA: true`
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.1 - Login endpoint
- `research/integration-guide.md` - Session management patterns

---

### T1.1.3: Password Reset Flow

**Priority:** High  
**Estimated Time:** 2.5 hours  
**Dependencies:** T1.1.1, T0.3.4 (Email Service)

#### Acceptance Criteria
- [ ] `POST /auth/reset-password` endpoint implemented
- [ ] Generates reset token
- [ ] Stores reset token with expiration
- [ ] Sends reset email via Plunk
- [ ] `POST /auth/reset-password/confirm` endpoint implemented
- [ ] Validates reset token
- [ ] Updates password and invalidates token
- [ ] Handles expired tokens (400)

#### Implementation Steps

1. **Create password reset request schema:**
   - File: `api/src/schemas/auth.ts`
   - Add reset request schema:
     - email (string, email format)

2. **Create password reset confirmation schema:**
   - Add reset confirm schema:
     - token (string)
     - newPassword (string, min 8 chars)

3. **Create reset request route:**
   - File: `api/src/routes/auth.ts`
   - Find user by email
   - Generate secure reset token
   - Store token with expiration (15 minutes)
   - Send reset email via Plunk service
   - Return success response

4. **Create reset confirmation route:**
   - Validate reset token
   - Check token expiration
   - Hash new password
   - Update user password
   - Invalidate reset token
   - Return success response

5. **Create email template:**
   - File: `api/src/templates/password-reset.ts`
   - Include reset link with token
   - Use Plunk template system

#### Testing Requirements
- [ ] Reset request succeeds with valid email
- [ ] Reset email sent via Plunk
- [ ] Reset token stored with expiration
- [ ] Reset confirmation succeeds with valid token
- [ ] Reset confirmation fails with expired token
- [ ] Reset confirmation fails with invalid token
- [ ] Password updated in database
- [ ] Token invalidated after use

#### References
- `API_SPECIFICATION.md` Section 1.1 - Password reset endpoints
- `research/integration-guide.md` - Plunk email service

---

### T1.1.4: Session Management Service

**Priority:** Critical  
**Estimated Time:** 2 hours  
**Dependencies:** T1.1.2, T0.2.0 (Sessions Table)

#### Acceptance Criteria
- [ ] Session service created
- [ ] Create session function
- [ ] Validate session function
- [ ] Delete session function
- [ ] Session expiration handling
- [ ] Auto-renewal logic (optional)

#### Implementation Steps

1. **Create session service:**
   - File: `api/src/services/session.ts`
   - Implement `createSession(userId, expiresIn?)`
   - Implement `validateSession(token)`
   - Implement `deleteSession(token)`
   - Implement `deleteUserSessions(userId)`
   - Implement `refreshSession(token)`

2. **Add session utilities:**
   - Generate secure session token
   - Calculate expiration time
   - Check session validity

3. **Add session cleanup:**
   - Optional: Background job to clean expired sessions
   - Or: Check expiration on validation

#### Testing Requirements
- [ ] Session created successfully
- [ ] Session validated correctly
- [ ] Expired session rejected
- [ ] Session deleted successfully
- [ ] All user sessions deleted on logout

#### References
- `API_SPECIFICATION.md` Section 1.1 - Session management
- `research/integration-guide.md` - Session patterns

---

### T1.1.5: Session Validation Middleware

**Priority:** Critical  
**Estimated Time:** 1.5 hours  
**Dependencies:** T1.1.4

#### Acceptance Criteria
- [ ] Authentication middleware created
- [ ] Extracts session token from request
- [ ] Validates session token
- [ ] Attaches user to context
- [ ] Returns 401 for invalid/missing token
- [ ] Works with Hono context

#### Implementation Steps

1. **Create auth middleware:**
   - File: `api/src/middleware/auth.ts`
   - Extract token from Authorization header or cookie
   - Validate token using session service
   - Attach user to `c.get('user')`
   - Return 401 if invalid

2. **Create requireAuth helper:**
   - File: `api/src/middleware/auth.ts`
   - Export `requireAuth` function
   - Use in route handlers

3. **Test middleware:**
   - Test with valid token
   - Test with invalid token
   - Test with missing token
   - Test with expired token

#### Testing Requirements
- [ ] Middleware extracts token correctly
- [ ] Middleware validates token
- [ ] User attached to context
- [ ] 401 returned for invalid token
- [ ] 401 returned for missing token
- [ ] Works in route handlers

#### References
- `research/hono-llms.md` - Hono middleware patterns
- `API_SPECIFICATION.md` Section 1 - Authentication requirements

---

## Task T1.2: 2FA Implementation

### T1.2.1: 2FA Setup Endpoint

**Priority:** High  
**Estimated Time:** 2.5 hours  
**Dependencies:** T1.1.5 (Auth Middleware), T0.2.1 (Users Table with 2FA fields)

#### Acceptance Criteria
- [ ] `POST /auth/2fa/setup` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Generates 2FA secret
- [ ] Generates QR code
- [ ] Generates backup codes
- [ ] Stores secret in database (encrypted)
- [ ] Returns QR code and backup codes
- [ ] 2FA not enabled until verified

#### Implementation Steps

1. **Install 2FA library:**
   ```bash
   cd api
   bun add speakeasy qrcode
   ```

2. **Create 2FA service:**
   - File: `api/src/services/2fa.ts`
   - Implement `generateSecret(userEmail)`
   - Implement `generateQRCode(secret, userEmail)`
   - Implement `generateBackupCodes()`
   - Implement `encryptSecret(secret)`
   - Implement `decryptSecret(encryptedSecret)`

3. **Create 2FA setup route:**
   - File: `api/src/routes/auth.ts`
   - Check user is Exco
   - Generate secret and QR code
   - Generate backup codes
   - Store secret (encrypted) and backup codes
   - Mark 2FA as pending (not enabled yet)
   - Return QR code and backup codes

4. **Add encryption utility:**
   - File: `api/src/lib/encryption.ts`
   - Use environment variable for encryption key
   - Implement encrypt/decrypt functions

#### Testing Requirements
- [ ] 2FA setup succeeds for Exco users
- [ ] 2FA setup fails for regular members (403)
- [ ] Secret generated correctly
- [ ] QR code generated correctly
- [ ] Backup codes generated (8-10 codes)
- [ ] Secret stored encrypted in database
- [ ] 2FA marked as pending (not enabled)

#### References
- `API_SPECIFICATION.md` Section 1.2 - 2FA setup endpoint
- [speakeasy documentation](https://github.com/speakeasyjs/speakeasy)
- [qrcode documentation](https://github.com/soldair/node-qrcode)

---

### T1.2.2: 2FA Verification Endpoint

**Priority:** High  
**Estimated Time:** 2 hours  
**Dependencies:** T1.2.1, T1.1.2 (Login)

#### Acceptance Criteria
- [ ] `POST /auth/2fa/verify` endpoint implemented
- [ ] Verifies 2FA code during login
- [ ] Verifies 2FA code for setup confirmation
- [ ] Handles backup codes
- [ ] Enables 2FA after successful setup verification
- [ ] Creates session after successful verification
- [ ] Handles invalid codes (401)

#### Implementation Steps

1. **Create 2FA verification schema:**
   - File: `api/src/schemas/auth.ts`
   - Add verify schema:
     - code (string, 6 digits)
     - sessionToken (string, optional - for login)
     - setupToken (string, optional - for setup)

2. **Create 2FA verification route:**
   - File: `api/src/routes/auth.ts`
   - If setupToken provided:
     - Verify code matches pending 2FA secret
     - Enable 2FA if valid
     - Return success
   - If sessionToken provided:
     - Find pending session
     - Verify code matches user's 2FA secret
     - Check backup codes if main code fails
     - Create final session if valid
     - Return session token

3. **Update 2FA service:**
   - File: `api/src/services/2fa.ts`
   - Implement `verifyCode(secret, code)`
   - Implement `verifyBackupCode(backupCodes, code)`
   - Implement `enable2FA(userId)`

#### Testing Requirements
- [ ] 2FA verification succeeds with valid code
- [ ] 2FA verification fails with invalid code
- [ ] Backup code verification works
- [ ] 2FA enabled after setup verification
- [ ] Session created after login verification
- [ ] Invalid codes return 401

#### References
- `API_SPECIFICATION.md` Section 1.2 - 2FA verify endpoint

---

### T1.2.3: 2FA Requirement Check for Exco Login

**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** T1.1.2, T1.2.1

#### Acceptance Criteria
- [ ] Login flow checks 2FA requirement for Excos
- [ ] Exco with 2FA enabled cannot login without 2FA
- [ ] Exco without 2FA enabled can login normally
- [ ] Regular members not affected

#### Implementation Steps

1. **Update login route:**
   - File: `api/src/routes/auth.ts`
   - After password verification:
     - Check if user is Exco (check excos table for current session)
     - If Exco, check if 2FA is enabled
     - If 2FA enabled, return `requires2FA: true` without creating session
     - Store temporary session token for 2FA verification
     - If 2FA not enabled, proceed with normal login

2. **Create temporary session storage:**
   - Store pending session with short expiration (5 minutes)
   - Link to user ID and 2FA requirement

#### Testing Requirements
- [ ] Exco with 2FA returns `requires2FA: true`
- [ ] Exco without 2FA logs in normally
- [ ] Regular member logs in normally
- [ ] Temporary session expires after 5 minutes

#### References
- `API_SPECIFICATION.md` Section 1.1 - Login endpoint (2FA flow)

---

## Task T1.3: User Profile Management

### T1.3.1: Get Current User Profile

**Priority:** High  
**Estimated Time:** 1.5 hours  
**Dependencies:** T1.1.5 (Auth Middleware), T0.2.1 (Users Table), T0.2.0 (Sessions Table)

#### Acceptance Criteria
- [ ] `GET /users/me` endpoint implemented
- [ ] Requires authentication
- [ ] Returns current user's full profile
- [ ] Computes `duesPaid` based on current active session
- [ ] Computes `role` based on current active session
- [ ] Returns standardized response format

#### Implementation Steps

1. **Create get profile route:**
   - File: `api/src/routes/users.ts`
   - Use `requireAuth` middleware
   - Get user from database
   - Get current active academic session
   - Check if user has paid dues for current session
   - Check if user is Exco for current session
   - Return formatted user profile

2. **Create user service helper:**
   - File: `api/src/services/user.ts`
   - Implement `getUserProfile(userId)`
   - Implement `checkDuesPaid(userId, sessionId)`
   - Implement `checkIsExco(userId, sessionId)`

3. **Format response:**
   - Include all user fields
   - Include computed `duesPaid` boolean
   - Include computed `role` ("member" | "exco")
   - Include `has2FA` boolean

#### Testing Requirements
- [ ] Profile retrieved successfully
- [ ] `duesPaid` computed correctly
- [ ] `role` computed correctly
- [ ] `has2FA` returned correctly
- [ ] Unauthenticated requests return 401
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.3 - GET /users/me endpoint

---

### T1.3.2: Update Current User Profile

**Priority:** High  
**Estimated Time:** 1.5 hours  
**Dependencies:** T1.3.1

#### Acceptance Criteria
- [ ] `PATCH /users/me` endpoint implemented
- [ ] Requires authentication
- [ ] Input validation with Zod
- [ ] Updates user profile
- [ ] Returns updated user object
- [ ] Handles validation errors (422)

#### Implementation Steps

1. **Create update profile schema:**
   - File: `api/src/schemas/users.ts`
   - Add update schema:
     - fullName (string, optional)
     - phone (string, optional)
     - email (string, email format, optional)

2. **Create update profile route:**
   - File: `api/src/routes/users.ts`
   - Use `requireAuth` middleware
   - Use Zod validator
   - Update user in database
   - Return updated user object

3. **Add validation:**
   - Email format validation
   - Phone format validation (optional)
   - Prevent email change if already exists

#### Testing Requirements
- [ ] Profile updated successfully
- [ ] Validation errors handled correctly
- [ ] Duplicate email prevented
- [ ] Updated user returned
- [ ] Unauthenticated requests return 401
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.3 - PATCH /users/me endpoint

---

### T1.3.3: Dues Payment Endpoint

**Priority:** High  
**Estimated Time:** 3 hours  
**Dependencies:** T1.3.1, T0.3.2 (Paystack Service), T0.2.0 (Sessions Table), T0.2.2 (Dues Table)

#### Acceptance Criteria
- [ ] `PATCH /users/me/pay` endpoint implemented
- [ ] Requires authentication
- [ ] Gets current active session (or specified sessionId)
- [ ] Creates Paystack payment link
- [ ] Returns payment URL and reference
- [ ] Handles invalid session (400)
- [ ] Payment webhook handler ready (T1.3.4)

#### Implementation Steps

1. **Create dues payment schema:**
   - File: `api/src/schemas/users.ts`
   - Add payment schema:
     - amount (number, optional - defaults to config)
     - currency (string, default: "NGN")
     - sessionId (string, optional - defaults to current active)

2. **Create payment route:**
   - File: `api/src/routes/users.ts`
   - Use `requireAuth` middleware
   - Get current active session (or specified)
   - Check if user already paid for session
   - Get dues amount from config or request
   - Initialize Paystack payment
   - Store payment reference in database (pending)
   - Return payment URL and reference

3. **Integrate Paystack service:**
   - File: `api/src/services/paystack.ts`
   - Use `initializePayment` function
   - Include metadata: userId, sessionId, type: "dues"

4. **Create payment record:**
   - Store in `dues_payments` table with status "pending"
   - Link to user and session

#### Testing Requirements
- [ ] Payment link generated successfully
- [ ] Payment reference stored
- [ ] Invalid session returns 400
- [ ] Already paid returns appropriate message
- [ ] Payment URL is valid Paystack URL
- [ ] Metadata includes userId and sessionId

#### References
- `API_SPECIFICATION.md` Section 1.3 - PATCH /users/me/pay endpoint
- `research/integration-guide.md` - Paystack implementation

---

### T1.3.4: Payment Webhook Handler

**Priority:** High  
**Estimated Time:** 2.5 hours  
**Dependencies:** T1.3.3, T0.3.2 (Paystack Service)

#### Acceptance Criteria
- [ ] `POST /webhooks/paystack` endpoint implemented
- [ ] Verifies Paystack webhook signature
- [ ] Handles payment.success event
- [ ] Updates dues_payments record
- [ ] Handles payment.failed event
- [ ] Idempotent (handles duplicate webhooks)
- [ ] Returns 200 to Paystack

#### Implementation Steps

1. **Create webhook route:**
   - File: `api/src/routes/webhooks.ts`
   - Extract Paystack signature from headers
   - Verify signature using Paystack secret
   - Parse webhook event
   - Handle different event types

2. **Implement webhook handlers:**
   - Handle `charge.success`:
     - Extract payment reference
     - Find pending payment record
     - Update status to "paid"
     - Set paid_at timestamp
     - Log payment success
   - Handle `charge.failed`:
     - Update status to "failed"
     - Log payment failure

3. **Add idempotency:**
   - Check if payment already processed
   - Use payment reference as unique key
   - Return success if already processed

4. **Add webhook verification:**
   - File: `api/src/services/paystack.ts`
   - Implement `verifyWebhookSignature(signature, body)`
   - Use Paystack secret key

#### Testing Requirements
- [ ] Webhook signature verified correctly
- [ ] Payment success updates database
- [ ] Payment failure updates database
- [ ] Duplicate webhooks handled idempotently
- [ ] Invalid signature returns 401
- [ ] Returns 200 to Paystack

#### References
- `API_SPECIFICATION.md` Section 8 - Payment webhooks
- `research/integration-guide.md` - Paystack webhook verification

---

## Task T1.4: Exco-Only User Management

### T1.4.1: List All Users (Exco Only)

**Priority:** High  
**Estimated Time:** 2 hours  
**Dependencies:** T1.1.5 (Auth Middleware), T0.2.1 (Users Table)

#### Acceptance Criteria
- [ ] `GET /users` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Pagination support
- [ ] Search by name, email, matric number
- [ ] Filter by role (member/exco)
- [ ] Filter by duesPaid status (for current session)
- [ ] Returns standardized paginated response

#### Implementation Steps

1. **Create list users schema:**
   - File: `api/src/schemas/users.ts`
   - Add query schema:
     - page (number, default: 1)
     - limit (number, default: 20, max: 100)
     - search (string, optional)
     - role (string, optional: "member" | "exco")
     - duesPaid (boolean, optional)
     - sessionId (string, optional)

2. **Create requireExco middleware:**
   - File: `api/src/middleware/auth.ts`
   - Check if user is Exco for current session
   - Return 403 if not Exco

3. **Create list users route:**
   - File: `api/src/routes/users.ts`
   - Use `requireAuth` and `requireExco` middleware
   - Parse query parameters
   - Build database query with filters
   - Get current active session (or specified)
   - Compute duesPaid for each user
   - Compute role for each user
   - Apply pagination
   - Return paginated response

4. **Add search functionality:**
   - Search in name, email, matricNumber fields
   - Use PostgreSQL ILIKE or full-text search

#### Testing Requirements
- [ ] Users listed successfully
- [ ] Pagination works correctly
- [ ] Search filters results
- [ ] Role filter works
- [ ] DuesPaid filter works
- [ ] Exco-only access enforced (403 for non-Exco)
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.4 - GET /users endpoint

---

### T1.4.2: Get Specific User (Exco Only)

**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** T1.4.1

#### Acceptance Criteria
- [ ] `GET /users/{userId}` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Returns full user details
- [ ] Computes duesPaid and role
- [ ] Handles user not found (404)

#### Implementation Steps

1. **Create get user route:**
   - File: `api/src/routes/users.ts`
   - Use `requireAuth` and `requireExco` middleware
   - Extract userId from params
   - Get user from database
   - Get current active session
   - Compute duesPaid and role
   - Return user object

2. **Add error handling:**
   - Handle user not found (404)
   - Handle invalid userId format

#### Testing Requirements
- [ ] User retrieved successfully
- [ ] DuesPaid computed correctly
- [ ] Role computed correctly
- [ ] User not found returns 404
- [ ] Exco-only access enforced
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.4 - GET /users/{userId} endpoint

---

### T1.4.3: Update Specific User (Exco Only)

**Priority:** High  
**Estimated Time:** 1.5 hours  
**Dependencies:** T1.4.2

#### Acceptance Criteria
- [ ] `PATCH /users/{userId}` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Input validation with Zod
- [ ] Updates user in database
- [ ] Returns updated user object
- [ ] Handles validation errors (422)

#### Implementation Steps

1. **Create update user schema:**
   - File: `api/src/schemas/users.ts`
   - Add admin update schema:
     - fullName (string, optional)
     - email (string, email format, optional)
     - phone (string, optional)
     - role (string, optional: "member" | "exco")
     - duesPaid (boolean, optional - manual override)

2. **Create update user route:**
   - File: `api/src/routes/users.ts`
   - Use `requireAuth` and `requireExco` middleware
   - Extract userId from params
   - Validate input with Zod
   - Update user in database
   - If role changed to "exco", add to excos table for current session
   - If role changed to "member", remove from excos table
   - Return updated user object

#### Testing Requirements
- [ ] User updated successfully
- [ ] Role change updates excos table
- [ ] Validation errors handled
- [ ] Exco-only access enforced
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.4 - PATCH /users/{userId} endpoint

---

### T1.4.4: Delete User (Exco Only)

**Priority:** Medium  
**Estimated Time:** 1 hour  
**Dependencies:** T1.4.3

#### Acceptance Criteria
- [ ] `DELETE /users/{userId}` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Soft delete or hard delete (based on requirements)
- [ ] Handles user not found (404)
- [ ] Prevents self-deletion (optional)

#### Implementation Steps

1. **Create delete user route:**
   - File: `api/src/routes/users.ts`
   - Use `requireAuth` and `requireExco` middleware
   - Extract userId from params
   - Check if user exists
   - Optional: Prevent self-deletion
   - Delete user from database (or soft delete)
   - Clean up related records (sessions, etc.)
   - Return success response

2. **Add cleanup logic:**
   - Delete user sessions
   - Remove from excos table if applicable
   - Handle foreign key constraints

#### Testing Requirements
- [ ] User deleted successfully
- [ ] Related records cleaned up
- [ ] User not found returns 404
- [ ] Exco-only access enforced
- [ ] Self-deletion prevented (if implemented)

#### References
- `API_SPECIFICATION.md` Section 1.4 - DELETE /users/{userId} endpoint

---

## Task T1.5: Exco Management

### T1.5.1: Invite Exco Member

**Priority:** High  
**Estimated Time:** 2.5 hours  
**Dependencies:** T1.4.1, T0.2.3 (Excos Table), T0.3.4 (Email Service)

#### Acceptance Criteria
- [ ] `POST /excos/invite` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Creates exco record for current active session
- [ ] Sends invitation email via Plunk
- [ ] Handles duplicate exco (400)
- [ ] Returns invitation token

#### Implementation Steps

1. **Create invite exco schema:**
   - File: `api/src/schemas/excos.ts`
   - Add invite schema:
     - email (string, email format)
     - fullName (string)
     - position (string)
     - phone (string, optional)
     - sessionId (string, optional - defaults to current active)

2. **Create invite exco route:**
   - File: `api/src/routes/excos.ts`
   - Use `requireAuth` and `requireExco` middleware
   - Get current active session (or specified)
   - Check if user exists (by email)
   - Check if already exco for session
   - Create exco record in database
   - Generate invitation token
   - Send invitation email via Plunk
   - Return success response with token

3. **Create email template:**
   - File: `api/src/templates/exco-invite.ts`
   - Include exco details
   - Include invitation link (if applicable)

#### Testing Requirements
- [ ] Exco invited successfully
- [ ] Exco record created in database
- [ ] Invitation email sent
- [ ] Duplicate exco prevented (400)
- [ ] Exco-only access enforced
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.5 - POST /excos/invite endpoint
- `research/integration-guide.md` - Plunk email service

---

### T1.5.2: List All Excos

**Priority:** High  
**Estimated Time:** 1.5 hours  
**Dependencies:** T1.5.1, T0.2.3 (Excos Table)

#### Acceptance Criteria
- [ ] `GET /excos` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Filters by academic session (defaults to current active)
- [ ] Returns exco list with user details
- [ ] Returns standardized response

#### Implementation Steps

1. **Create list excos schema:**
   - File: `api/src/schemas/excos.ts`
   - Add query schema:
     - sessionId (string, optional - defaults to current active)

2. **Create list excos route:**
   - File: `api/src/routes/excos.ts`
   - Use `requireAuth` and `requireExco` middleware
   - Get current active session (or specified)
   - Query excos for session
   - Join with users table for full details
   - Return exco list

#### Testing Requirements
- [ ] Excos listed successfully
- [ ] Filters by session correctly
- [ ] Returns user details
- [ ] Exco-only access enforced
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.5 - GET /excos endpoint

---

### T1.5.3: Update Exco Details

**Priority:** High  
**Estimated Time:** 1.5 hours  
**Dependencies:** T1.5.2

#### Acceptance Criteria
- [ ] `PATCH /excos/{excoId}` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Updates exco position, phone, image
- [ ] Returns updated exco object
- [ ] Handles exco not found (404)

#### Implementation Steps

1. **Create update exco schema:**
   - File: `api/src/schemas/excos.ts`
   - Add update schema:
     - position (string, optional)
     - phone (string, optional)
     - imageUrl (string, R2 URL, optional)

2. **Create update exco route:**
   - File: `api/src/routes/excos.ts`
   - Use `requireAuth` and `requireExco` middleware
   - Extract excoId from params
   - Validate input with Zod
   - Update exco in database
   - Return updated exco object

#### Testing Requirements
- [ ] Exco updated successfully
- [ ] Exco not found returns 404
- [ ] Exco-only access enforced
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.5 - PATCH /excos/{excoId} endpoint

---

### T1.5.4: Remove Exco Member

**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** T1.5.3

#### Acceptance Criteria
- [ ] `DELETE /excos/{excoId}` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Removes exco from database
- [ ] Handles exco not found (404)
- [ ] Prevents removing last exco (optional)

#### Implementation Steps

1. **Create delete exco route:**
   - File: `api/src/routes/excos.ts`
   - Use `requireAuth` and `requireExco` middleware
   - Extract excoId from params
   - Check if exco exists
   - Optional: Check if last exco (prevent deletion)
   - Delete exco from database
   - Return success response

#### Testing Requirements
- [ ] Exco deleted successfully
- [ ] Exco not found returns 404
- [ ] Exco-only access enforced
- [ ] Last exco protection works (if implemented)

#### References
- `API_SPECIFICATION.md` Section 1.5 - DELETE /excos/{excoId} endpoint

---

## Task T1.6: Academic Sessions Management

### T1.6.1: List Academic Sessions

**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** T1.1.5 (Auth Middleware), T0.2.0 (Sessions Table)

#### Acceptance Criteria
- [ ] `GET /sessions` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Filters by active status (optional)
- [ ] Returns session list
- [ ] Returns standardized response

#### Implementation Steps

1. **Create list sessions schema:**
   - File: `api/src/schemas/sessions.ts`
   - Add query schema:
     - active (boolean, optional)

2. **Create list sessions route:**
   - File: `api/src/routes/sessions.ts`
   - Use `requireAuth` and `requireExco` middleware
   - Parse query parameters
   - Query sessions from database
   - Apply active filter if provided
   - Return session list

#### Testing Requirements
- [ ] Sessions listed successfully
- [ ] Active filter works
- [ ] Exco-only access enforced
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.7 - GET /sessions endpoint

---

### T1.6.2: Create Academic Session

**Priority:** High  
**Estimated Time:** 2 hours  
**Dependencies:** T1.6.1

#### Acceptance Criteria
- [ ] `POST /sessions` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Input validation with Zod
- [ ] Creates new session
- [ ] If isActive=true, deactivates previous active session
- [ ] Returns created session
- [ ] Handles duplicate session name (400)

#### Implementation Steps

1. **Create create session schema:**
   - File: `api/src/schemas/sessions.ts`
   - Add create schema:
     - name (string, unique)
     - startDate (ISO8601 datetime)
     - endDate (ISO8601 datetime)
     - isActive (boolean)

2. **Create create session route:**
   - File: `api/src/routes/sessions.ts`
   - Use `requireAuth` and `requireExco` middleware
   - Validate input with Zod
   - Check if session name already exists
   - If isActive=true:
     - Find current active session
     - Set isActive=false for previous session
   - Create new session
   - Return created session

3. **Add session service:**
   - File: `api/src/services/session.ts` (academic session, not auth session)
   - Implement `deactivateActiveSession()`
   - Implement `getActiveSession()`

#### Testing Requirements
- [ ] Session created successfully
- [ ] Previous active session deactivated
- [ ] Duplicate name prevented (400)
- [ ] Exco-only access enforced
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.7 - POST /sessions endpoint

---

### T1.6.3: Get Current Active Session (Public)

**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** T1.6.2

#### Acceptance Criteria
- [ ] `GET /sessions/current` endpoint implemented
- [ ] Public endpoint (no authentication required)
- [ ] Returns current active session
- [ ] Returns 404 if no active session

#### Implementation Steps

1. **Create get current session route:**
   - File: `api/src/routes/sessions.ts`
   - No authentication required
   - Query database for active session
   - Return session object
   - Return 404 if no active session

#### Testing Requirements
- [ ] Current session retrieved successfully
- [ ] No authentication required
- [ ] Returns 404 if no active session
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.7 - GET /sessions/current endpoint

---

## Task T1.7: Alumnae Management

### T1.7.1: List Alumnae Requests

**Priority:** Medium  
**Estimated Time:** 1.5 hours  
**Dependencies:** T1.1.5 (Auth Middleware), T0.2.1 (Users Table - alumnae requests)

#### Acceptance Criteria
- [ ] `GET /alumnae/requests` endpoint implemented
- [ ] Exco-only access enforced
- [ ] Pagination support
- [ ] Filter by status (pending/approved/rejected)
- [ ] Returns alumnae request list
- [ ] Returns standardized paginated response

#### Implementation Steps

1. **Create list alumnae requests schema:**
   - File: `api/src/schemas/alumnae.ts`
   - Add query schema:
     - page (number, default: 1)
     - limit (number, default: 20)
     - status (string, optional: "pending" | "approved" | "rejected")

2. **Create list alumnae requests route:**
   - File: `api/src/routes/alumnae.ts`
   - Use `requireAuth` and `requireExco` middleware
   - Parse query parameters
   - Query alumnae requests from database
   - Apply status filter if provided
   - Apply pagination
   - Return paginated response

**Note:** Alumnae requests are stored in the users table with a status field. This may need to be a separate table in the future, but for now we'll use the users table with a status field.

#### Testing Requirements
- [ ] Alumnae requests listed successfully
- [ ] Pagination works correctly
- [ ] Status filter works
- [ ] Exco-only access enforced
- [ ] Response format matches API spec

#### References
- `API_SPECIFICATION.md` Section 1.6 - GET /alumnae/requests endpoint

---

## Task Dependencies Graph

```
T1.1.1 (Registration)
  └─> T1.1.2 (Login)
      └─> T1.1.4 (Session Service)
          └─> T1.1.5 (Auth Middleware)
              ├─> T1.2.1 (2FA Setup)
              │   └─> T1.2.2 (2FA Verify)
              │       └─> T1.2.3 (2FA Requirement Check)
              ├─> T1.3.1 (Get Profile)
              │   ├─> T1.3.2 (Update Profile)
              │   └─> T1.3.3 (Dues Payment)
              │       └─> T1.3.4 (Payment Webhook)
              ├─> T1.4.1 (List Users)
              │   ├─> T1.4.2 (Get User)
              │   │   └─> T1.4.3 (Update User)
              │   │       └─> T1.4.4 (Delete User)
              │   └─> T1.5.1 (Invite Exco)
              │       ├─> T1.5.2 (List Excos)
              │       │   └─> T1.5.3 (Update Exco)
              │       │       └─> T1.5.4 (Delete Exco)
              │       └─> T1.6.1 (List Sessions)
              │           ├─> T1.6.2 (Create Session)
              │           │   └─> T1.6.3 (Get Current Session)
              │           └─> T1.7.1 (List Alumnae Requests)

T1.1.3 (Password Reset)
  └─> (Independent, uses email service)
```

---

## Daily Breakdown

### Day 1: Authentication Foundation
- T1.1.1: User Registration (2h)
- T1.1.2: User Login (2.5h)
- T1.1.4: Session Management Service (2h)
- T1.1.5: Session Validation Middleware (1.5h)
- **Total: 8 hours**

### Day 2: 2FA & Password Reset
- T1.1.3: Password Reset Flow (2.5h)
- T1.2.1: 2FA Setup (2.5h)
- T1.2.2: 2FA Verification (2h)
- T1.2.3: 2FA Requirement Check (1h)
- **Total: 8 hours**

### Day 3: User Profile & Dues Payment
- T1.3.1: Get Current User Profile (1.5h)
- T1.3.2: Update Current User Profile (1.5h)
- T1.3.3: Dues Payment Endpoint (3h)
- T1.3.4: Payment Webhook Handler (2.5h)
- **Total: 8.5 hours**

### Day 4: Exco User Management
- T1.4.1: List All Users (2h)
- T1.4.2: Get Specific User (1h)
- T1.4.3: Update Specific User (1.5h)
- T1.4.4: Delete User (1h)
- T1.5.1: Invite Exco Member (2.5h)
- **Total: 8 hours**

### Day 5: Exco Management & Sessions
- T1.5.2: List All Excos (1.5h)
- T1.5.3: Update Exco Details (1.5h)
- T1.5.4: Remove Exco Member (1h)
- T1.6.1: List Academic Sessions (1h)
- T1.6.2: Create Academic Session (2h)
- T1.6.3: Get Current Active Session (1h)
- T1.7.1: List Alumnae Requests (1.5h)
- **Total: 9.5 hours**

---

## Phase 1 Completion Checklist

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Password reset flow works
- [ ] Session management works
- [ ] Auth middleware works

### 2FA
- [ ] 2FA setup works for Excos
- [ ] 2FA verification works
- [ ] Exco login requires 2FA if enabled
- [ ] Backup codes work

### User Profile
- [ ] Get profile works
- [ ] Update profile works
- [ ] Dues payment link generation works
- [ ] Payment webhook processes correctly

### Exco User Management
- [ ] List users works (Exco only)
- [ ] Get user works (Exco only)
- [ ] Update user works (Exco only)
- [ ] Delete user works (Exco only)

### Exco Management
- [ ] Invite exco works
- [ ] List excos works
- [ ] Update exco works
- [ ] Delete exco works

### Academic Sessions
- [ ] List sessions works
- [ ] Create session works
- [ ] Get current session works (public)
- [ ] Active session switching works

### Alumnae Management
- [ ] List alumnae requests works (Exco only)

### Code Quality
- [ ] All endpoints have Zod validation
- [ ] All endpoints return standardized responses
- [ ] Error handling is comprehensive
- [ ] Authentication/authorization enforced
- [ ] Code follows project conventions

### Testing
- [ ] Unit tests for services
- [ ] Integration tests for endpoints
- [ ] Error scenarios tested
- [ ] Authorization scenarios tested

---

## Success Criteria

### Functional Requirements
- ✅ All authentication endpoints work correctly
- ✅ 2FA is mandatory for Exco members
- ✅ Role-based access control is enforced
- ✅ Sessions are secure and properly managed
- ✅ Dues payment integration works
- ✅ Academic session management works
- ✅ Exco management works

### Non-Functional Requirements
- ✅ All endpoints return standardized responses
- ✅ Error handling is comprehensive
- ✅ Code follows TypeScript best practices
- ✅ Code is well-documented
- ✅ Security best practices followed

---

## References

### Project Documents
- `API_SPECIFICATION.md` Section 1 - Authentication & User Management
- `IMPLEMENTATION_PLAN.md` Phase 1 - Requirements and tasks
- `PHASE_0_TASK_BREAKDOWN.md` - Foundation setup reference

### Research Documents
- `research/integration-guide.md` - Paystack, Plunk, service patterns
- `research/hono-llms.md` - Hono framework patterns
- `research/quick-reference.md` - Service quick reference

### External Resources
- [Hono Documentation](https://hono.dev)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Paystack API Documentation](https://paystack.com/docs/api)
- [Plunk API Documentation](https://plunk.com/docs)
- [speakeasy 2FA Documentation](https://github.com/speakeasyjs/speakeasy)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-27 | Initial Phase 1 task breakdown created |

---

**Status:** ✅ Ready for Implementation  
**Next Step:** Begin T1.1.1 - User Registration Endpoint

