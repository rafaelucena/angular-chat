import { Request, Router } from 'express';
import { Join as JoinController } from '../controllers';
import { Handler } from '../utils';

export class Join {
  public static setupRoutes(router: Router) {
    // /join route definition.
    router.post('/join', Handler.controllerHandler(JoinController.addUser, (req: Request) => [req]));
  }

  private constructor() {}
}
