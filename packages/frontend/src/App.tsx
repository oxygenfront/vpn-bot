import { useEffect, useState } from 'react'

export const App = () => {
    const [ chatId, setChatId ] = useState<string>('')
    const [ invoiceId, setInvoiceId ] = useState<string>('')
    const [ amount, setAmount ] = useState<number>(0)
    const [ months, setMonths ] = useState<number>(0)
    const [ messageId, setMessageId ] = useState<number>(0)
    const [ paymentType, setPaymentType ] = useState<string>()
    const PUBLIC_KEY = import.meta.env.VITE_CLOUDPAYMENTS_PUBLIC_KEY
    useEffect(() => {
        if ( !window.Telegram?.WebApp ) {
            console.error('Telegram Web App не доступен')
            return
        }

        const telegram = window.Telegram.WebApp
        telegram.ready()

        const initData = telegram.initDataUnsafe
        const userId = initData.user?.id || ''
        const urlParams = new URLSearchParams(window.location.search)

        const urlChatId = urlParams.get('chatId') || userId
        const urlInvoiceId = urlParams.get('invoiceId') || ''
        const urlAmount = Number(urlParams.get('amount'))
        const urlMonths = Number(urlParams.get('months'))
        const messageId = Number(urlParams.get('messageId'))
        const paymentType = String(urlParams.get('paymentType'))
        if ( !(urlChatId && urlInvoiceId) || urlAmount <= 0 ) {
            console.error('Некорректные параметры подписки')
            return
        }

        setPaymentType(paymentType)
        setMessageId(messageId)
        setMonths(urlMonths)
        setChatId(urlChatId)
        setInvoiceId(urlInvoiceId)
        setAmount(urlAmount)

        telegram.expand()
    }, [])

    useEffect(() => {
        if ( amount > 0 && chatId && invoiceId && paymentType ) {
            handlePayment()
        }
    }, [ amount, chatId, invoiceId, paymentType ])

    const handlePayment = () => {
        if ( !window.cp?.CloudPayments ) {
            console.error('CloudPayments не загружен')
            return
        }

        const receipt = {
            Items: [
                {
                    label: 'Подписка на VPN-сервис',
                    price: amount,
                    quantity: 1,
                    amount: amount,
                    vat: 20,
                    method: 0,
                    object: 0,
                },
            ],
            taxationSystem: 0,
            email: chatId,
            phone: '',
            isBso: false,
            amounts: {
                electronic: amount,
                advancePayment: 0.0,
                credit: 0.0,
                provision: 0.0,
            },
        }

        const data = {
            CloudPayments: {
                CustomerReceipt: receipt,
                messageId: messageId,
                type: paymentType,
                recurrent: {
                    interval: 'Month',
                    period: months,
                    customerReceipt: receipt,
                },
            },
        }

        const widget = new window.cp.CloudPayments()

        widget.oncomplete = ( result ) => {
            if ( result.status === 'success' ) {
                window.Telegram?.WebApp.showAlert('Оплата успешно завершена!')
                window.Telegram?.WebApp.close()
            }
        }

        widget.pay('charge', {
            publicId: PUBLIC_KEY,
            description: 'Подписка на VPN-сервис',
            amount: amount,
            currency: 'RUB',
            accountId: chatId,
            invoiceId: invoiceId,
            disableEmail: true,
            skin: 'modern',
            language: 'ru-RU',
            data: data,
        })
    }

    return <></>
}
