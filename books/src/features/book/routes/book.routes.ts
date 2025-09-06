import { Router, RequestHandler } from 'express';

import { buildRoutes, getRoutes, getAuthMetadata } from '@libs/decorators/routeBuilder';
import TYPES from '@libs/ioc.types';

import { authenticateToken } from '@middleware/authMiddleware';
import { requireRole } from '@middleware/authorizationMiddleware';

import iocContainer from '../../../libs/ioc.container';
import { BookController } from '../controllers/book.controller';
import { BookClassifyController } from '../controllers/classify/bookClassify.controller';
import { BookPublishController } from '../controllers/publish/bookPublish.controller';

/**
 * @swagger
 * /v1/books:
 *   get:
 *     tags:
 *       - Books (v1)
 *     summary: Get all books (paginated and sortable)
 *     description: Retrieve a paginated and sortable list of all books in the system
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-based indexing)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page (max 100)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, name]
 *           default: name
 *         description: Field to sort by (id maps to bookId, name maps to title)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction (asc or desc)
 *     responses:
 *       200:
 *         description: Paginated list of books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalItems:
 *                       type: integer
 *                       example: 47
 *                     totalPages:
 *                       type: integer
 *                       example: 5
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
  const controller = iocContainer.get<BookController>(TYPES.BookController);
  const publishController = iocContainer.get<BookPublishController>(TYPES.BookPublishController);
  const classifyController = iocContainer.get<BookClassifyController>(TYPES.BookClassifyController);

  // Build routes from all three controllers and merge them into one router
  const router = buildRoutes(controller);

  // Get routes from publish and classify controllers and register them on the same router
  const publishRoutes = getRoutes(publishController);
  const classifyRoutes = getRoutes(classifyController);

  for (const route of [...publishRoutes, ...classifyRoutes]) {
    const { method, path, methodName } = route;
    const ctrl = publishRoutes.includes(route) ? publishController : classifyController;
    const handler = (ctrl as unknown as Record<string, unknown>)[methodName];

    if (typeof handler !== 'function') {
      throw new TypeError(`Method ${methodName} is not a function on controller`);
    }

    const authMetadata = getAuthMetadata(ctrl, methodName);
    const middlewares: RequestHandler[] = [];

    if (authMetadata?.requiresAuth) {
      middlewares.push(authenticateToken);
      if (authMetadata.roles && authMetadata.roles.length > 0) {
        middlewares.push(requireRole(authMetadata.roles));
      }
    }

    const boundHandler = handler.bind(ctrl) as RequestHandler;

    // Register route using switch statement to avoid unsafe dynamic access
    switch (method) {
      case 'get':
        router.get(path, ...middlewares, boundHandler);
        break;
      case 'post':
        router.post(path, ...middlewares, boundHandler);
        break;
      case 'put':
        router.put(path, ...middlewares, boundHandler);
        break;
      case 'patch':
        router.patch(path, ...middlewares, boundHandler);
        break;
      case 'delete':
        router.delete(path, ...middlewares, boundHandler);
        break;
      default:
        throw new TypeError(`Unsupported HTTP method: ${method}`);
    }
  }

  return router;
}
