import { swaggerSpec } from './swagger';

/**
 * Swagger Configuration Tests
 *
 * These tests verify that the OpenAPI/Swagger specification is properly configured
 * with all required schemas, security settings, and documentation.
 */

describe('Swagger Configuration', () => {
  describe('swaggerSpec', () => {
    it('should be defined and have correct OpenAPI version', () => {
      expect(swaggerSpec).toBeDefined();
      expect(swaggerSpec.openapi).toBe('3.0.0');
    });

    it('should have API info configured', () => {
      expect(swaggerSpec.info).toBeDefined();
      expect(swaggerSpec.info.title).toBe('Cosmic Books API');
      expect(swaggerSpec.info.version).toBe('1.0.0');
      expect(swaggerSpec.info.description).toContain('Node.js Express API');
    });

    it('should have contact information', () => {
      expect(swaggerSpec.info.contact).toBeDefined();
      expect(swaggerSpec.info.contact?.name).toBe('API Support');
    });

    it('should have license information', () => {
      expect(swaggerSpec.info.license).toBeDefined();
      expect(swaggerSpec.info.license?.name).toBe('MIT');
    });

    it('should have servers configured', () => {
      expect(swaggerSpec.servers).toBeDefined();
      expect(Array.isArray(swaggerSpec.servers)).toBe(true);
      expect(swaggerSpec.servers?.length).toBeGreaterThan(0);
    });

    it('should have development server', () => {
      const devServer = swaggerSpec.servers?.find((s) => s.description === 'Development server');
      expect(devServer).toBeDefined();
      expect(devServer?.url).toContain('localhost');
    });

    it('should have tags defined', () => {
      expect(swaggerSpec.tags).toBeDefined();
      expect(Array.isArray(swaggerSpec.tags)).toBe(true);
      expect(swaggerSpec.tags?.length).toBeGreaterThan(0);
    });

    it('should have Books v1 tag', () => {
      const booksV1Tag = swaggerSpec.tags?.find((t) => t.name === 'Books (v1)');
      expect(booksV1Tag).toBeDefined();
      expect(booksV1Tag?.description).toContain('Version 1');
    });

    it('should have components schemas defined', () => {
      expect(swaggerSpec.components).toBeDefined();
      expect(swaggerSpec.components?.schemas).toBeDefined();
    });

    it('should have Book schema', () => {
      const bookSchema = swaggerSpec.components?.schemas?.Book;
      expect(bookSchema).toBeDefined();
      expect(bookSchema).toHaveProperty('type', 'object');
      expect(bookSchema).toHaveProperty('properties');
    });

    it('should have Author schema', () => {
      const authorSchema = swaggerSpec.components?.schemas?.Author;
      expect(authorSchema).toBeDefined();
      expect(authorSchema).toHaveProperty('type', 'object');
    });

    it('should have PublicationInfo schema', () => {
      const publicationInfoSchema = swaggerSpec.components?.schemas?.PublicationInfo;
      expect(publicationInfoSchema).toBeDefined();
      expect(publicationInfoSchema).toHaveProperty('type', 'object');
    });

    it('should have ClassificationInfo schema', () => {
      const classificationInfoSchema = swaggerSpec.components?.schemas?.ClassificationInfo;
      expect(classificationInfoSchema).toBeDefined();
      expect(classificationInfoSchema).toHaveProperty('type', 'object');
    });

    it('should have CreateBookRequest schema', () => {
      const createBookSchema = swaggerSpec.components?.schemas?.CreateBookRequest;
      expect(createBookSchema).toBeDefined();
    });

    it('should have UpdateBookRequest schema', () => {
      const updateBookSchema = swaggerSpec.components?.schemas?.UpdateBookRequest;
      expect(updateBookSchema).toBeDefined();
    });

    it('should have PublishBookRequest schema', () => {
      const publishBookSchema = swaggerSpec.components?.schemas?.PublishBookRequest;
      expect(publishBookSchema).toBeDefined();
    });

    it('should have ClassifyBookRequest schema', () => {
      const classifyBookSchema = swaggerSpec.components?.schemas?.ClassifyBookRequest;
      expect(classifyBookSchema).toBeDefined();
    });

    it('should have error response schemas', () => {
      expect(swaggerSpec.components?.responses).toBeDefined();
    });

    it('should have BadRequest response', () => {
      const badRequestResponse = swaggerSpec.components?.responses?.BadRequest;
      expect(badRequestResponse).toBeDefined();
      expect(badRequestResponse).toHaveProperty('description');
    });

    it('should have NotFound response', () => {
      const notFoundResponse = swaggerSpec.components?.responses?.NotFound;
      expect(notFoundResponse).toBeDefined();
      expect(notFoundResponse).toHaveProperty('description');
    });

    it('should have InternalServerError response', () => {
      const internalServerErrorResponse = swaggerSpec.components?.responses?.InternalServerError;
      expect(internalServerErrorResponse).toBeDefined();
      expect(internalServerErrorResponse).toHaveProperty('description');
    });

    it('should have paths defined', () => {
      expect(swaggerSpec.paths).toBeDefined();
      expect(typeof swaggerSpec.paths).toBe('object');
    });

    it('should have valid JSON structure', () => {
      const stringified = JSON.stringify(swaggerSpec);
      expect(() => JSON.parse(stringified)).not.toThrow();
    });

    it('should have consistent schema references', () => {
      const bookSchema = swaggerSpec.components?.schemas?.Book;
      const authors = bookSchema?.properties?.authors;

      expect(authors).toHaveProperty('type', 'array');
      expect(authors?.items).toHaveProperty('$ref');
      expect(authors?.items?.$ref).toContain('#/components/schemas/Author');
    });

    it('should have security schemes configured', () => {
      expect(swaggerSpec.components?.securitySchemes).toBeDefined();
      expect(swaggerSpec.components?.securitySchemes?.BearerAuth).toBeDefined();
    });

    it('should have BearerAuth security scheme with correct configuration', () => {
      const bearerAuth = swaggerSpec.components?.securitySchemes?.BearerAuth;
      expect(bearerAuth).toHaveProperty('type', 'http');
      expect(bearerAuth).toHaveProperty('scheme', 'bearer');
      expect(bearerAuth).toHaveProperty('bearerFormat', 'JWT');
      expect(bearerAuth).toHaveProperty('description');
    });

    it('should have global security requirement', () => {
      expect(swaggerSpec.security).toBeDefined();
      expect(Array.isArray(swaggerSpec.security)).toBe(true);
      expect(swaggerSpec.security?.length).toBeGreaterThan(0);
    });

    it('should reference BearerAuth in security requirements', () => {
      const bearerAuthRequirement = swaggerSpec.security?.find((s) => s.BearerAuth !== undefined);
      expect(bearerAuthRequirement).toBeDefined();
      expect(Array.isArray(bearerAuthRequirement?.BearerAuth)).toBe(true);
    });
  });
});
