import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { json } from "express";
import { AppModule } from "./modules/app.module";
import { loadEnv, corsOrigins } from "./config/env";
import { AllExceptionsFilter } from "./modules/common/all-exceptions.filter";

async function bootstrap() {
  const env = loadEnv(); // valida la configuración antes de arrancar

  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn"],
    bodyParser: false
  });

  app.use(helmet());
  app.use(json({ limit: "1mb" })); // límite explícito del cuerpo JSON
  app.enableCors({ origin: corsOrigins(env), credentials: true });
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(env.API_PORT);
}

bootstrap();
