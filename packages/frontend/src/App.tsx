import { useEffect, useState } from 'react'
import { CloudPaymentsOptions } from './interfaces'

export const App = () => {
    const [ chatId, setChatId ] = useState<string>('')
    const [ invoiceId, setInvoiceId ] = useState<string>('')
    const [ amount, setAmount ] = useState<number>(0)

    useEffect(() => {
        const telegram = window.Telegram.WebApp
        telegram.ready()

        // Получение данных из Telegram и URL
        const initData = telegram.initDataUnsafe
        const userId = initData.user?.id || ''
        const urlParams = new URLSearchParams(window.location.search)
        const urlChatId = urlParams.get('chatId') || userId
        const urlInvoiceId = urlParams.get('invoiceId') || ''
        const urlAmount = Number.parseFloat(urlParams.get('amount')) || 0

        setChatId(urlChatId)
        setInvoiceId(urlInvoiceId)
        setAmount(urlAmount)

        telegram.expand()

        if ( urlAmount > 0 && urlChatId && urlInvoiceId ) {
            handlePayment()
        }
    }, [])

    const handlePayment = () => {
        const widget = new window.cp.CloudPayments()

        widget.auth(
            {
                publicId: 'your_public_id', // Замените на ваш publicId из CloudPayments
                description: 'Подписка на услугу',
                amount: amount,
                currency: 'RUB',
                invoiceId: invoiceId,
                accountId: chatId,
                recurrent: {
                    interval: 'Month',
                    period: 1,
                    amount: amount,
                },
                language: 'ru-RU',
                skin: 'modern',
            },
            {
                onSuccess: ( options: CloudPaymentsOptions ) => {
                    const token = options.token
                    createSubscriptionOnServer(token)
                },
                onFail: ( reason: string ) => {
                    window.Telegram.WebApp.showAlert(`Ошибка: ${reason}`)
                    window.Telegram.WebApp.close()
                },
                onComplete: () => {
                    console.log('Процесс завершен')
                },
            },
        )
    }

    const createSubscriptionOnServer = async ( token: string ) => {
        try {
            const response = await fetch('https://f1ff-194-87-30-250.ngrok-free.app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    amount,
                    invoiceId,
                    accountId: chatId,
                    interval: 'Month',
                    period: 1,
                }),
            })
            const result = await response.json()
            window.Telegram.WebApp.showAlert('Подписка успешно оформлена!')
            window.Telegram.WebApp.close()
        } catch ( error ) {
            window.Telegram.WebApp.showAlert('Ошибка при создании подписки')
            window.Telegram.WebApp.close()
        }
    }

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Оформление подписки</h1>
            <p>Сумма: {amount} RUB ежемесячно</p>
            <p>Идет запуск платежного виджета...</p>
        </div>
    )
}
