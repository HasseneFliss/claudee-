# Technical Specification

## Summary

Comprehensive authentication specification for Next.js e-commerce application with JWT-based auth, Google OAuth, email verification, password reset, session management, and robust security features. Includes 15 API endpoints, 6 database tables, rate limiting, audit logging, and production-ready security measures.

## API Specification

See [api-spec.json](./api-spec.json) for the complete OpenAPI specification.

**Endpoints:** 16 paths, 16 operations

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/me` | Get current user profile |
| POST | `/auth/login` | Login with email and password |
| POST | `/auth/logout` | Logout and invalidate tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/register` | Register new user with email and password |
| GET | `/auth/sessions` | Get active user sessions |
| POST | `/auth/link-oauth` | Link OAuth account to existing user |
| GET | `/auth/oauth/google` | Initiate Google OAuth flow |
| POST | `/auth/unlink-oauth` | Unlink OAuth account |
| GET | `/auth/verify-email` | Verify email address |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/change-password` | Change password for authenticated user |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/resend-verification` | Resend email verification |
| DELETE | `/auth/sessions/{sessionId}` | Revoke specific session |

*... and 1 more endpoints*

**Data Schemas:** 17 models

## Database Schema

See [database-schema.json](./database-schema.json) for the complete schema.

**Tables:** 7

| Table | Columns | Description |
|-------|---------|-------------|
| `users` | 14 | - |
| `oauth_accounts` | 10 | - |
| `email_verification_tokens` | 6 | - |
| `password_reset_tokens` | 6 | - |
| `refresh_tokens` | 11 | - |
| `login_attempts` | 7 | - |
| `audit_logs` | 9 | - |

## Architecture

See [architecture.json](./architecture.json) for complete architecture details.

## Authentication

See [authentication.json](./authentication.json) for complete auth details.

