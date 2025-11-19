import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ❌ REMOVE these lines – Nest already handles body parsing
  // app.use(bodyParser.json());
  // app.use(bodyParser.urlencoded({ extended: true }));

  const config = new DocumentBuilder()
    .setTitle('WhatsApp API')
    .setDescription('NestJS + Baileys WhatsApp integration API')
    .setVersion('1.0')
    .build();

  // ✅ Use a factory with NestJS 11
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory); // Swagger at /docs

  await app.listen(3000);
}
bootstrap();
