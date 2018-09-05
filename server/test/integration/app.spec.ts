import fetch, { Response } from 'node-fetch';
import { API_ROOT_PATH, HOST, PORT } from '../../src/config';

const ROOT_URL = `http://${HOST}:${PORT}${API_ROOT_PATH}`;

describe(`index route (${API_ROOT_PATH})`, () => {
  it('should return 404 on invalid route', async () => {
    try {
      const resp: Response = await fetch(ROOT_URL + '/invalid');
      const respJson = await resp.json();

      expect(resp.status).toBe(404);
      expect(resp.headers.get('content-type')).toMatch(/application\/json/);
      expect(respJson).toEqual({ message: 'Not found.' });
    } catch (err) {
      throw err;
    }
  });
});
