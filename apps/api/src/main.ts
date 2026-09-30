import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProd = process.env.NODE_ENV === "production";

  app.use(
    helmet({
      contentSecurityPolicy: isProd,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle("Boilerplate API")
      .setDescription("API documentation")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, "0.0.0.0");

  console.log(`Application is running on: http://localhost:${port}`);
  if (!isProd) {
    console.log(`Swagger docs at: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
