import { QueryRunner, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
@Injectable()
export class TypeOrmService {
  constructor(private dataSource: DataSource) {}

  async getConnection(): Promise<QueryRunner> {
    const query_runner = this.dataSource.createQueryRunner();
    await query_runner.connect();
    await query_runner.startTransaction();
    return query_runner;
  }
}
