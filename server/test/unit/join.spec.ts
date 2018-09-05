jest.mock('../../src/services/join');
jest.mock('../../src/shared/logger');

import { Join as JoinController } from '../../src/controllers';
import { ApiError } from '../../src/errors';
import { ApiResponse } from '../../src/models';
import { AngularChatRequest } from '../../src/shared';

describe(`Join controller`, () => {
  it('should add a new nickname to the chatroom', async () => {
    const nickname = 'newNickname';

    const mockReq = {
      body: {
        nickname,
      },
      session: {},
    } as AngularChatRequest;

    try {
      const resp: ApiResponse | ApiError = await JoinController.addUser(mockReq);

      expect(resp.status).toBe(201);
      expect(resp.message).toEqual('User session initialized successfully.');
    } catch (err) {
      expect(err).toBeNull();
      throw err;
    }
  });

  it('should return an error when a nickname already exists on the database', async () => {
    const nickname = 'mockDuplicatedNickname';

    const mockReq = {
      body: {
        nickname,
      },
      session: {},
    } as AngularChatRequest;

    try {
      const resp: ApiResponse | ApiError = await JoinController.addUser(mockReq);

      expect(resp).toBeNull();
    } catch (err) {
      expect(err.status).toBe(500);
      expect(err.message).toEqual(`Nickname "${nickname}" is already in use!`);
    }
  });
});
