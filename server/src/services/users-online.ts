import { UsersOnline as UsersOnlineModel } from '../models';
import { Database } from '../shared';

export class UsersOnline {
  public static async getUsersOnline(): Promise<UsersOnlineModel[]> {
    const db = await Database.getInstance();
    const response = await db
      .table('users_online')
      .select()
      .orderBy('nickname', 'desc');

    return response.map(
      (user: UsersOnlineModel) => new UsersOnlineModel(user.nickname, user.created_at, user.id),
    );
  }

  public static async addUserToOnlineList(nickname: string, dateISO: string): Promise<void> {
    const db = await Database.getInstance();
    return await db.table('users_online').insert({
      created_at: dateISO,
      nickname,
    });
  }

  public static async removeUserFromOnlineList(nickname: string): Promise<void> {
    const db = await Database.getInstance();
    return await db
      .table('users_online')
      .where({ nickname })
      .delete();
  }
}
