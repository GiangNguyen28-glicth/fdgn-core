import { Application } from '@fdgn/core';
import { SeedModule } from './seed.module';

Application.bootstrap(SeedModule, {
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  },
});
