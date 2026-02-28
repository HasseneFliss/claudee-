# Technical Specification

## Summary

Comprehensive specification for Hello World application with added mobile app support including native iOS/Android applications, push notifications, offline mode capabilities, biometric authentication, device registration endpoints, and sync functionality

## API Specification

See [api-spec.json](./api-spec.json) for the complete OpenAPI specification.

**Endpoints:** 7 paths, 7 operations

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/mobile/sync` | Sync offline data |
| GET | `/mobile/devices` | Get registered mobile devices |
| POST | `/mobile/register` | Register mobile device |
| PUT | `/mobile/push-token` | Update push notification token |
| POST | `/auth/biometric/verify` | Verify biometric authentication |
| POST | `/auth/biometric/register` | Register biometric authentication |
| DELETE | `/mobile/devices/{deviceId}` | Unregister mobile device |

**Data Schemas:** 13 models

## Database Schema

See [database-schema.json](./database-schema.json) for the complete schema.

**Tables:** 3

| Table | Columns | Description |
|-------|---------|-------------|
| `mobile_devices` | 12 | - |
| `biometric_keys` | 6 | - |
| `offline_sync_log` | 7 | - |

## Architecture

See [architecture.json](./architecture.json) for complete architecture details.

## Authentication

See [authentication.json](./authentication.json) for complete auth details.

