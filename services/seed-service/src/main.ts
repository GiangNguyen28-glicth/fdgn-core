import { Application } from '@fdgn/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
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
  app.use(
    createProxyMiddleware({
      target: 'http://localhost:4001/',
      changeOrigin: true,
    }),
  );
  Application.bootstrap(app, options);
}

bootstrap();
