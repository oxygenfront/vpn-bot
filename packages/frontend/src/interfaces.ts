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
    openLink: ( url: string ) => void
    initDataUnsafe: {
        user?: {
            id: string
        }
    }
}

export interface CloudPaymentsWidget {
    pay: (
        method: string,
        config: {
            publicId: string
            description: string
            amount: number
            currency: string
            invoiceId: string
            accountId: string
            disableEmail: boolean
            skin: string
            language: string
            data?: any
        },
        callbacks?: {
            onSuccess?: ( options: CloudPaymentsOptions ) => void
            onFail?: ( reason: string ) => void
            onComplete?: ( paymentResult: any, options: CloudPaymentsOptions ) => void
        },
    ) => Promise<any>
    oncomplete?: ( result: any ) => void
    onsuccess?: ( result: any ) => void
    onfail?: ( error: any ) => void
}

declare global {
    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp
        }
        cp: {
            CloudPayments: new ( options?: {
                yandexPaySupport?: boolean
                applePaySupport?: boolean
                googlePaySupport?: boolean
                masterPassSupport?: boolean
                tinkoffInstallmentSupport?: boolean
            } ) => CloudPaymentsWidget
        }
    }
}
