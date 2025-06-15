import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'nestjs-prisma';
import { TelegramModule } from "./telegram.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
        }),
        PrismaModule.forRoot({
            isGlobal: true,
            prismaServiceOptions: {
                explicitConnect: true
            }
        }),
        TelegramModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {
}