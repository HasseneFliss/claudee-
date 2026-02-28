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

### NEW: AI Chat Assistant
- Integrated AI chatbot for user support
- Context-aware responses based on user history
- Natural language query processing
- Multi-language support

### NEW: Data Export Feature
- Export user data in CSV/JSON format
- Scheduled automatic exports
- Custom field selection
- GDPR compliance tools

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
| /api/ai/chat | POST | Send message to AI assistant |
| /api/export/data | POST | Export user data |

## Tech Stack
- Python 3.11
- FastAPI
- PostgreSQL
- Redis for caching
- WebSockets for real-time
- OpenAI API for AI features

## Getting Started

```bash
pip install -r requirements.txt
python main.py
```

## License
MIT
