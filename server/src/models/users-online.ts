export class UsersOnline {
  constructor(
    public readonly nickname: string,
    // tslint:disable:variable-name
    public readonly created_at?: string,
    // tslint:enable:variable-name
    public readonly id?: number,
  ) {}
}
