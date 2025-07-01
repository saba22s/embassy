<?php
/**
 * معالج نموذج الشكاوى مع إرسال Gmail
 */

header('Content-Type: application/json; charset=utf-8');

// التحقق من طريقة الطلب
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'طريقة طلب غير صحيحة'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// إعدادات الإيميل - غيّر هذه المعلومات!
$to_email = "ssaawwdd22@gmail.com";  // إيميلك للاستلام
$smtp_email = "your-gmail@gmail.com";  // إيميل Gmail للإرسال
$smtp_password = "your-app-password";  // كلمة مرور التطبيق

// دالة تنظيف البيانات
function cleanInput($data) {
    return htmlspecialchars(strip_tags(trim($data ?? '')));
}

// استخراج البيانات
$fullName = cleanInput($_POST['fullName'] ?? '');
$email = cleanInput($_POST['email'] ?? '');
$phone = cleanInput($_POST['phone'] ?? '');
$subject = cleanInput($_POST['subject'] ?? '');
$message = cleanInput($_POST['message'] ?? '');

// التحقق من صحة البيانات
$errors = [];

if (empty($fullName)) $errors[] = 'الاسم الكامل مطلوب';
if (empty($email)) $errors[] = 'البريد الإلكتروني مطلوب';
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'بريد إلكتروني غير صحيح';
if (empty($subject)) $errors[] = 'الموضوع مطلوب';
if (empty($message)) $errors[] = 'الرسالة مطلوبة';

if (!empty($errors)) {
    echo json_encode([
        'success' => false,
        'message' => implode(', ', $errors)
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// إنشاء محتوى الإيميل
$emailSubject = "رسالة جديدة من الموقع: " . $subject;
$emailBody = "
=== رسالة جديدة من موقع سفارة فلسطين ===

الاسم: $fullName
الإيميل: $email
الهاتف: " . ($phone ?: 'غير محدد') . "
الموضوع: $subject

الرسالة:
$message

---
تاريخ الإرسال: " . date('Y-m-d H:i:s') . "
عنوان IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'غير معروف') . "
";

// طريقة الإرسال البسيطة (تعمل مع معظم الخوادم المحلية)
function sendSimpleEmail($to, $subject, $body, $from_email, $from_name) {
    $headers = "From: $from_name <$from_email>\r\n";
    $headers .= "Reply-To: $from_email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    return mail($to, $subject, $body, $headers);
}

// محاولة الإرسال
$mailSent = sendSimpleEmail($to_email, $emailSubject, $emailBody, $email, $fullName);

// حفظ نسخة في ملف كـ backup
$backupData = [
    'تاريخ' => date('Y-m-d H:i:s'),
    'الاسم' => $fullName,
    'الإيميل' => $email,
    'الهاتف' => $phone,
    'الموضوع' => $subject,
    'الرسالة' => $message,
    'تم الإرسال' => $mailSent ? 'نعم' : 'لا'
];

$backupText = "=== رسالة جديدة ===\n";
foreach ($backupData as $key => $value) {
    $backupText .= "$key: $value\n";
}
$backupText .= "========================\n\n";

file_put_contents(__DIR__ . '/messages_backup.txt', $backupText, FILE_APPEND | LOCK_EX);

// إرسال الرد
if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'تم إرسال رسالتك بنجاح إلى ' . $to_email . '! شكراً لتواصلك معنا.'
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ في إرسال الإيميل، لكن تم حفظ رسالتك محلياً. يرجى المحاولة مرة أخرى.'
    ], JSON_UNESCAPED_UNICODE);
}
?>