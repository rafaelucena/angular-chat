import { ApiError } from '../errors';
import { ApiResponse, User } from '../models';
import { Join as JoinService } from '../services';
import { AngularChatRequest, Logger } from '../shared';
import { autoRetry } from '../utils';

export class Join {
  private static logger = Logger.getInstance();

  public static async addUser(req: AngularChatRequest): Promise<ApiResponse> {
    // Instantiate and validate the given user nickname before querying the database.
    const validUser = new User(req.body.nickname);

    const foundNickname = await autoRetry(() => JoinService.searchNickname(validUser.nickname));

    // Validates if the given user already exists on the session
    if (foundNickname) {
      throw new ApiError(`Nickname "${validUser.nickname}" is already in use!`);
    }

    // Creates a new session for the user
    req.session.nickname = validUser.nickname;
    Join.logger.debug(`Created session for user: "${validUser.nickname}"`);

    return new ApiResponse('User session initialized successfully.', 201);
  }
}
