import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // ✅ Global prefix
    app.setGlobalPrefix('api');

    // ✅ Global validation (important)
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    // ✅ CORS (FIXED - no dependency on missing env)
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://sharks-of-law-frontend.vercel.app',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: '*',
        credentials: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Server running on port ${port}`);
}

bootstrap();