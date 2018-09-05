import * as Knex from 'knex';

const mockNickname = {
  date: new Date().toISOString(),
  nickname: 'mockSeedNickname',
};

export function seed(db: Knex) {
  return db.table('users_online').insert({
    created_at: mockNickname.date,
    nickname: mockNickname.nickname,
  });
}
