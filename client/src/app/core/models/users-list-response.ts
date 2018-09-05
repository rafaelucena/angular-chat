import { User } from '../../shared/models/user';

export class UsersListResponse {
  constructor(public status: number, public message: string, public users?: User[]) {}
}
