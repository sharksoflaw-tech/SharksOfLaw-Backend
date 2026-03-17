import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // ✅ Global prefix
    app.setGlobalPrefix('api');

    // ✅ CORS configuration
    const corsEnv = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS;
    const allowedOrigins = corsEnv
        ? corsEnv.split(',').map((o) => o.trim())
        : ['http://localhost:3000'];

    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,POST,PATCH,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization',
        credentials: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
}
bootstrap();