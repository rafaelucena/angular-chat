// This project is currently using SQLite as the DB engine, concurrent write/reads may fail as the DB could be locked.
// autoRetry retries some operation `maxAttempts` times.
export async function autoRetry(cb: () => any, maxAttempts: number = 10): Promise<any> {
  if (maxAttempts === 0) {
    throw new Error(`Maximum attempts reached when retrying ${cb.name} `);
  }
  try {
    return await Promise.resolve(cb());
  } catch (err) {
    return await autoRetry(cb, maxAttempts - 1);
  }
}
