export interface UrlParams {
    chatId: string
    invoiceId: string
    amount: number
}

export interface CloudPaymentsOptions {
    token: string

    [key: string]: any
}

export interface TelegramWebApp {
    ready: () => void
    expand: () => void
    close: () => void
    showAlert: ( message: string ) => void
    initDataUnsafe: {
        user?: {
            id: string
        }
    }
}

export interface CloudPaymentsWidget {
    auth: (
        config: {
            publicId: string
            description: string
            amount: number
            currency: string
            invoiceId: string
            accountId: string
            recurrent: {
                interval: string
                period: number
                amount: number
            }
            language: string
            skin: string
        },
        callbacks: {
            onSuccess: ( options: CloudPaymentsOptions ) => void
            onFail: ( reason: string ) => void
            onComplete: () => void
        },
    ) => void
}

declare global {
    interface Window {
        Telegram: {
            WebApp: TelegramWebApp
        }
        cp: {
            CloudPayments: new () => CloudPaymentsWidget
        }
    }
}
