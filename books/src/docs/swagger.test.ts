import type { OAS3Definition } from 'swagger-jsdoc';

import { swaggerSpec } from './swagger';

describe('Swagger Configuration', () => {
  describe('swaggerSpec', () => {
    const spec = swaggerSpec as OAS3Definition;

    it('should be defined and have correct OpenAPI version', () => {
      expect(swaggerSpec).toBeDefined();
      expect(spec.openapi).toBe('3.0.0');
    });

    it('should have API info configured', () => {
      expect(spec.info).toBeDefined();
      expect(spec.info.title).toBe('Cosmic Books API');
      expect(spec.info.version).toBe('1.0.0');
      expect(spec.info.description).toContain('Node.js Express API');
    });

    it('should have contact information', () => {
      expect(spec.info.contact).toBeDefined();
      expect(spec.info.contact?.name).toBe('API Support');
    });

    it('should have license information', () => {
      expect(spec.info.license).toBeDefined();
      expect(spec.info.license?.name).toBe('MIT');
    });

    it('should have servers configured', () => {
      expect(spec.servers).toBeDefined();
      expect(Array.isArray(spec.servers)).toBe(true);
      expect(spec.servers?.length).toBeGreaterThan(0);
    });

    it('should have development server', () => {
      const devServer = spec.servers?.find((s) => s.description === 'Development server');
      expect(devServer).toBeDefined();
      expect(devServer?.url).toContain('localhost');
    });

    it('should have tags defined', () => {
      expect(spec.tags).toBeDefined();
      expect(Array.isArray(spec.tags)).toBe(true);
      expect(spec.tags?.length).toBeGreaterThan(0);
    });

    it('should have Books v1 tag', () => {
      const booksV1Tag = spec.tags?.find((t) => t.name === 'Books (v1)');
      expect(booksV1Tag).toBeDefined();
      expect(booksV1Tag?.description).toContain('Version 1');
    });

    it('should have components schemas defined', () => {
      expect(spec.components).toBeDefined();
      expect(spec.components?.schemas).toBeDefined();
    });

    it('should have Book schema', () => {
      const bookSchema = spec.components?.schemas?.Book;
      expect(bookSchema).toBeDefined();
      expect(bookSchema).toHaveProperty('type', 'object');
      expect(bookSchema).toHaveProperty('properties');
    });

    it('should have Author schema', () => {
      const authorSchema = spec.components?.schemas?.Author;
      expect(authorSchema).toBeDefined();
      expect(authorSchema).toHaveProperty('type', 'object');
    });

    it('should have PublicationInfo schema', () => {
      const publicationInfoSchema = spec.components?.schemas?.PublicationInfo;
      expect(publicationInfoSchema).toBeDefined();
      expect(publicationInfoSchema).toHaveProperty('type', 'object');
    });

    it('should have ClassificationInfo schema', () => {
      const classificationInfoSchema = spec.components?.schemas?.ClassificationInfo;
      expect(classificationInfoSchema).toBeDefined();
      expect(classificationInfoSchema).toHaveProperty('type', 'object');
    });

    it('should have CreateBookRequest schema', () => {
      const createBookSchema = spec.components?.schemas?.CreateBookRequest;
      expect(createBookSchema).toBeDefined();
    });

    it('should have UpdateBookRequest schema', () => {
      const updateBookSchema = spec.components?.schemas?.UpdateBookRequest;
      expect(updateBookSchema).toBeDefined();
    });

    it('should have PublishBookRequest schema', () => {
      const publishBookSchema = spec.components?.schemas?.PublishBookRequest;
      expect(publishBookSchema).toBeDefined();
    });

    it('should have ClassifyBookRequest schema', () => {
      const classifyBookSchema = spec.components?.schemas?.ClassifyBookRequest;
      expect(classifyBookSchema).toBeDefined();
    });

    it('should have error response schemas', () => {
      expect(spec.components?.responses).toBeDefined();
    });

    it('should have BadRequest response', () => {
      const badRequestResponse = spec.components?.responses?.BadRequest;
      expect(badRequestResponse).toBeDefined();
      expect(badRequestResponse).toHaveProperty('description');
    });

    it('should have NotFound response', () => {
      const notFoundResponse = spec.components?.responses?.NotFound;
      expect(notFoundResponse).toBeDefined();
      expect(notFoundResponse).toHaveProperty('description');
    });

    it('should have InternalServerError response', () => {
      const internalServerErrorResponse = spec.components?.responses?.InternalServerError;
      expect(internalServerErrorResponse).toBeDefined();
      expect(internalServerErrorResponse).toHaveProperty('description');
    });

    it('should have paths defined', () => {
      expect(spec.paths).toBeDefined();
      expect(typeof spec.paths).toBe('object');
    });

    it('should have consistent schema references', () => {
      const bookSchema = spec.components?.schemas?.Book;
      if (bookSchema && 'properties' in bookSchema) {
        const authors = bookSchema.properties?.authors as { type?: string; items?: { $ref?: string } } | undefined;

        expect(authors).toHaveProperty('type', 'array');
        expect(authors?.items).toHaveProperty('$ref');
        expect(authors?.items?.$ref).toContain('#/components/schemas/Author');
      } else {
        fail('Book schema should have properties');
      }
    });

    it('should have security schemes configured', () => {
      expect(spec.components?.securitySchemes).toBeDefined();
      expect(spec.components?.securitySchemes?.BearerAuth).toBeDefined();
    });

    it('should have BearerAuth security scheme with correct configuration', () => {
      const bearerAuth = spec.components?.securitySchemes?.BearerAuth;
      expect(bearerAuth).toHaveProperty('type', 'http');
      expect(bearerAuth).toHaveProperty('scheme', 'bearer');
      expect(bearerAuth).toHaveProperty('bearerFormat', 'JWT');
      expect(bearerAuth).toHaveProperty('description');
    });

    it('should have global security requirement', () => {
      expect(spec.security).toBeDefined();
      expect(Array.isArray(spec.security)).toBe(true);
      expect(spec.security?.length).toBeGreaterThan(0);
    });

    it('should reference BearerAuth in security requirements', () => {
      const bearerAuthRequirement = spec.security?.find((s) => s.BearerAuth !== undefined);
      expect(bearerAuthRequirement).toBeDefined();
      expect(Array.isArray(bearerAuthRequirement?.BearerAuth)).toBe(true);
    });
  });
});
