export class ApiResponse {
  constructor(public readonly message: string, public readonly status: number = 200) {}
}
