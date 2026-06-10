<?php
/**
 * Скопируйте этот файл как mail-config.php на хостинг (рядом с mail-order.php)
 * и заполните значения. mail-config.php НЕ коммитьте в git.
 */
return [
    // Должен совпадать с переменной MAIL_WEBHOOK_SECRET в Railway
    'webhook_secret' => 'замените_на_длинную_случайную_строку',

    'smtp_host' => 'smtp.yandex.ru',
    'smtp_port' => 465,
    'smtp_user' => 'ваш_ящик@yandex.ru',
    'smtp_pass' => 'пароль_приложения_яндекса',

    'from_name' => 'Брикет-Бери',
    // От кого (обычно тот же ящик, что smtp_user)
    'from_email' => 'ваш_ящик@yandex.ru',

    'recipients' => [
        'marketing@qwik.pro',
        'skorobogatov@qwik.pro',
        'pitsenckoolga@yandex.ru',
        'ElizavetaB@briket-berry.ru',
    ],
];
