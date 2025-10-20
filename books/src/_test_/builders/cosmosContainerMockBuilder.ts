import { Container as CosmosContainer } from '@azure/cosmos';

interface QueryableItems {
  query: jest.Mock;
  create: jest.Mock;
}

interface MockContainerStructure {
  items: QueryableItems;
  item: jest.Mock;
}

/**
 * Builder for creating type-safe mocks of Azure Cosmos DB Container
 * Provides fluent interface for setting up query, item, and CRUD operation mocks
 */
export class CosmosContainerMockBuilder {
  private readonly mockContainer: MockContainerStructure;
  private readonly queryMock: jest.Mock;
  private readonly itemMock: jest.Mock;
  private readonly createMock: jest.Mock;

  constructor() {
    this.queryMock = jest.fn();
    this.itemMock = jest.fn();
    this.createMock = jest.fn();

    this.mockContainer = {
      items: {
        query: this.queryMock,
        create: this.createMock,
      },
      item: this.itemMock,
    };
  }

  /**
   * Configure query to return specific resources
   */
  queryReturns<T>(resources: T[]): this {
    const fetchAllMock = jest.fn().mockResolvedValue({ resources });
    this.queryMock.mockReturnValue({ fetchAll: fetchAllMock });
    return this;
  }

  /**
   * Configure query to fail with an error
   */
  queryFails(error: Error | string): this {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const fetchAllMock = jest.fn().mockRejectedValue(errorObj);
    this.queryMock.mockReturnValue({ fetchAll: fetchAllMock });
    return this;
  }

  /**
   * Configure item.read() to return a specific resource
   */
  itemReadReturns<T>(resource: T): this {
    const readMock = jest.fn().mockResolvedValue({ resource });
    this.itemMock.mockReturnValue({ read: readMock });
    return this;
  }

  /**
   * Configure item.read() to return undefined (not found)
   */
  itemReadReturnsUndefined(): this {
    const readMock = jest.fn().mockResolvedValue({ resource: undefined });
    this.itemMock.mockReturnValue({ read: readMock });
    return this;
  }

  /**
   * Configure item.read() to fail with a specific error code
   */
  itemReadFails(code: number): this {
    const readMock = jest.fn().mockRejectedValue({ code });
    this.itemMock.mockReturnValue({ read: readMock });
    return this;
  }

  /**
   * Configure item.replace() to return a specific resource
   */
  itemReplaceReturns<T>(resource: T): this {
    const replaceMock = jest.fn().mockResolvedValue({ resource });
    this.itemMock.mockReturnValue({ replace: replaceMock });
    return this;
  }

  /**
   * Configure item.replace() to return null (update failed)
   */
  itemReplaceReturnsNull(): this {
    const replaceMock = jest.fn().mockResolvedValue({ resource: null });
    this.itemMock.mockReturnValue({ replace: replaceMock });
    return this;
  }

  /**
   * Configure item.replace() to fail with a specific error code
   */
  itemReplaceFails(code: number): this {
    const replaceMock = jest.fn().mockRejectedValue({ code });
    this.itemMock.mockReturnValue({ replace: replaceMock });
    return this;
  }

  /**
   * Configure item.delete() to succeed
   */
  itemDeleteSucceeds(): this {
    const deleteMock = jest.fn().mockResolvedValue({});
    this.itemMock.mockReturnValue({ delete: deleteMock });
    return this;
  }

  /**
   * Configure item.delete() to fail with a specific error code
   */
  itemDeleteFails(code: number): this {
    const deleteMock = jest.fn().mockRejectedValue({ code });
    this.itemMock.mockReturnValue({ delete: deleteMock });
    return this;
  }

  /**
   * Configure items.create() to return a specific resource
   */
  createReturns<T>(resource: T): this {
    this.createMock.mockResolvedValue({ resource });
    return this;
  }

  /**
   * Configure items.create() to return null (create failed)
   */
  createReturnsNull(): this {
    this.createMock.mockResolvedValue({ resource: null });
    return this;
  }

  /**
   * Configure items.create() to fail with an error
   */
  createFails(error: Error | string): this {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.createMock.mockRejectedValue(errorObj);
    return this;
  }

  /**
   * Build and return the mocked CosmosContainer
   */
  build(): jest.Mocked<CosmosContainer> {
    return this.mockContainer as unknown as jest.Mocked<CosmosContainer>;
  }
}

/**
 * Create a new Cosmos Container mock builder
 */
export function buildCosmosContainerMock(): CosmosContainerMockBuilder {
  return new CosmosContainerMockBuilder();
}
