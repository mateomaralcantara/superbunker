import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["log", "error", "warn"] });
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix("api");
  await app.listen(process.env.API_PORT ? Number(process.env.API_PORT) : 4000);
}
bootstrap();
