import { Router } from 'express';
import { BookController } from '../../controllers/book.controller';
import { BookPublishController } from '../../controllers/bookPublish.controller';
import { BookClassifyController } from '../../controllers/bookClassify.controller';
import iocContainer from '../../libs/ioc.container';
import TYPES from '@libs/ioc.types';
import { authenticateToken } from '../../middleware/authMiddleware';
import { requireScopeAndRole, requireAdmin } from '../../middleware/authorizationMiddleware';

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
 *         description: List of books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /v1/books/{id}:
 *   get:
 *     tags:
 *       - Books (v1)
 *     summary: Get book by ID
 *     description: Retrieve a specific book by its unique identifier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The book ID
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /v1/books:
 *   post:
 *     tags:
 *       - Books (v1)
 *     summary: Create a new book
 *     description: Add a new book to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookRequest'
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /v1/books/{id}:
 *   put:
 *     tags:
 *       - Books (v1)
 *     summary: Update a book
 *     description: Update an existing book's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookRequest'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /v1/books/{id}:
 *   delete:
 *     tags:
 *       - Books (v1)
 *     summary: Delete a book
 *     description: Remove a book from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The book ID
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /v1/books/{id}/publish:
 *   post:
 *     tags:
 *       - Books (v1)
 *     summary: Publish a book
 *     description: Add publication information to a book
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PublishBookRequest'
 *     responses:
 *       200:
 *         description: Book published successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /v1/books/{id}/publication:
 *   patch:
 *     tags:
 *       - Books (v1)
 *     summary: Update publication information
 *     description: Update publication details of an existing book
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PublishBookRequest'
 *     responses:
 *       200:
 *         description: Publication information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /v1/books/{id}/classify:
 *   post:
 *     tags:
 *       - Books (v1)
 *     summary: Classify a book
 *     description: Add library classification information to a book
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassifyBookRequest'
 *     responses:
 *       200:
 *         description: Book classified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /v1/books/{id}/classify:
 *   put:
 *     tags:
 *       - Books (v1)
 *     summary: Update classification information
 *     description: Update library classification details of an existing book
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassifyBookRequest'
 *     responses:
 *       200:
 *         description: Classification information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

export function bookRoutes(): Router {
  const router = Router();

  const controller = iocContainer.get<BookController>(TYPES.BookController);
  const publishController = iocContainer.get<BookPublishController>(TYPES.BookPublishController);
  const classifyController = iocContainer.get<BookClassifyController>(TYPES.BookClassifyController);

  router.post('/', controller.createBook.bind(controller));

  router.get(
    '/',
    authenticateToken,
    requireScopeAndRole('Books.Read', 'Books.Reader'),
    controller.getBooks.bind(controller)
  );

  router.get(
    '/:id',
    authenticateToken,
    requireScopeAndRole('Books.Read', 'Books.Reader'),
    controller.getBookById.bind(controller)
  );

  router.put(
    '/:id',
    authenticateToken,
    requireScopeAndRole('Books.Write', 'Books.Writer'),
    controller.updateBook.bind(controller)
  );

  router.post(
    '/:id/publish',
    authenticateToken,
    requireScopeAndRole('Books.Write', 'Books.Writer'),
    publishController.publishBook.bind(publishController)
  );

  router.patch(
    '/:id/publication',
    authenticateToken,
    requireScopeAndRole('Books.Write', 'Books.Writer'),
    publishController.updatePublication.bind(publishController)
  );

  router.post(
    '/:id/classify',
    authenticateToken,
    requireScopeAndRole('Books.Write', 'Books.Writer'),
    classifyController.classifyBook.bind(classifyController)
  );

  router.put(
    '/:id/classify',
    authenticateToken,
    requireScopeAndRole('Books.Write', 'Books.Writer'),
    classifyController.updateClassification.bind(classifyController)
  );

  router.delete(
    '/:id',
    authenticateToken,
    requireAdmin,
    controller.deleteBook.bind(controller)
  );

  return router;
}
