import { NextFunction, Request, Response, Router } from 'express';

import { ApiError } from '../errors';
import { Logger } from '../shared';
import { Join } from './join';

export class Api {
  private static logger = Logger.getInstance();

  public static initialize(): Router {
    const router: Router = Router();
    this.setupRoutes(router);

    return router;
  }

  private static setupRoutes(router: Router) {
    // Application-wide routes definitions.
    Join.setupRoutes(router);

    this.catchAllRoutes(router);
  }

  private static catchAllRoutes(router: Router) {
    // Disable favicon.ico requests.
    router.use('/favicon.ico', (req: Request, res: Response) => res.sendStatus(204));

    // Catch-all route.
    router.use('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'OPTIONS' || req.method === 'UPGRADE') {
        return next();
      }

      return res.status(404).json({ message: 'Not found.' });
    });

    // Error handling.
    router.use((err: ApiError | Error, req: Request, res: Response, _: NextFunction) => {
      // Expected ApiError.
      if (err instanceof ApiError) {
        return res.status((err as ApiError).status).json({ message: err.message });
      }

      // Unexpected errors.
      this.logger.error(`${err.name} - ${err.stack}`);
      return res.status(500).json({ error: 'Internal server error.' });
    });
  }

  private constructor() {}
}
