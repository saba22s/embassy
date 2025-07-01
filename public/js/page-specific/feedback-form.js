/**
 * نموذج الشكاوى والاقتراحات - الحل البسيط
 * يحول النموذج العادي إلى إرسال إيميل مباشر
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 تم تحميل نموذج الشكاوى');
    
    const form = document.getElementById('contactForm');
    const submitButton = document.getElementById('feedback-submit-button');
    const statusMessage = document.getElementById('formStatusMessage');
    
    if (!form) {
        console.error('❌ لم يتم العثور على النموذج');
        return;
    }
    
    // إضافة مستمع للنموذج
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('📤 تم إرسال النموذج');
        
        // التحقق من صحة البيانات
        if (!validateForm()) {
            showMessage('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
            return;
        }
        
        // تعطيل الزر أثناء الإرسال
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        
        // إنشاء الإيميل وإرساله
        setTimeout(() => {
            sendEmailDirectly();
        }, 1000);
    });
    
    // إضافة placeholders للحقول
    document.getElementById('fullName').placeholder = 'أدخل اسمك الكامل';
    document.getElementById('email').placeholder = 'example@email.com';
    document.getElementById('phone').placeholder = '+90 XXX XXX XX XX';
    document.getElementById('subject').placeholder = 'عنوان موجز للموضوع';
    document.getElementById('message').placeholder = 'اكتب رسالتك هنا بالتفصيل...';
    
    // إضافة رسائل خطأ فورية
    addRealTimeValidation();
    
    console.log('✅ تم تهيئة نموذج الشكاوى بنجاح');
});

// دالة التحقق من صحة النموذج
function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    let isValid = true;
    
    // التحقق من الاسم
    if (!fullName || fullName.length < 2) {
        showFieldError('fullName', 'يرجى إدخال اسم صحيح (حرفين على الأقل)');
        isValid = false;
    } else {
        clearFieldError('fullName');
    }
    
    // التحقق من الإيميل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showFieldError('email', 'البريد الإلكتروني مطلوب');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showFieldError('email', 'يرجى إدخال بريد إلكتروني صحيح');
        isValid = false;
    } else {
        clearFieldError('email');
    }
    
    // التحقق من الهاتف (اختياري)
    if (phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phone)) {
            showFieldError('phone', 'يرجى إدخال رقم هاتف صحيح');
            isValid = false;
        } else {
            clearFieldError('phone');
        }
    }
    
    // التحقق من الموضوع
    if (!subject || subject.length < 3) {
        showFieldError('subject', 'يرجى إدخال موضوع (3 أحرف على الأقل)');
        isValid = false;
    } else {
        clearFieldError('subject');
    }
    
    // التحقق من الرسالة
    if (!message || message.length < 10) {
        showFieldError('message', 'يرجى كتابة رسالة (10 أحرف على الأقل)');
        isValid = false;
    } else {
        clearFieldError('message');
    }
    
    return isValid;
}

// دالة إرسال الإيميل مباشرة
function sendEmailDirectly() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // إنشاء محتوى الإيميل
    const emailSubject = `اقتراح/شكوى من الموقع: ${subject}`;
    const emailBody = `
=== رسالة جديدة من موقع سفارة دولة فلسطين ===

الاسم الكامل: ${fullName}
البريد الإلكتروني: ${email}
رقم الهاتف: ${phone || 'غير محدد'}
الموضوع: ${subject}

الرسالة:
${message}

---
تم الإرسال من: موقع سفارة دولة فلسطين الرسمي
التاريخ: ${new Date().toLocaleString('ar-EG')}
    `.trim();
    
    // إنشاء رابط mailto
    const mailtoLink = `mailto:ssaawwdd@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    try {
        // فتح برنامج الإيميل
        window.location.href = mailtoLink;
        
        // عرض رسالة نجاح
        showMessage('تم فتح برنامج الإيميل! يرجى الضغط على "إرسال" لإتمام العملية.', 'success');
        
        // مسح النموذج بعد 3 ثوان
        setTimeout(() => {
            if (confirm('هل تم إرسال الرسالة بنجاح؟ (سيتم مسح النموذج)')) {
                clearForm();
                showMessage('شكراً لك! تم استلام تأكيد الإرسال.', 'success');
            }
        }, 3000);
        
    } catch (error) {
        console.error('❌ خطأ في فتح برنامج الإيميل:', error);
        showMessage('لم نتمكن من فتح برنامج الإيميل تلقائياً. يرجى نسخ البيانات والتواصل مباشرة عبر ssaawwdd@gmail.com', 'error');
    } finally {
        // إعادة تفعيل الزر
        resetSubmitButton();
    }
}

// دالة عرض أخطاء الحقول
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}-error`);
    
    if (field && errorDiv) {
        field.style.borderColor = '#ff6b6b';
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.color = '#ff6b6b';
    }
}

// دالة مسح أخطاء الحقول
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}-error`);
    
    if (field && errorDiv) {
        field.style.borderColor = 'var(--feedback-border-color)';
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
}

// دالة عرض الرسائل
function showMessage(message, type) {
    const statusMessage = document.getElementById('formStatusMessage');
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `feedback-message-status ${type}`;
        statusMessage.style.display = 'block';
        
        // إخفاء الرسالة بعد 7 ثوان
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 7000);
    }
}

// دالة مسح النموذج
function clearForm() {
    document.getElementById('contactForm').reset();
    
    // مسح جميع رسائل الخطأ
    ['fullName', 'email', 'phone', 'subject', 'message'].forEach(fieldId => {
        clearFieldError(fieldId);
    });
}

// دالة إعادة تعيين زر الإرسال
function resetSubmitButton() {
    const submitButton = document.getElementById('feedback-submit-button');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الرسالة';
    }
}

// إضافة التحقق الفوري
function addRealTimeValidation() {
    const fields = ['fullName', 'email', 'phone', 'subject', 'message'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // التحقق عند ترك الحقل
            field.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    showFieldError(fieldId, 'هذا الحقل مطلوب');
                } else if (fieldId === 'email' && this.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(this.value.trim())) {
                        showFieldError(fieldId, 'بريد إلكتروني غير صحيح');
                    }
                }
            });
            
            // مسح الخطأ عند البدء في الكتابة
            field.addEventListener('input', function() {
                clearFieldError(fieldId);
            });
        }
    });
}

// إضافة دالة لنسخ البيانات في حالة فشل فتح الإيميل
function copyToClipboard() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    const textToCopy = `
الاسم: ${fullName}
الإيميل: ${email}
الهاتف: ${phone || 'غير محدد'}
الموضوع: ${subject}
الرسالة: ${message}
    `.trim();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        showMessage('تم نسخ البيانات! يمكنك لصقها في إيميل جديد إلى ssaawwdd@gmail.com', 'success');
    }).catch(() => {
        showMessage('لم نتمكن من نسخ البيانات تلقائياً. يرجى نسخها يدوياً.', 'error');
    });
}

// تصدير للاستخدام العالمي
window.FeedbackForm = {
    validateForm,
    sendEmailDirectly,
    clearForm,
    copyToClipboard
};