<?php
/**
 * Готовый конфиг для Cloudbell mail webhook.
 * После загрузки на хостинг заполните smtp_user/smtp_pass/from_email
 * и поставьте тот же webhook_secret в Railway (MAIL_WEBHOOK_SECRET).
 */
return [
    'webhook_secret' => 'CHANGE_ME_VERY_LONG_RANDOM_SECRET_2026',

    'smtp_host' => 'smtp.yandex.ru',
    'smtp_port' => 465,
    'smtp_user' => 'skorobogatov@qwik.pro',
    'smtp_pass' => 'PASTE_YANDEX_APP_PASSWORD_HERE',

    'from_name' => 'Брикет-Бери',
    'from_email' => 'skorobogatov@qwik.pro',

    'recipients' => [
        'skorobogatov@qwik.pro',
        'pitsenckoolga@yandex.ru',
        'ElizavetaB@briket-berry.ru',
    ],
];
