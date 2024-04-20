import { QueryRunner, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
@Injectable()
export class TypeOrmService {
  constructor(private data_source: DataSource) {}

  async getConnection(): Promise<QueryRunner> {
    const queryRunner = this.data_source.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }
}
