# Technical Specification

## Summary

Comprehensive specification for responsive e-commerce frontend API with full user authentication, cart/wishlist management, product catalog with advanced search and filtering, homepage content management, user preferences, and analytics tracking. Includes complete database schema with proper relationships and security considerations for a production-ready e-commerce application.

## API Specification

See [api-spec.json](./api-spec.json) for the complete OpenAPI specification.

**Endpoints:** 21 paths, 26 operations

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | Get paginated products with filtering and sorting |
| GET | `/products/{productId}` | Get single product details |
| GET | `/products/featured` | Get featured products for homepage |
| GET | `/categories` | Get all product categories |
| GET | `/categories/{categoryId}/products` | Get products by category |
| GET | `/search` | Search products with instant suggestions |
| GET | `/search/suggestions` | Get instant search suggestions |
| GET | `/banners` | Get homepage banners |
| GET | `/brands` | Get all product brands |
| GET | `/filters` | Get available filters for products |
| GET | `/user/preferences` | Get user display preferences |
| PUT | `/user/preferences` | Update user display preferences |
| POST | `/analytics/track` | Track user interactions for analytics |
| GET | `/cart` | Get user's cart |
| POST | `/cart` | Add item to cart |
| PUT | `/cart/{itemId}` | Update cart item quantity |
| DELETE | `/cart/{itemId}` | Remove item from cart |
| GET | `/wishlist` | Get user's wishlist |
| POST | `/wishlist` | Add product to wishlist |

*... and 6 more endpoints*

**Data Schemas:** 28 models

## Database Schema

See [database-schema.json](./database-schema.json) for the complete schema.

**Tables:** 14

| Table | Columns | Description |
|-------|---------|-------------|
| `users` | 14 | - |
| `products` | 20 | - |
| `categories` | 10 | - |
| `brands` | 8 | - |
| `product_variants` | 10 | - |
| `product_reviews` | 10 | - |
| `carts` | 4 | - |
| `cart_items` | 8 | - |
| `wishlists` | 4 | - |
| `banners` | 15 | - |
| `user_preferences` | 10 | - |
| `refresh_tokens` | 6 | - |
| `search_suggestions` | 7 | - |
| `analytics_events` | 14 | - |

## Architecture

See [architecture.json](./architecture.json) for complete architecture details.

## Authentication

See [authentication.json](./authentication.json) for complete auth details.

