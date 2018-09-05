import { environment } from '../../../environments/environment';

export const BACKEND_IP = environment.production ? '0.0.0.0' : '127.0.0.1';
export const BACKEND_PORT = '8001';
export const BACKEND_ROOT_API_URL = '/api/v1';

export const BACKEND_URL = `${BACKEND_IP}:${BACKEND_PORT}${BACKEND_ROOT_API_URL}`;
