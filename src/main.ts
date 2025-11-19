import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

  const config = new DocumentBuilder()
    .setTitle('WhatsApp API')
    .setDescription('NestJS + Baileys WhatsApp integration API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Swagger at /docs

  await app.listen(3000);
}
bootstrap();
