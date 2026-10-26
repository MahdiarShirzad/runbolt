import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

process.loadEnvFile();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Prefix
  app.setGlobalPrefix('v1');

  const port = parseInt(process.env.PORT ?? '9000', 10);
  await app.listen(port);
  console.log(`🚀 API is running on port ${port}`);
}
bootstrap();