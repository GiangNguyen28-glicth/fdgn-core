import { Application } from '@fdgn/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const options = {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
    },
  };
  const app = await Application.getApp(AppModule, options);
  Application.bootstrap(app, options);
}

bootstrap();
