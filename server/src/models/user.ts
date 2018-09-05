import isAlpha = require('validator/lib/isAlpha');

import { ApiError } from '../errors';
import { Validator } from '../utils';

export class User {
  constructor(
    public readonly nickname: string | any,
    public readonly id?: number,
    // tslint:disable:variable-name
    public readonly created_at?: Date, // tslint:enable:variable-name
  ) {
    if (!nickname || typeof nickname !== 'string') {
      throw new ApiError('Invalid nickname.');
    }

    const nicknameAsString = Validator.coerseToString(nickname);

    if (typeof nicknameAsString !== 'string') {
      throw new ApiError('Invalid characters on nickname.');
    }

    if (nicknameAsString.length === 0 || nicknameAsString.length > 32) {
      throw new ApiError('Username must be between 1 and 32 characters.');
    }

    if (!isAlpha(nicknameAsString) || nicknameAsString.match(/\s/)) {
      throw new ApiError('Invalid characters on nickname, only alphanumeric with no whitespaces are valid.');
    }
  }
}
