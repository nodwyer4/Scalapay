import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { createSchema } from 'zod-openapi';
import dotenv from 'dotenv';

// dot env loading
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Application API')
    .setDescription('The core endpoint documentation for our service')
    .setVersion('1.0')
    .addTag('Products')
    .build();

  const documentOptions: SwaggerDocumentOptions = {
    standardSchemaConverter: (schema, { schemaType }) => {
      const converted = createSchema(schema as never, {
        io: schemaType,
        openapiVersion: '3.0.0',
      });
      return { schema: converted.schema, components: converted.components };
    },
  };

  const documentFactory = () =>
    cleanupOpenApiDoc(
      SwaggerModule.createDocument(app, config, documentOptions),
    );

  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'docs-json',
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
