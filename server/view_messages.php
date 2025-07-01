<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>عارض الرسائل - لوحة الإدارة</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0c0c0f;
            color: #e8eaed;
            margin: 0;
            padding: 20px;
            direction: rtl;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #c4ac6e, #dcb87e);
            color: #0c0c0f;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 20px;
        }
        .message-card {
            background-color: #121418;
            border: 1px solid rgba(196, 172, 110, 0.2);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(196, 172, 110, 0.2);
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .message-subject {
            color: #c4ac6e;
            font-size: 1.2em;
            font-weight: bold;
        }
        .message-date {
            color: #b0b8c4;
            font-size: 0.9em;
        }
        .message-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
        }
        .info-item {
            background-color: rgba(196, 172, 110, 0.1);
            padding: 8px 12px;
            border-radius: 5px;
        }
        .info-label {
            font-weight: bold;
            color: #c4ac6e;
        }
        .message-body {
            background-color: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 5px;
            border-right: 4px solid #c4ac6e;
            white-space: pre-wrap;
            line-height: 1.6;
        }
        .no-messages {
            text-align: center;
            color: #b0b8c4;
            font-style: italic;
            padding: 40px;
        }
        .refresh-btn {
            background-color: #c4ac6e;
            color: #0c0c0f;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .refresh-btn:hover {
            background-color: #dcb87e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 عارض رسائل الشكاوى والاقتراحات</h1>
            <p>سفارة دولة فلسطين في تركيا</p>
        </div>
        
        <button class="refresh-btn" onclick="location.reload()">🔄 تحديث الصفحة</button>
        
        <?php
        $messagesFile = __DIR__ . '/messages_backup.txt';
        
        if (!file_exists($messagesFile)) {
            echo '<div class="no-messages">📝 لا توجد رسائل بعد. جرب إرسال رسالة من نموذج الشكاوى أولاً.</div>';
        } else {
            $content = file_get_contents($messagesFile);
            $messages = explode('========================', $content);
            $messages = array_filter($messages, 'trim');
            
            if (empty($messages)) {
                echo '<div class="no-messages">📝 لا توجد رسائل بعد.</div>';
            } else {
                echo '<div style="margin-bottom: 20px; color: #c4ac6e;">📊 إجمالي الرسائل: ' . count($messages) . '</div>';
                
                foreach (array_reverse($messages) as $index => $messageBlock) {
                    $lines = explode("\n", trim($messageBlock));
                    $messageData = [];
                    
                    foreach ($lines as $line) {
                        if (strpos($line, ':') !== false) {
                            list($key, $value) = explode(':', $line, 2);
                            $messageData[trim($key)] = trim($value);
                        }
                    }
                    
                    if (!empty($messageData)) {
                        echo '<div class="message-card">';
                        echo '<div class="message-header">';
                        echo '<div class="message-subject">' . ($messageData['الموضوع'] ?? 'بدون موضوع') . '</div>';
                        echo '<div class="message-date">' . ($messageData['تاريخ'] ?? 'غير محدد') . '</div>';
                        echo '</div>';
                        
                        echo '<div class="message-info">';
                        echo '<div class="info-item"><span class="info-label">الاسم:</span> ' . ($messageData['الاسم'] ?? 'غير محدد') . '</div>';
                        echo '<div class="info-item"><span class="info-label">الإيميل:</span> ' . ($messageData['الإيميل'] ?? 'غير محدد') . '</div>';
                        echo '<div class="info-item"><span class="info-label">الهاتف:</span> ' . ($messageData['الهاتف'] ?? 'غير محدد') . '</div>';
                        echo '<div class="info-item"><span class="info-label">حالة الإرسال:</span> ' . ($messageData['تم الإرسال'] ?? 'غير معروف') . '</div>';
                        echo '</div>';
                        
                        if (!empty($messageData['الرسالة'])) {
                            echo '<div class="message-body">' . htmlspecialchars($messageData['الرسالة']) . '</div>';
                        }
                        
                        echo '</div>';
                    }
                }
            }
        }
        ?>
        
        <div style="text-align: center; margin-top: 40px; color: #b0b8c4; font-size: 0.9em;">
            💡 هذه لوحة إدارة بسيطة لمشاهدة الرسائل المرسلة من نموذج الشكاوى
        </div>
    </div>
</body>
</html>