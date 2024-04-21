import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';
@Injectable()
export class MongooseService {
  constructor(@InjectConnection() private readonly connection: Connection) {}
  async getConnection(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
