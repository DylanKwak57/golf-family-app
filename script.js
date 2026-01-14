/* ========================================
   Golf Family App - JavaScript
   ======================================== */

// ========================================
// Configuration
// ========================================

const CONFIG = {
    // n8n Webhook URLs (TODO: 실제 URL로 변경)
    webhooks: {
        bayNumber: 'https://dylan-automation.app.n8n.cloud/webhook/golf-bay',
        confirm: 'https://dylan-automation.app.n8n.cloud/webhook/golf-confirm',
        sendBay: 'https://dylan-automation.app.n8n.cloud/webhook/golf-send-bay',
        admin: 'https://dylan-automation.app.n8n.cloud/webhook/golf-admin'
    },
    // Notion Database ID
    notionDbId: '0c5ee4b0-26ab-4f0a-9881-5453b072a0cb'
};

// ========================================
// Translations (i18n)
// ========================================

const translations = {
    ko: {
        title: 'Golf Family',
        bay_title: 'Bay Number',
        bay_desc: '타석 번호를 입력하세요 (예: 62-65)',
        bay_submit: '📤 등록',
        current_bay: '현재 등록:',
        confirm_title: '레슨 확인',
        confirm_submit: '✅ 확인 완료',
        status_normal: '✅ 정상',
        status_cancelled: '❌ 취소',
        status_changed: '🔄 변경',
        toast_bay_success: '타석 번호가 등록되었습니다!',
        toast_confirm_success: '확인이 완료되었습니다!',
        toast_error: '오류가 발생했습니다. 다시 시도해주세요.',
        toast_saved: '저장되었습니다!'
    },
    th: {
        title: 'Golf Family',
        bay_title: 'หมายเลข Bay',
        bay_desc: 'กรอกหมายเลข Bay (เช่น 62-65)',
        bay_submit: '📤 ลงทะเบียน',
        current_bay: 'ลงทะเบียนแล้ว:',
        confirm_title: 'ยืนยันเรียน',
        confirm_submit: '✅ ยืนยัน',
        status_normal: '✅ ปกติ',
        status_cancelled: '❌ ยกเลิก',
        status_changed: '🔄 เปลี่ยนแปลง',
        toast_bay_success: 'ลงทะเบียนหมายเลข Bay แล้ว!',
        toast_confirm_success: 'ยืนยันเรียบร้อยแล้ว!',
        toast_error: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
        toast_saved: 'บันทึกแล้ว!'
    }
};

let currentLang = 'ko';

// ========================================
// Language Functions
// ========================================

function initLanguage() {
    // Get language from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    
    if (lang && translations[lang]) {
        currentLang = lang;
    }
    
    // Update language toggle display
    const langToggle = document.getElementById('currentLang');
    if (langToggle) {
        langToggle.textContent = currentLang === 'ko' ? '🇰🇷' : '🇹🇭';
    }
    
    // Apply translations
    applyTranslations();
}

function toggleLanguage() {
    currentLang = currentLang === 'ko' ? 'th' : 'ko';
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('lang', currentLang);
    window.history.replaceState({}, '', url);
    
    // Update display
    const langToggle = document.getElementById('currentLang');
    if (langToggle) {
        langToggle.textContent = currentLang === 'ko' ? '🇰🇷' : '🇹🇭';
    }
    
    applyTranslations();
}

function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
}

function t(key) {
    return translations[currentLang][key] || key;
}

// ========================================
// Lesson Data Functions
// ========================================

function loadLessonData() {
    // TODO: Notion API에서 실제 데이터 로드
    // 지금은 더미 데이터 사용
    
    const lessonData = {
        number: '107',
        date: '목요일 (2026-01-16)',
        dateTh: 'วันพฤหัสบดี (16/01/2026)',
        location: '포탈라이',
        locationTh: 'โปรทาลัย',
        status: 'normal',
        bayNumber: '',
        kimProConfirm: false,
        dylanConfirm: false
    };
    
    // Update UI
    const lessonNumber = document.getElementById('lessonNumber');
    if (lessonNumber) {
        lessonNumber.textContent = lessonData.number + '회차';
    }
    
    const lessonDate = document.getElementById('lessonDate');
    if (lessonDate) {
        lessonDate.textContent = currentLang === 'ko' ? lessonData.date : lessonData.dateTh;
    }
    
    const lessonLocation = document.getElementById('lessonLocation');
    if (lessonLocation) {
        lessonLocation.textContent = currentLang === 'ko' ? lessonData.location : lessonData.locationTh;
    }
    
    // Update status
    updateStatusDisplay(lessonData.status);
    
    // Update bay number
    if (lessonData.bayNumber) {
        showCurrentBay(lessonData.bayNumber);
    }
    
    // Update checkboxes
    const kimProCheck = document.getElementById('confirmKimPro');
    const dylanCheck = document.getElementById('confirmDylan');
    
    if (kimProCheck) kimProCheck.checked = lessonData.kimProConfirm;
    if (dylanCheck) dylanCheck.checked = lessonData.dylanConfirm;
    
    updateConfirmation();
}

function updateStatusDisplay(status) {
    const statusEl = document.getElementById('lessonStatus');
    if (!statusEl) return;
    
    statusEl.className = 'lesson-status';
    
    switch (status) {
        case 'normal':
            statusEl.classList.add('status-normal');
            statusEl.textContent = t('status_normal');
            break;
        case 'cancelled':
            statusEl.classList.add('status-cancelled');
            statusEl.textContent = t('status_cancelled');
            break;
        case 'changed':
            statusEl.classList.add('status-changed');
            statusEl.textContent = t('status_changed');
            break;
    }
}

// ========================================
// Bay Number Functions
// ========================================

function submitBayNumber() {
    const input = document.getElementById('bayNumber');
    const value = input.value.trim();
    
    if (!value) {
        showToast(t('toast_error'), 'error');
        return;
    }
    
    // Validate format (e.g., 62-65 or 62,63,64,65)
    const isValid = /^[\d\-,\s]+$/.test(value);
    if (!isValid) {
        showToast(t('toast_error'), 'error');
        return;
    }
    
    // Send to n8n webhook
    sendToWebhook(CONFIG.webhooks.bayNumber, {
        bayNumber: value,
        timestamp: new Date().toISOString()
    })
    .then(() => {
        showToast(t('toast_bay_success'), 'success');
        showCurrentBay(value);
        input.value = '';
    })
    .catch(() => {
        showToast(t('toast_error'), 'error');
    });
}

function showCurrentBay(value) {
    const container = document.getElementById('currentBay');
    const valueEl = document.getElementById('currentBayValue');
    
    if (container && valueEl) {
        valueEl.textContent = value;
        container.style.display = 'block';
    }
}

// ========================================
// Confirmation Functions
// ========================================

function updateConfirmation() {
    const kimProCheck = document.getElementById('confirmKimPro');
    const dylanCheck = document.getElementById('confirmDylan');
    const confirmBtn = document.getElementById('confirmBtn');
    
    if (kimProCheck && dylanCheck && confirmBtn) {
        const bothChecked = kimProCheck.checked && dylanCheck.checked;
        confirmBtn.disabled = !bothChecked;
    }
}

function submitConfirmation() {
    const kimProCheck = document.getElementById('confirmKimPro');
    const dylanCheck = document.getElementById('confirmDylan');
    
    if (!kimProCheck.checked || !dylanCheck.checked) {
        showToast(t('toast_error'), 'error');
        return;
    }
    
    // Send to n8n webhook
    sendToWebhook(CONFIG.webhooks.confirm, {
        kimProConfirm: kimProCheck.checked,
        dylanConfirm: dylanCheck.checked,
        timestamp: new Date().toISOString()
    })
    .then(() => {
        showToast(t('toast_confirm_success'), 'success');
    })
    .catch(() => {
        showToast(t('toast_error'), 'error');
    });
}

// ========================================
// Admin Functions
// ========================================

function loadAdminData() {
    // TODO: Notion API에서 실제 데이터 로드
    // 지금은 기본값 사용
}

function saveAdminSettings() {
    const lessonType = document.querySelector('input[name="lessonType"]:checked')?.value;
    const lessonStatus = document.querySelector('input[name="lessonStatus"]:checked')?.value;
    const lessonDay = document.getElementById('lessonDay')?.value;
    const lessonTime = document.getElementById('lessonTime')?.value;
    const lessonLocation = document.getElementById('lessonLocation')?.value;
    
    const settings = {
        lessonType,
        lessonStatus,
        lessonDay,
        lessonTime,
        lessonLocation,
        timestamp: new Date().toISOString()
    };
    
    // Send to n8n webhook
    sendToWebhook(CONFIG.webhooks.admin, settings)
    .then(() => {
        showToast(t('toast_saved'), 'success');
    })
    .catch(() => {
        showToast(t('toast_error'), 'error');
    });
}

// ========================================
// Webhook Functions
// ========================================

async function sendToWebhook(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Webhook request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Webhook error:', error);
        throw error;
    }
}

// ========================================
// Toast Notification
// ========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('.toast-icon');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    
    // Update icon and color based on type
    if (type === 'success') {
        toastIcon.textContent = '✅';
        toast.style.background = 'rgba(16, 185, 129, 0.95)';
    } else if (type === 'error') {
        toastIcon.textContent = '❌';
        toast.style.background = 'rgba(239, 68, 68, 0.95)';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// Utility Functions
// ========================================

function formatDate(date, lang = 'ko') {
    const days = {
        ko: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
        th: ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์']
    };
    
    const d = new Date(date);
    const dayName = days[lang][d.getDay()];
    
    if (lang === 'ko') {
        return `${dayName} (${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')})`;
    } else {
        return `${dayName} (${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()})`;
    }
}

// ========================================
// URL Parameter Handlers
// ========================================

function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Check for success page redirect
if (window.location.pathname.includes('success')) {
    // Success page logic
    document.body.classList.add('success-page');
}

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Add smooth entrance animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
