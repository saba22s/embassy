<?php
// تأكد من أن هذا الملف يستقبل طلبات POST فقط
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

// تعيين رأس الاستجابة إلى JSON
header('Content-Type: application/json');

// 1. تنظيف وجمع البيانات من النموذج
// استخدام htmlspecialchars للحماية من XSS عند عرض البيانات في مكان آخر
$fullName = isset($_POST["fullName"]) ? htmlspecialchars(trim($_POST["fullName"]), ENT_QUOTES, 'UTF-8') : '';
$email = isset($_POST["email"]) ? filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL) : '';
$phone = isset($_POST["phone"]) ? htmlspecialchars(trim($_POST["phone"]), ENT_QUOTES, 'UTF-8') : '';
$subject = isset($_POST["subject"]) ? htmlspecialchars(trim($_POST["subject"]), ENT_QUOTES, 'UTF-8') : '';
$message = isset($_POST["message"]) ? htmlspecialchars(trim($_POST["message"]), ENT_QUOTES, 'UTF-8') : '';

// 2. التحقق من صحة البيانات (Server-side Validation)
$errors = [];

if (empty($fullName)) {
    $errors[] = "Full name is required.";
}
if (empty($email)) {
    $errors[] = "Email is required.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Invalid email format.";
}
if (empty($subject)) {
    $errors[] = "Subject is required.";
}
if (empty($message)) {
    $errors[] = "Message is required.";
}

// إذا كانت هناك أخطاء في التحقق، أعد استجابة بالخطأ
if (!empty($errors)) {
    echo json_encode(["success" => false, "message" => implode(" ", $errors)]);
    exit;
}

// 3. إعداد تفاصيل البريد الإلكتروني
$to = "tremb@mfae.gov.ps"; // البريد الإلكتروني المستهدف للشكاوى
$email_subject = "New Website Feedback/Suggestion: " . $subject; // موضوع الإيميل الذي سيصلك
    
// بناء نص رسالة الإيميل
$email_body = "Full Name: " . $fullName . "\n";
$email_body .= "Email: " . $email . "\n";
$email_body .= "Phone: " . (empty($phone) ? "N/A" : $phone) . "\n";
$email_body .= "Subject: " . $subject . "\n\n";
$email_body .= "Message:\n" . $message;

// رؤوس البريد الإلكتروني (Headers)
// هام جداً: 'From' يجب أن يكون بريد إلكتروني صالح على نطاق موقعك لتجنب تصنيف الرسائل كبريد مزعج
// استبدل 'yourdomain.com' بنطاق موقعك الحقيقي
$headers = "From: webmaster@yourdomain.com\r\n"; // <<< MUST BE CHANGED TO YOUR ACTUAL DOMAIN'S EMAIL
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n"; // تأكد من UTF-8 لدعم اللغة العربية

// 4. محاولة إرسال البريد الإلكتروني
// وظيفة mail() في PHP تتطلب إعداد خادم بريد (مثل sendmail أو Postfix) على الخادم
// إذا لم تكن متأكداً من إعداد خادمك، قد تحتاج إلى استخدام مكتبة SMTP مثل PHPMailer
$mail_sent = mail($to, $email_subject, $email_body, $headers);

// 5. إرسال الاستجابة إلى الواجهة الأمامية (JavaScript)
if ($mail_sent) {
    echo json_encode(["success" => true, "message" => "Message sent successfully."]);
} else {
    // تسجيل الخطأ للمراجعة لاحقاً (سيظهر في سجلات أخطاء الخادم)
    error_log("Failed to send email. To: $to, Subject: $email_subject, From: " . $headers . " Error details could be in mail server logs.");
    echo json_encode(["success" => false, "message" => "Failed to send message. Please try again later."]);
}
?>