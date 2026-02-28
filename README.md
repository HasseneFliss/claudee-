# Hello World Application

## Overview
A simple yet powerful Hello World application with modern features.

## Features

### Core Features
- Hello World greeting function
- Customizable name parameter
- API endpoint for greetings

### NEW: User Authentication
- Users can log in with email/password
- OAuth support for Google and GitHub login
- Session management with JWT tokens

### NEW: Dark Mode
- Toggle between light and dark themes
- Automatic system preference detection
- Persists user preference in localStorage

### NEW: User Profile Page
- View and edit user profile
- Avatar upload with image cropping
- Change password functionality

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/hello | GET | Returns greeting |
| /api/hello/:name | GET | Personalized greeting |
| /api/auth/login | POST | User login |
| /api/auth/register | POST | User registration |
| /api/users/profile | GET | Get user profile |
| /api/users/profile | PUT | Update profile |

## Tech Stack
- Python 3.11
- FastAPI
- PostgreSQL
- Redis for caching

## Getting Started

```bash
pip install -r requirements.txt
python main.py
```

## License
MIT
