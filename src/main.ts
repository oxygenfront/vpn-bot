import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv'
import { AppModule } from './app.module';

dotenv.config()

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.enableCors({
        origin: 'http://194.58.59.223:8229/',
        credentials: true,
    })

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
