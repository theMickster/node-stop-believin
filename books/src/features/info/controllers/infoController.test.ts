import { Request, Response } from 'express';

import { InfoController } from './info.controller';

describe('InfoController', () => {
  let controller: InfoController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    controller = new InfoController();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockRequest = {
      authInfo: undefined,
      user: undefined,
    };
  });

  describe('getApiInfo', () => {
    it('should return API information', () => {
      controller.getApiInfo(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Cosmic Books API v2',
        description: 'Azure Entra ID Protected API',
        availableVersions: ['v1', 'v2'],
        authentication: 'Azure Entra ID (OAuth 2.0 Bearer Token)',
      });
    });
  });
});
