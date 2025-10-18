import { Router } from 'express';
import { AuthorController } from '@features/author/controllers/author.controller';
import iocContainer from '@libs/ioc.container';
import TYPES from '@libs/ioc.types';
import { buildRoutes } from '@libs/decorators/routeBuilder';

/**
 * @swagger
 * /v1/authors:
 *   get:
 *     tags:
 *       - Authors (v1)
 *     summary: Get all authors
 *     description: Retrieve a list of all authors in the system
 *     responses:
 *       200:
 *         description: List of authors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Author'
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

export function authorRoutes(): Router {
  const controller = iocContainer.get<AuthorController>(TYPES.AuthorController);
  return buildRoutes(controller);
}
