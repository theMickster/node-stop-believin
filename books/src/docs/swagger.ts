import swaggerJsdoc from 'swagger-jsdoc';

import config from '../config/config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cosmic Books API',
      version: '1.0.0',
      description: 'A Node.js Express API for managing books with Azure Cosmos DB',
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Development server',
      },
      {
        url: 'https://your-production-url.com/api',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Books (v1)',
        description: 'Book management endpoints - Version 1',
      },
      {
        name: 'Authors (v1)',
        description: 'Author management endpoints - Version 1',
      },
      {
        name: 'Health (v1)',
        description: 'System health check endpoints - Version 1 (ADMIN only)',
      },
    ],
    security: [
      {
        BearerAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Azure Entra ID (Azure AD) JWT Bearer token',
        },
      },
      schemas: {
        Book: {
          type: 'object',
          properties: {
            bookId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the book',
            },
            title: {
              type: 'string',
              description: 'Title of the book',
            },
            subtitle: {
              type: 'string',
              description: 'Subtitle of the book',
            },
            authors: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Author',
              },
            },
            publicationInfo: {
              $ref: '#/components/schemas/PublicationInfo',
            },
            classificationInfo: {
              $ref: '#/components/schemas/ClassificationInfo',
            },
            createdDate: {
              type: 'string',
              format: 'date-time',
            },
            modifiedDate: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Author: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Internal database ID',
            },
            authorId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the author',
            },
            firstName: {
              type: 'string',
              description: 'Author first name',
            },
            middleName: {
              type: 'string',
              description: 'Author middle name',
            },
            lastName: {
              type: 'string',
              description: 'Author last name',
            },
            displayName: {
              type: 'string',
              description: 'Display name for the author',
            },
            pseudonyms: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of author pseudonyms',
            },
            suffix: {
              type: 'string',
              description: 'Name suffix (e.g., Jr., III)',
            },
            shortBio: {
              type: 'string',
              description: 'Short biography',
            },
            longBio: {
              type: 'string',
              description: 'Long biography',
            },
            genres: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of genres the author writes in',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Author email address',
            },
            website: {
              type: 'string',
              format: 'uri',
              description: 'Author website URL',
            },
            socialMedia: {
              $ref: '#/components/schemas/SocialMedia',
            },
            profilePhotoUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to author profile photo',
            },
            bannerImageUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to author banner image',
            },
            photoGallery: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
              description: 'Array of photo URLs',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
              description: 'Author status',
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether the author is verified',
            },
          },
        },
        SocialMedia: {
          type: 'object',
          properties: {
            twitter: {
              type: 'string',
              description: 'Twitter handle or URL',
            },
            instagram: {
              type: 'string',
              description: 'Instagram handle or URL',
            },
            facebook: {
              type: 'string',
              description: 'Facebook profile URL',
            },
            linkedin: {
              type: 'string',
              description: 'LinkedIn profile URL',
            },
            goodreads: {
              type: 'string',
              description: 'Goodreads profile URL',
            },
            amazonAuthor: {
              type: 'string',
              description: 'Amazon Author profile URL',
            },
          },
        },
        PublicationInfo: {
          type: 'object',
          properties: {
            isbn: {
              $ref: '#/components/schemas/ISBN',
            },
            publishedDate: {
              type: 'string',
              format: 'date',
              description: 'Publication date',
            },
            firstPublishedDate: {
              type: 'string',
              format: 'date',
              description: 'First publication date',
            },
            publisher: {
              type: 'string',
              description: 'Publisher name',
            },
            edition: {
              type: 'string',
              description: 'Edition information',
            },
            copyright: {
              type: 'string',
              description: 'Copyright information',
            },
          },
        },
        ISBN: {
          type: 'object',
          properties: {
            isbn10: {
              type: 'string',
              pattern: '^[0-9]{10}$',
              description: '10-digit ISBN',
            },
            isbn13: {
              type: 'string',
              pattern: '^[0-9]{13}$',
              description: '13-digit ISBN',
            },
          },
        },
        ClassificationInfo: {
          type: 'object',
          properties: {
            libraryClassification: {
              $ref: '#/components/schemas/LibraryClassification',
            },
          },
        },
        LibraryClassification: {
          type: 'object',
          properties: {
            deweyDecimal: {
              type: 'string',
              description: 'Dewey Decimal Classification number',
            },
            libraryOfCongressNumber: {
              type: 'string',
              description: 'Library of Congress classification number',
            },
            oclcNumber: {
              type: 'string',
              description: 'OCLC control number',
            },
          },
        },
        CreateBookRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 500,
            },
            subtitle: {
              type: 'string',
              maxLength: 500,
            },
            authors: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Author',
              },
            },
          },
        },
        UpdateBookRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 500,
            },
            subtitle: {
              type: 'string',
              maxLength: 500,
            },
            authors: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Author',
              },
            },
          },
        },
        PublishBookRequest: {
          type: 'object',
          properties: {
            isbn: {
              $ref: '#/components/schemas/ISBN',
            },
            publishedDate: {
              type: 'string',
              format: 'date',
            },
            firstPublishedDate: {
              type: 'string',
              format: 'date',
            },
            publisher: {
              type: 'string',
              maxLength: 200,
            },
            edition: {
              type: 'string',
              maxLength: 100,
            },
            copyright: {
              type: 'string',
              maxLength: 200,
            },
          },
        },
        ClassifyBookRequest: {
          type: 'object',
          properties: {
            deweyDecimal: {
              type: 'string',
              maxLength: 50,
            },
            libraryOfCongressNumber: {
              type: 'string',
              maxLength: 50,
            },
            oclcNumber: {
              type: 'string',
              pattern: String.raw`^\d+$`,
            },
          },
        },
        CreateAuthorRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'displayName', 'genres', 'status', 'isVerified'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Author first name',
            },
            middleName: {
              type: 'string',
              maxLength: 100,
              description: 'Author middle name',
            },
            lastName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Author last name',
            },
            displayName: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'Display name for the author',
            },
            pseudonyms: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 100,
              },
              description: 'List of author pseudonyms',
            },
            suffix: {
              type: 'string',
              maxLength: 20,
              description: 'Name suffix (e.g., Jr., III)',
            },
            shortBio: {
              type: 'string',
              maxLength: 500,
              description: 'Short biography',
            },
            longBio: {
              type: 'string',
              maxLength: 5000,
              description: 'Long biography',
            },
            genres: {
              type: 'array',
              items: {
                type: 'string',
              },
              minItems: 1,
              description: 'List of genres the author writes in',
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 255,
              description: 'Author email address',
            },
            website: {
              type: 'string',
              format: 'uri',
              maxLength: 500,
              description: 'Author website URL',
            },
            socialMedia: {
              $ref: '#/components/schemas/SocialMedia',
            },
            profilePhotoUrl: {
              type: 'string',
              format: 'uri',
              maxLength: 500,
              description: 'URL to author profile photo',
            },
            bannerImageUrl: {
              type: 'string',
              format: 'uri',
              maxLength: 500,
              description: 'URL to author banner image',
            },
            photoGallery: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
                maxLength: 500,
              },
              description: 'Array of photo URLs',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
              description: 'Author status',
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether the author is verified',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Detailed error information',
            },
          },
        },
        HealthStatus: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy'],
              description: 'Overall system health status',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of the health check',
            },
            version: {
              type: 'string',
              description: 'Application version',
            },
            environment: {
              type: 'string',
              description: 'Current environment (development, production, etc.)',
            },
            checks: {
              type: 'object',
              properties: {
                cosmosDb: {
                  $ref: '#/components/schemas/ComponentHealth',
                },
                booksContainer: {
                  $ref: '#/components/schemas/ComponentHealth',
                },
                authorsContainer: {
                  $ref: '#/components/schemas/ComponentHealth',
                },
                applicationInsights: {
                  $ref: '#/components/schemas/ComponentHealth',
                },
              },
            },
          },
        },
        ComponentHealth: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy'],
              description: 'Component health status',
            },
            responseTime: {
              type: 'number',
              description: 'Response time in milliseconds',
            },
            message: {
              type: 'string',
              description: 'Status message',
            },
            error: {
              type: 'string',
              description: 'Error message if unhealthy',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad request - validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: [
    './src/routes/**/*.ts',
    './src/features/**/routes/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
