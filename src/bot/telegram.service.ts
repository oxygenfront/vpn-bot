import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { MyContext } from './interfaces/telegram.interface';


@Injectable()
export class TelegramService {

    constructor(
        @InjectBot() private readonly bot: Telegraf,
        private readonly prismaService: PrismaService
    ) {
    }

    // First level bot

    async handleStart( ctx: MyContext ) {

        const text = `🔒 Привет\\! Добро пожаловать в VPN\\-магазин от *_Oxygen\\!_*
Мы предлагаем __безопасные__ и __быстрые__ сервера к которым вы можете подключиться посредством токенов для *_Amnezia_* и *_Hiddify_*\\.

✅ *_Полная анонимность_*
🚀 *_Высокая скорость соединения_*
💰 *_Доступные цены_*

📌 Выберите нужный раздел в меню ниже и получите доступ к защищённому интернету уже сейчас\\!`
        try {
            if ( ctx.callbackQuery ) {
                await ctx.editMessageText(text, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '👤 Ваш аккаунт',
                                    callback_data: 'my_account'
                                },
                                {
                                    text: '🪙 Купить токен',
                                    callback_data: 'buy_token'
                                },
                            ],
                            [
                                {
                                    text: '🤔 Как использовать токен ?',
                                    callback_data: 'how_use_token'
                                }
                            ],
                            [
                                { text: '❓ Помощь', callback_data: 'help' },
                                {
                                    text: '⚙️ Настройки',
                                    callback_data: 'settings'
                                },
                            ],
                        ],
                    },
                    parse_mode: 'MarkdownV2'

                });
            } else {
                await ctx.reply(text, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '👤 Ваш аккаунт',
                                    callback_data: 'my_account'
                                },
                                {
                                    text: '🪙 Купить токен',
                                    callback_data: 'buy_token'
                                },
                            ],
                            [
                                {
                                    text: '🤔 Как использовать токен ?',
                                    callback_data: 'how_use_token'
                                }
                            ],
                            [
                                { text: '❓ Помощь', callback_data: 'help' },
                                {
                                    text: '⚙️ Настройки',
                                    callback_data: 'settings'
                                },
                            ],
                        ],
                    },
                    parse_mode: 'MarkdownV2'
                });
            }
        } catch ( error ) {
            console.error('Ошибка при обработке команды /start:', error);
            await ctx.reply('Произошла ошибка. Попробуйте позже.');
        }
    }

// ------------------------------------------------------------------

    // Second level

    async handleMyAccount( ctx: MyContext ) {
        try {
            if ( ctx.callbackQuery ) {
                await ctx.editMessageText('Ваш аккаунт', {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '💰 Мои токены',
                                    callback_data: 'my_tokens'
                                },
                                {
                                    text: '📜 История покупок',
                                    callback_data: 'history_purchased'
                                },
                            ],
                            [ { text: '🔙 Меню', callback_data: 'start' },
                                {
                                    text: '🔄 Продлить подписку',
                                    callback_data: 'renew_subscription'
                                },

                            ]
                        ]
                    }
                })
            } else {
                await ctx.reply('Ваш аккаунт', {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '💰 Мои токены',
                                    callback_data: 'my_tokens'
                                },
                                {
                                    text: '📜 История покупок',
                                    callback_data: 'history_purchased'
                                },
                            ],
                            [ { text: '🔙 Меню', callback_data: 'start' },
                                {
                                    text: '🔄 Продлить подписку',
                                    callback_data: 'renew_subscription'
                                }

                            ]
                        ]
                    }
                })
            }
        } catch ( error ) {
            console.error(error);
            await ctx.reply('Произошла ошибка. Попробуйте позже.')
        }
    }

    async handleHowUseToken( ctx: MyContext ) {
        const text = `Как использовать токен ?\nДля начала выберите приложение в котором желаете использовать токен\\.\n\n_Дополнительная информация:_\n\n*_Оба приложения_* — \`AmneziaVPN\` и \`Hiddify\` — __*просты в использовании*__ и обеспечат вам __*безопасный*__ доступ к сети\\. Выберите тот, который вам удобнее:\n\n\\ \\- \`AmneziaVPN\` и \`Hiddify\` *_одинаково легко_* настраиваются и подходят для *_быстрого подключения_*\\.\n\\ \\- Выберите сервис, исходя из ваших предпочтений или уже установленного приложения\\.`
        try {
            if ( ctx.callbackQuery ) {
                await ctx.editMessageText(text, {
                    reply_markup: {
                        inline_keyboard: [ [ {
                            text: '🔒 AmneziaVPN',
                            url: 'https://telegra.ph/Kak-ispolzovat-token-v-AmneziaVPN-02-26'
                        }, {
                            text: '🕵️ Hiddify',
                            url: 'https://telegra.ph/Kak-ispolzovat-token-v-HiddifyVPN-02-26'
                        } ], [
                            { text: '🔙 Меню', callback_data: 'start' }
                        ] ]
                    },
                    parse_mode: 'MarkdownV2'
                })
            } else {
                await ctx.reply(text, {
                    reply_markup: {
                        inline_keyboard: [ [ {
                            text: '🔒 AmneziaVPN',
                            url: 'https://telegra.ph/Kak-ispolzovat-token-v-AmneziaVPN-02-26'
                        }, {
                            text: '🕵️ Hiddify',
                            url: 'https://telegra.ph/Kak-ispolzovat-token-v-HiddifyVPN-02-26'
                        } ], [
                            { text: '🔙 Меню', callback_data: 'start' }
                        ] ]
                    },
                    parse_mode: 'MarkdownV2'
                })
            }
        } catch ( error ) {
            console.error(error);
            await ctx.reply('Произошла ошибка. Попробуйте позже.')
        }
    }

    async handleBuyToken( ctx: MyContext ) {
        try {
            if ( ctx.callbackQuery ) {
                await ctx.editMessageText('Выберите план подписки: ', {
                    reply_markup: {
                        inline_keyboard: [ [ {
                            text: 'Ввести промокод',
                            callback_data: 'promocode'
                        } ], [
                            { text: '🔙 Меню', callback_data: 'start' }
                        ] ]
                    }
                })
            } else {
                await ctx.reply('Выберите план подписки: ', {
                    reply_markup: {
                        inline_keyboard: [ [ {
                            text: 'Ввести промокод',
                            callback_data: 'promocode'
                        } ], [
                            { text: '🔙 Меню', callback_data: 'start' }
                        ] ]
                    }
                })
            }
        } catch ( error ) {
            console.error(error);
            await ctx.reply('Произошла ошибка. Попробуйте позже.')
        }
    }

    async handleHelp( ctx: MyContext ) {
        const text = `В данном разделе вы можете найти ответы на интересующие вас вопросы, а также оставить свой отзыв или связаться напрямую с техническим специалистом\\.`
        try {
            if ( ctx.callbackQuery ) {
                await ctx.editMessageText(text, {
                    reply_markup: {
                        inline_keyboard: [ [ {
                            text: '❓ FAQ',
                            callback_data: 'faq'
                        }, {
                            text: '🌟 Отзыв',
                            url: 'https://t.me/vpn_by_oxy_support'
                        } ], [ { text: '🔙 Меню', callback_data: 'start' }, {
                            text: '🆘 Поддержка',
                            url: 'https://t.me/vpn_by_oxy_support'
                        } ] ]
                    },
                    parse_mode: 'MarkdownV2'
                })
            } else {
                await ctx.reply(text, {
                    reply_markup: {
                        inline_keyboard: [ [ {
                            text: '❓ FAQ',
                            callback_data: 'faq'
                        }, {
                            text: '🌟 Отзыв',
                            url: 'https://t.me/vpn_by_oxy_support'
                        } ], [ { text: '🔙 Меню', callback_data: 'start' }, {
                            text: '🆘 Поддержка',
                            url: 'https://t.me/vpn_by_oxy_support'
                        } ] ]
                    },
                    parse_mode: 'MarkdownV2'
                })
            }
        } catch ( error ) {
            console.error(error);
            await ctx.reply('Произошла ошибка. Попробуйте позже.')
        }
    }

    async handleSettings( ctx: MyContext ) {
        try {
            if ( ctx.callbackQuery ) {
                await ctx.editMessageText('Настройки', {
                    reply_markup: {
                        inline_keyboard: [ [ {
                            text: '🌐 Язык',
                            callback_data: 'languages'
                        }, {
                            text: '🔕 Уведомления',
                            callback_data: 'notifications'
                        } ], [ {
                            text: '🛡️ Политика конфиденциальности',
                            callback_data: 'privacy_policy'
                        } ], [
                            { text: '🔙 Меню', callback_data: 'start' }
                        ] ]
                    }
                })
            } else {
                await ctx.reply('Настройки', {
                    reply_markup: {
                        inline_keyboard: [ [ {
                            text: '🌐 Язык',
                            callback_data: 'languages'
                        }, {
                            text: '🔕 Уведомления',
                            callback_data: 'notifications'
                        } ], [ {
                            text: '🛡️ Политика конфиденциальности',
                            callback_data: 'privacy_policy'
                        } ], [
                            { text: '🔙 Меню', callback_data: 'start' }
                        ] ]
                    }
                })
            }
        } catch ( error ) {
            console.error(error);
            await ctx.reply('Произошла ошибка. Попробуйте позже.')
        }
    }

    async handlePromoCode( ctx: MyContext ) {
        if ( !ctx.session.promocode || ctx.session.promocode.length === 0 ) {
            await ctx.editMessageText('Введите промокод', {
                reply_markup: {
                    inline_keyboard: [ [ {
                        text: '🔙 Назад',
                        callback_data: 'buy_token'
                    } ] ],
                },
            });
        } else {
            await ctx.editMessageText(
                `Вы уже ввели промокод: ${ctx.session.promocode}.\nЖелаете его изменить?`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [ {
                                text: 'Изменить промокод',
                                callback_data: 'change_promocode'
                            } ],
                            [
                                { text: '🔙 Назад', callback_data: 'buy_token' },
                                {
                                    text: 'Меню',
                                    callback_data: 'start'
                                },
                            ],
                        ],
                    },
                }
            );
        }
    }

    async handleFaq( ctx: MyContext ) {
        try {
            if ( ctx.callbackQuery ) {
                await ctx.editMessageText('Ответы на популярные вопросы: ', {
                    reply_markup: {
                        inline_keyboard: [ [ {
                            text: '🔄 Как продлить подписку',
                            url: 'https://telegra.ph/Kak-prodlit-podpisku-02-26'
                        }, {
                            text: '❌ Токен не работает',
                            url: 'https://telegra.ph/Token-ne-rabotaet-chto-delat-02-26'
                        } ], [ { text: '🔙 Меню', callback_data: 'start' }, {
                            text: '💻 Какой клиент выбрать',
                            url: 'https://telegra.ph/Kakoj-klient-vybrat-02-26'
                        } ] ]
                    },
                    parse_mode: 'MarkdownV2'
                })
            } else {
                await ctx.reply('Ответы на популярные вопросы: ', {
                    reply_markup: {
                        inline_keyboard: [ [ {
                            text: '🔄 Как продлить подписку',
                            url: 'https://telegra.ph/Kak-prodlit-podpisku-02-26'
                        }, {
                            text: '❌ Токен не работает',
                            url: 'https://telegra.ph/Token-ne-rabotaet-chto-delat-02-26'
                        } ], [ { text: '🔙 Меню', callback_data: 'start' }, {
                            text: '💻 Какой клиент выбрать',
                            url: 'https://telegra.ph/Kakoj-klient-vybrat-02-26'
                        } ] ]
                    },
                    parse_mode: 'MarkdownV2'
                })
            }
        } catch ( error ) {
            console.error(error);
            await ctx.reply('Произошла ошибка. Попробуйте позже.')
        }
    }

}