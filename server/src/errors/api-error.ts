export class ApiError extends Error {
  constructor(public readonly message: string, public readonly status: number = 500) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}
