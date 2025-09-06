import { Container as CosmosContainer, ItemResponse, PartitionKey, SqlParameter } from '@azure/cosmos';

import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import { isErrorWithCode } from '@libs/guards/errorGuards';
import { PaginationParams } from '@libs/types/pagination.types';
import { ValidatedSortConfig } from '@libs/types/sorting.types';

import { BaseEntity, PartitionedEntity } from '@data/entities/base/entity-traits';
import { RepoResult, repoOk, repoFail, PaginatedRepoResult, paginatedRepoOk, paginatedRepoFail } from '@data/libs/repoResult';

/**
 * Base repository for Cosmos DB operations
 * Provides common CRUD operations for all entities
 *
 * @typeParam T - The entity type, must extend BaseEntity and PartitionedEntity
 *
 */
export abstract class CosmosRepository<T extends BaseEntity & PartitionedEntity> {
  /**
   * @param container - The Cosmos DB container
   * @param entityType - The entity type value (e.g., 'BOOK', 'AUTHOR')
   * @param entityName - Human-readable entity name for error messages (e.g., 'book', 'author')
   */
  constructor(
    protected readonly container: CosmosContainer,
    protected readonly entityType: string,
    protected readonly entityName: string,
  ) {}

  /**
   * Get all entities of this type
   */
  async getAll(): Promise<RepoResult<T[]>> {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.entityType = @entityType',
        parameters: [{ name: '@entityType', value: this.entityType }],
      };

      const { resources } = await this.container.items.query<T>(querySpec).fetchAll();
      return repoOk(resources);
    } catch {
      return repoFail(`Failed to retrieve ${this.entityName}s from the Cosmos DB.`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get paginated entities of this type with optional sorting
   * Uses Cosmos DB OFFSET/LIMIT for efficient pagination
   * Uses ORDER BY for sorting when sort config is provided
   *
   * Based on Cosmos DB SQL API documentation:
   * - Pagination: https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/query/offset-limit
   * - Sorting: https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/query/order-by
   *
   * @param pagination - Pagination parameters (page, pageSize)
   * @param sortConfig - Optional validated sort configuration (field path and direction)
   * @returns Paginated result with items and total count
   */
  async getAllPaginated(pagination: PaginationParams, sortConfig?: ValidatedSortConfig): Promise<PaginatedRepoResult<T>> {
    try {
      // Calculate offset for OFFSET/LIMIT clause
      const offset = (pagination.page - 1) * pagination.pageSize;

      // Build ORDER BY clause if sort config is provided
      const orderByClause = sortConfig
        ? ` ORDER BY ${sortConfig.dbFieldPath} ${sortConfig.direction.toUpperCase()}`
        : '';

      // Query for paginated items with optional sorting
      const itemsQuerySpec = {
        query: `SELECT * FROM c WHERE c.entityType = @entityType${orderByClause} OFFSET @offset LIMIT @limit`,
        parameters: [
          { name: '@entityType', value: this.entityType },
          { name: '@offset', value: offset },
          { name: '@limit', value: pagination.pageSize },
        ],
      };

      // Query for total count (needed for pagination metadata)
      const countQuerySpec = {
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.entityType = @entityType',
        parameters: [{ name: '@entityType', value: this.entityType }],
      };

      // Execute both queries in parallel for better performance
      const [itemsResult, countResult] = await Promise.all([
        this.container.items.query<T>(itemsQuerySpec).fetchAll(),
        this.container.items.query<number>(countQuerySpec).fetchAll(),
      ]);

      const items = itemsResult.resources;
      const totalCount = countResult.resources[0] || 0;

      return paginatedRepoOk(items, totalCount);
    } catch {
      return paginatedRepoFail(`Failed to retrieve paginated ${this.entityName}s from the Cosmos DB.`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get entity by ID
   * @param id - The entity ID
   * @param partitionKey - Optional partition key (defaults to [id, entityType])
   */
  async getById(id: string, partitionKey?: PartitionKey): Promise<RepoResult<T>> {
    try {
      const pk = partitionKey ?? [id, this.entityType];
      const response: ItemResponse<T> = await this.container.item(id, pk).read<T>();

      if (!response.resource) {
        return repoFail(`${this.capitalize(this.entityName)} not found`, HttpStatus.NOT_FOUND);
      }

      return repoOk(response.resource);
    } catch (err: unknown) {
      if (this.is404Error(err)) {
        return repoFail(`${this.capitalize(this.entityName)} not found`, HttpStatus.NOT_FOUND);
      }
      return repoFail(`Failed to retrieve ${this.entityName}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create a new entity
   * @param entity - The entity to create
   */
  async create(entity: T): Promise<RepoResult<T>> {
    try {
      const { resource: createdItem } = await this.container.items.create(entity);

      if (!createdItem) {
        return repoFail(`Failed to create ${this.entityName}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return repoOk(createdItem);
    } catch {
      return repoFail(`Failed to create ${this.entityName}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update an existing entity
   * @param entity - The entity to update (must have id)
   * @param partitionKey - Optional partition key (defaults to [entity.id, entityType])
   */
  async update(entity: T & { id: string }, partitionKey?: PartitionKey): Promise<RepoResult<T>> {
    try {
      const pk = partitionKey ?? [entity.id, this.entityType];
      const { resource: updatedItem } = await this.container.item(entity.id, pk).replace(entity);

      if (!updatedItem) {
        return repoFail(`Failed to update ${this.entityName}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return repoOk(updatedItem);
    } catch (err: unknown) {
      if (this.is404Error(err)) {
        return repoFail(`${this.capitalize(this.entityName)} not found`, HttpStatus.NOT_FOUND);
      }
      return repoFail(`Failed to update ${this.entityName}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete an entity
   * @param id - The entity ID
   * @param partitionKey - Optional partition key (defaults to [id, entityType])
   */
  async delete(id: string, partitionKey?: PartitionKey): Promise<RepoResult<void>> {
    try {
      const pk = partitionKey ?? [id, this.entityType];
      await this.container.item(id, pk).delete();
      return repoOk(undefined);
    } catch (err: unknown) {
      if (this.is404Error(err)) {
        return repoFail(`${this.capitalize(this.entityName)} not found`, HttpStatus.NOT_FOUND);
      }
      return repoFail(`Failed to delete ${this.entityName}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Check if error is a 404 Not Found error
   */
  protected is404Error(err: unknown): boolean {
    return (
      isErrorWithCode(err) &&
      (err.code === HttpStatus.NOT_FOUND || (err as { statusCode?: number }).statusCode === HttpStatus.NOT_FOUND)
    );
  }

  /**
   * Capitalize first letter of string
   */
  protected capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Execute a custom query
   * Useful for specialized queries in child repositories
   */
  protected async executeQuery<TResult = T>(query: string, parameters: SqlParameter[]): Promise<RepoResult<TResult[]>> {
    try {
      const querySpec = { query, parameters };
      const { resources } = await this.container.items.query<TResult>(querySpec).fetchAll();
      return repoOk(resources);
    } catch {
      return repoFail(`Failed to execute query on ${this.entityName}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
