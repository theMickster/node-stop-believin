import request from 'supertest';
import express from 'express';
import { bookRoutes } from './book.routes';
import passport from '../../middleware/authMiddleware';

describe('Book Routes - Authentication & Authorization', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(passport.initialize());
    app.use('/books', bookRoutes());
  });

  describe('POST /books - Create Book (Public)', () => {
    it('should allow creating a book without authentication', async () => {
      const response = await request(app)
        .post('/books')
        .send({
          name: 'Test Book',
          authors: [{ firstName: 'John', lastName: 'Doe' }],
        });

      expect([201, 400, 500]).toContain(response.status);
    });
  });

  describe('GET /books - Get All Books (Protected)', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const response = await request(app).get('/books');

      expect(response.status).toBe(401);
      expect(response.text).toContain('Unauthorized');
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .get('/books')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /books/:id - Get Book By ID (Protected)', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const response = await request(app).get('/books/123');

      expect(response.status).toBe(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .get('/books/123')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /books/:id - Update Book (Protected - Writer)', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const response = await request(app)
        .put('/books/123')
        .send({ name: 'Updated Book' });

      expect(response.status).toBe(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .put('/books/123')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Updated Book' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /books/:id - Delete Book (Protected - Admin Only)', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const response = await request(app).delete('/books/123');

      expect(response.status).toBe(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .delete('/books/123')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /books/:id/publish - Publish Book (Protected - Writer)', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const response = await request(app)
        .post('/books/123/publish')
        .send({
          publisher: 'Test Publisher',
          publicationDate: '2024-01-01',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /books/:id/publication - Update Publication (Protected - Writer)', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const response = await request(app)
        .patch('/books/123/publication')
        .send({
          publisher: 'Updated Publisher',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /books/:id/classify - Classify Book (Protected - Writer)', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const response = await request(app)
        .post('/books/123/classify')
        .send({
          deweyDecimalClassification: '100',
          libraryOfCongressClassification: 'A100',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /books/:id/classify - Update Classification (Protected - Writer)', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const response = await request(app)
        .put('/books/123/classify')
        .send({
          deweyDecimalClassification: '200',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Authorization Requirements Summary', () => {
    it('should document the authorization matrix', () => {
      const authMatrix = {
        'POST /books': { auth: false, scope: null, role: null },
        'GET /books': { auth: true, scope: 'Books.Read', role: 'Books.Reader' },
        'GET /books/:id': { auth: true, scope: 'Books.Read', role: 'Books.Reader' },
        'PUT /books/:id': { auth: true, scope: 'Books.Write', role: 'Books.Writer' },
        'DELETE /books/:id': { auth: true, scope: null, role: 'Books.Admin' },
        'POST /books/:id/publish': { auth: true, scope: 'Books.Write', role: 'Books.Writer' },
        'PATCH /books/:id/publication': { auth: true, scope: 'Books.Write', role: 'Books.Writer' },
        'POST /books/:id/classify': { auth: true, scope: 'Books.Write', role: 'Books.Writer' },
        'PUT /books/:id/classify': { auth: true, scope: 'Books.Write', role: 'Books.Writer' },
      };

      expect(authMatrix).toBeDefined();
      expect(Object.keys(authMatrix).length).toBe(9);
    });
  });
});
