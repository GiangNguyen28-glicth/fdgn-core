import { Injectable } from '@nestjs/common';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
// mongoose.set('bufferCommands', false);
mongoose.set('debug', process.env.NODE_ENV === 'prod' ? false : true);
@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions | Promise<MongooseModuleOptions> {
    return {
      uri: process.env.MONGO_URI,
      user: process.env.MONGO_USERNAME,
      pass: process.env.MONGO_PASSWORD,
      connectionFactory: connection => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      },
    };
  }
}
