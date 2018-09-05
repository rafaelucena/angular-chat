import * as Knex from 'knex';

const mockSession = {
  expired: 0,
  sess: '{"nickname":"mockSeedNickname"}',
  sid: 'mockSid',
};

export function seed(db: Knex) {
  return db.table('sessions').insert(mockSession);
}
