export class ChatMessage {
  constructor(
    public readonly nickname: string,
    public readonly message: string,
    // tslint:disable:variable-name
    public readonly created_at?: string,
    // tslint:enable:variable-name
    public readonly id?: number,
  ) {}
}
