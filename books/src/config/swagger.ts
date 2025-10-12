import swaggerJsdoc from 'swagger-jsdoc';
import config from './config';

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
        name: 'Books (v2)',
        description: 'Book management endpoints - Version 2 (Coming Soon)',
      },
    ],
    components: {
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
              pattern: '^\\d+$',
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
    './src/routes/v1/*.ts',
    './src/routes/v2/*.ts',
    './src/routes/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
