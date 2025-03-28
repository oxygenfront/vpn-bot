import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { MyContext } from '../interfaces/telegram.interface';

@Injectable()
export class UserService {
    constructor( private readonly prismaService: PrismaService ) {
    }

    async getUserSubscriptions( ctx: MyContext ): Promise<string> {
        // Реализация с Prisma
        return '• 🟢 Premium до 01\\.05\\.2024\n• 🟡 Standard до 01\\.06\\.2024';
    }

    async getUserDays( ctx: MyContext ): Promise<number> {
        return 30; // Реализация с Prisma
    }

    async getActiveDevices( ctx: MyContext ): Promise<number> {
        return 2; // Реализация с Prisma
    }

    async getUserStatus( ctx: MyContext ): Promise<string> {
        return '💎 Premium'; // Реализация с Prisma
    }

    async getUserDevices( ctx: MyContext ) {
        return [
            {
                id: 1,
                name: 'iPhone 13',
                addedDate: '01.04.2024',
                lastActive: '15.04.2024',
                traffic: 5.2
            },
            {
                id: 2,
                name: 'MacBook Pro',
                addedDate: '02.04.2024',
                lastActive: '15.04.2024',
                traffic: 12.8
            },
        ]; // Реализация с Prisma
    }

    async getAvailableDevices( ctx: MyContext ): Promise<number> {
        const limit = await this.getDeviceLimit(ctx);
        const current = (await this.getUserDevices(ctx)).length;
        return Math.max(0, limit - current);
    }

    async getDeviceLimit( ctx: MyContext ): Promise<number> {
        return 3; // Реализация с Prisma
    }

    async getSelectedPlan( ctx: MyContext ) {
        return { name: 'Premium', duration: 12, price: 40 }; // Реализация с Prisma или сессией
    }

    async getPromoDiscount( promocode: string ): Promise<number> {
        return 15; // Реализация с Prisma
    }

    async getPromoExpiry( promocode: string ): Promise<string> {
        return '01.05.2024'; // Реализация с Prisma
    }

    async getUserNotificationSettings( ctx: MyContext ) {
        return {
            expiryReminder: true,
            newsAndUpdates: true,
            promotions: false,
            serviceStatus: true
        }; // Реализация с Prisma
    }

    async getUserPaymentHistory( ctx: MyContext ) {
        return [
            {
                month: '04',
                year: '2024',
                amount: 40,
                plan: 'Premium',
                status: 'Оплачено'
            },
            {
                month: '03',
                year: '2024',
                amount: 12,
                plan: 'Standard',
                status: 'Оплачено'
            },
        ]; // Реализация с Prisma
    }
}