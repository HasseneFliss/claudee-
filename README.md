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

### NEW: Multi-language Support
- Support for 10+ languages
- Automatic language detection
- RTL layout support for Arabic/Hebrew
- Translation management dashboard

### NEW: Payment Integration
- Stripe payment processing
- Subscription management
- Invoice generation
- Payment history

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/hello | GET | Returns greeting |
| /api/hello/:name | GET | Personalized greeting |
| /api/auth/login | POST | User login |
| /api/auth/register | POST | User registration |
| /api/users/profile | GET | Get user profile |
| /api/users/profile | PUT | Update profile |
| /api/notifications | GET | Get user notifications |
| /api/admin/users | GET | List all users (admin only) |
| /api/i18n/languages | GET | Get supported languages |
| /api/payments/subscribe | POST | Create subscription |
| /api/payments/invoices | GET | Get payment invoices |

## Tech Stack
- Python 3.11
- FastAPI
- PostgreSQL
- Redis for caching
- WebSockets for real-time
- Stripe SDK

## Getting Started

```bash
pip install -r requirements.txt
python main.py
```

## License
MIT
