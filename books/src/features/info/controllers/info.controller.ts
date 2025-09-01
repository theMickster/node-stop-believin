import { Request, Response } from 'express';

export class InfoController {
  public getApiInfo(req: Request, res: Response): void {
    res.status(200).json({
      message: 'Cosmic Books API v2',
      description: 'Azure Entra ID Protected API',
      availableVersions: ['v1', 'v2'],
      authentication: 'Azure Entra ID (OAuth 2.0 Bearer Token)',
    });
  }
}
