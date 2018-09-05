import { Database } from '../shared';

export class Join {
  public static async searchNickname(nickname: string): Promise<string | undefined> {
    const db = await Database.getInstance();
    const response: any[] = await db.table('sessions').select('sess');

    const nicknameObjs: any[] = response.map((val: { sess: string }) => JSON.parse(val.sess));
    return nicknameObjs.filter((val: { nickname: string }): boolean => val.nickname === nickname)[0];
  }
}
