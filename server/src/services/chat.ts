import { ChatMessage } from '../models';
import { Database } from '../shared';

export class Chat {
  public static async getLatestMessages(amount: number = 10): Promise<ChatMessage[]> {
    const db = await Database.getInstance();
    const response = await db
      .table('chat_log')
      .select()
      .orderBy('id', 'desc')
      .limit(amount);

    return response.map(
      (message: ChatMessage) =>
        new ChatMessage(message.nickname, message.message, message.created_at, message.id),
    );
  }

  public static async addMessage(chatMessage: ChatMessage): Promise<void> {
    const db = await Database.getInstance();
    return await db.table('chat_log').insert({
      created_at: chatMessage.created_at,
      message: chatMessage.message,
      nickname: chatMessage.nickname,
    });
  }
}
