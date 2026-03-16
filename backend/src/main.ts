import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as bodyParser from "body-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS for frontend
    app.enableCors({
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    );

    // PhonePe needs raw JSON body for callback verification
    app.use(bodyParser.json({ limit: "1mb" }));
    app.use(bodyParser.raw({ type: "application/json" }));

    await app.listen(3000);
}
bootstrap();