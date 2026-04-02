<?php
/**
 * Webhook: Railway → Cloudbell → SMTP (Яндекс и т.п.)
 * URL: https://briket-berry.ru/mail/mail-order.php
 *
 * Загрузите на хостинг: mail-order.php, mail-config.php (из примера), .htaccess
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$configPath = __DIR__ . '/mail-config.php';
if (!is_readable($configPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'mail-config.php missing']);
    exit;
}

/** @var array<string,mixed> $cfg */
$cfg = require $configPath;

$secret = isset($cfg['webhook_secret']) ? (string) $cfg['webhook_secret'] : '';
$hdr = $_SERVER['HTTP_X_WEBHOOK_SECRET'] ?? '';
if ($secret === '' || !hash_equals($secret, $hdr)) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: 'null', true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$type = $data['type'] ?? 'order';
if ($type === 'test') {
    $subject = 'Тест почты — Брикет-Бери (' . date('c') . ')';
    $text = "Тест SMTP с хостинга Cloudbell\nВремя: " . date('c');
    $html = '<p>Тест SMTP с хостинга <strong>Cloudbell</strong></p><p>Время: ' . htmlspecialchars(date('c'), ENT_QUOTES, 'UTF-8') . '</p>';
} elseif ($type === 'order') {
    $order = $data['order'] ?? null;
    if (!is_array($order)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Missing order']);
        exit;
    }
    $subject = 'Новая заявка ' . ($order['orderNumber'] ?? '') . ' — Брикет-Бери';
    $html = build_order_html($order);
    $text = build_order_text($order);
} else {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unknown type']);
    exit;
}

$recipients = $cfg['recipients'] ?? [];
if (!is_array($recipients) || $recipients === []) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No recipients in config']);
    exit;
}

try {
    smtp_send_mail($cfg, $recipients, $subject, $html, $text);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    exit;
}

echo json_encode(['ok' => true, 'recipients' => $recipients]);

// --- helpers ---

function build_order_text(array $o): string
{
    $lines = [
        'Новая заявка с сайта briket-berry.ru',
        '№: ' . ($o['orderNumber'] ?? ''),
        'Итого: ' . ($o['totalAmount'] ?? '') . ' ₽',
        'Клиент: ' . ($o['name'] ?? ''),
        'Телефон: ' . ($o['phone'] ?? ''),
        'Email: ' . ($o['email'] ?? '—'),
        'Заведение: ' . ($o['establishment'] ?? '') . ' (' . ($o['establishmentType'] ?? '') . ')',
        'Город: ' . ($o['city'] ?? ''),
        'Комментарий: ' . ($o['comment'] ?? '—'),
    ];
    $items = $o['items'] ?? [];
    if (is_array($items) && $items !== []) {
        $lines[] = '';
        $lines[] = 'Товары:';
        foreach ($items as $it) {
            if (!is_array($it)) {
                continue;
            }
            $lines[] = '- ' . ($it['productName'] ?? '') . ' × ' . ($it['quantity'] ?? '') . ' = ' . ($it['subtotal'] ?? '');
        }
    }
    return implode("\n", $lines);
}

function build_order_html(array $o): string
{
    $items = $o['items'] ?? [];
    $rows = '';
    if (is_array($items)) {
        foreach ($items as $it) {
            if (!is_array($it)) {
                continue;
            }
            $rows .= '<tr><td>' . h($it['productName'] ?? '') . '</td><td>' . h((string) ($it['quantity'] ?? '')) . '</td>'
                . '<td>' . h((string) ($it['subtotal'] ?? '')) . ' ₽</td></tr>';
        }
    }
    return '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">'
        . '<h2>Новая заявка</h2>'
        . '<p><b>№</b> ' . h($o['orderNumber'] ?? '') . '</p>'
        . '<p><b>Итого:</b> ' . h((string) ($o['totalAmount'] ?? '')) . ' ₽</p>'
        . '<table border="1" cellpadding="6" style="border-collapse:collapse;"><tr><th>Товар</th><th>Кол-во</th><th>Сумма</th></tr>'
        . $rows . '</table>'
        . '<p><b>Клиент:</b> ' . h($o['name'] ?? '') . '</p>'
        . '<p><b>Телефон:</b> ' . h($o['phone'] ?? '') . '</p>'
        . '<p><b>Email:</b> ' . h($o['email'] ?? '—') . '</p>'
        . '<p><b>Заведение:</b> ' . h($o['establishment'] ?? '') . '</p>'
        . '<p><b>Город:</b> ' . h($o['city'] ?? '') . '</p>'
        . '<p><b>Комментарий:</b> ' . h($o['comment'] ?? '—') . '</p>'
        . '</div>';
}

function h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

/**
 * @param array<string,mixed> $cfg
 * @param list<string> $to
 */
function smtp_send_mail(array $cfg, array $to, string $subject, string $html, string $text): void
{
    $host = (string) ($cfg['smtp_host'] ?? '');
    $port = (int) ($cfg['smtp_port'] ?? 465);
    $user = (string) ($cfg['smtp_user'] ?? '');
    $pass = (string) ($cfg['smtp_pass'] ?? '');
    $fromEmail = (string) ($cfg['from_email'] ?? $user);
    $fromName = (string) ($cfg['from_name'] ?? 'Брикет-Бери');

    if ($host === '' || $user === '' || $pass === '') {
        throw new RuntimeException('SMTP not configured in mail-config.php');
    }

    $remote = $port === 465 ? "ssl://{$host}:{$port}" : "tcp://{$host}:{$port}";
    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false,
        ],
    ]);

    $fp = @stream_socket_client($remote, $errno, $errstr, 30, STREAM_CLIENT_CONNECT, $ctx);
    if ($fp === false) {
        throw new RuntimeException("SMTP connect failed: {$errstr} ({$errno})");
    }
    stream_set_timeout($fp, 30);

    $write = static function (string $cmd) use ($fp): void {
        fwrite($fp, $cmd . "\r\n");
    };

    $readReply = static function (int $expectCode) use ($fp): void {
        $last = '';
        while (true) {
            $line = fgets($fp);
            if ($line === false) {
                throw new RuntimeException('SMTP read failed');
            }
            $last = $line;
            if (strlen($line) >= 4 && $line[3] === '-') {
                continue;
            }
            break;
        }
        if (!preg_match('/^' . $expectCode . ' /', $last)) {
            throw new RuntimeException('SMTP unexpected: ' . trim($last));
        }
    };

    $readReply(220);
    $write('EHLO briket-berry.ru');
    $readReply(250);

    if ($port !== 465) {
        $write('STARTTLS');
        $readReply(220);
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('STARTTLS failed');
        }
        $write('EHLO briket-berry.ru');
        $readReply(250);
    }

    $write('AUTH LOGIN');
    $readReply(334);
    $write(base64_encode($user));
    $readReply(334);
    $write(base64_encode($pass));
    $readReply(235);

    $write('MAIL FROM:<' . $fromEmail . '>');
    $readReply(250);

    foreach ($to as $rcpt) {
        $rcpt = trim($rcpt);
        if ($rcpt === '') {
            continue;
        }
        $write('RCPT TO:<' . $rcpt . '>');
        $readReply(250);
    }

    $write('DATA');
    $readReply(354);

    $boundary = 'b_' . bin2hex(random_bytes(8));
    $subjEnc = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $fromHdr = '=?UTF-8?B?' . base64_encode($fromName) . '?= <' . $fromEmail . '>';

    $headers = [
        'From: ' . $fromHdr,
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    ];

    $body = "--{$boundary}\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $text . "\r\n";
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $html . "\r\n";
    $body .= "--{$boundary}--\r\n";

    $message = implode("\r\n", $headers) . "\r\n\r\n" . $body;
    // dot-stuffing
    $message = preg_replace('/\n\./', "\n..", $message);
    $write($message);
    $write('.');
    $readReply(250);

    $write('QUIT');
    fclose($fp);
}
