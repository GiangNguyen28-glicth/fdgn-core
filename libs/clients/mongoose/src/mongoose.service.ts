import { Injectable } from '@nestjs/common';
import { Connection, ClientSession } from 'mongoose';
@Injectable()
export class MongooseService {
  constructor(private readonly connection: Connection) {}

  async getConnection(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
