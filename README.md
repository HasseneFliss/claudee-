# Hello World Application

## Overview
A simple yet powerful Hello World application with modern features.

## Features

### Core Features
- Hello World greeting function
- Customizable name parameter
- API endpoint for greetings

### User Authentication
- Users can log in with email/password
- OAuth support for Google and GitHub login
- Session management with JWT tokens

### Dark Mode
- Toggle between light and dark themes
- Automatic system preference detection
- Persists user preference in localStorage

### User Profile Page
- View and edit user profile
- Avatar upload with image cropping
- Change password functionality

### Real-time Notifications
- Push notifications for important events
- In-app notification center
- Email notification preferences
- Websocket-based live updates

### Admin Dashboard
- User management panel
- Analytics and metrics visualization
- System health monitoring
- Audit logs viewer

### Multi-language Support
- Support for 10+ languages
- Automatic language detection
- RTL layout support for Arabic/Hebrew
- Translation management dashboard

### Payment Integration
- Stripe payment processing
- Subscription management
- Invoice generation
- Payment history

### NEW: Two-Factor Authentication (2FA)
- TOTP-based 2FA with authenticator apps
- SMS-based 2FA backup
- Recovery codes
- Remember trusted devices

### NEW: API Rate Limiting
- Per-user rate limits
- Tiered rate limits based on subscription
- Rate limit headers in responses
- Graceful degradation

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/hello | GET | Returns greeting |
| /api/auth/login | POST | User login |
| /api/auth/2fa/setup | POST | Setup 2FA |
| /api/auth/2fa/verify | POST | Verify 2FA code |
| /api/users/profile | GET | Get user profile |
| /api/notifications | GET | Get notifications |
| /api/admin/rate-limits | GET | View rate limits |
| /api/payments/subscribe | POST | Create subscription |

## Tech Stack
- Python 3.11
- FastAPI
- PostgreSQL
- Redis for caching + rate limiting
- WebSockets for real-time
- Stripe SDK
- PyOTP for 2FA

## License
MIT
