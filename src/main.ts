import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    try {
        console.log("🚀 Starting app...");

        const app = await NestFactory.create(AppModule);

        app.setGlobalPrefix('api');

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );

        app.enableCors({
            origin: [
                'https://sharks-of-law-frontend.vercel.app',
            ],
            methods: '*',
            allowedHeaders: '*',
            credentials: true,
        });

        const port = process.env.PORT || 3000;

        // 🔥 CRITICAL FIX (THIS IS THE ISSUE)
        await app.listen(port, '0.0.0.0');

        console.log(`✅ Server running on ${port}`);
    } catch (err) {
        console.error("❌ BOOT ERROR:", err);
    }
}

bootstrap();