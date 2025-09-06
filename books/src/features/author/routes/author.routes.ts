import { Router } from 'express';

import { buildRoutes } from '@libs/decorators/routeBuilder';
import iocContainer from '@libs/ioc.container';
import TYPES from '@libs/ioc.types';

import { AuthorController } from '@features/author/controllers/author.controller';

/**
 * @swagger
 * /v1/authors:
 *   get:
 *     tags:
 *       - Authors (v1)
 *     summary: Get all authors (paginated and sortable)
 *     description: Retrieve a paginated and sortable list of all authors in the system
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
 *           enum: [id, lastName, firstName, displayName]
 *           default: lastName
 *         description: Field to sort by (id maps to authorId)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction (asc or desc)
 *     responses:
 *       200:
 *         description: Paginated list of authors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Author'
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
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /v1/authors/{id}:
 *   get:
 *     tags:
 *       - Authors (v1)
 *     summary: Get author by ID
 *     description: Retrieve a specific author by their unique identifier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The author ID
 *     responses:
 *       200:
 *         description: Author retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /v1/authors:
 *   post:
 *     tags:
 *       - Authors (v1)
 *     summary: Create a new author
 *     description: Add a new author to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAuthorRequest'
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

export function authorRoutes(): Router {
  const controller = iocContainer.get<AuthorController>(TYPES.AuthorController);
  return buildRoutes(controller);
}
