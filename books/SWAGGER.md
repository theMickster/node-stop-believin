# Swagger/OpenAPI Documentation

## Access Swagger UI

When the development server is running, you can access the interactive API documentation at:

**http://localhost:3898/api-docs**

## Features

- **Interactive API Testing**: Test all endpoints directly from your browser
- **Complete Schema Documentation**: View all request/response models
- **Versioned API Support**: Documentation organized by API version (v1, v2)
- **Try It Out**: Execute API calls with sample data

## API Versions

### V1 Routes
All v1 routes are prefixed with `/api/v1`:
- `GET /api/v1/books` - Get all books
- `GET /api/v1/books/{id}` - Get book by ID
- `POST /api/v1/books` - Create a new book
- `PUT /api/v1/books/{id}` - Update a book
- `DELETE /api/v1/books/{id}` - Delete a book
- `POST /api/v1/books/{id}/publish` - Publish a book
- `PATCH /api/v1/books/{id}/publication` - Update publication info
- `POST /api/v1/books/{id}/classify` - Classify a book
- `PUT /api/v1/books/{id}/classify` - Update classification info

### V2 Routes
Coming soon - Placeholder available at `/api/v2`

## OpenAPI Specification

The raw OpenAPI 3.0 specification can be accessed programmatically via the swagger.json file that is generated from the code annotations.

## Adding Documentation

To document new endpoints, add JSDoc comments above your route handlers in the format:

```typescript
/**
 * @swagger
 * /v1/books:
 *   get:
 *     tags:
 *       - Books (v1)
 *     summary: Get all books
 *     description: Retrieve a list of all books in the system
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
```

## Configuration

Swagger configuration is located in [src/config/swagger.ts](src/config/swagger.ts).

You can modify:
- API metadata (title, version, description)
- Server URLs
- Schema definitions
- Reusable components

## Next Steps

1. Update production server URL in [swagger.ts](src/config/swagger.ts)
2. Add authentication/authorization documentation when implemented
3. Add example request/response bodies for better developer experience
4. Consider adding tags for better organization as the API grows
