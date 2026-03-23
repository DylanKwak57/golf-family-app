/* ========================================
   Golf Family App - JavaScript
   ======================================== */

// ========================================
// Configuration
// ========================================

const CONFIG = {
    // n8n Webhook URLs
    webhooks: {
        getLesson: 'https://dylan-automation.app.n8n.cloud/webhook/golf-get-lesson',
        bayNumber: 'https://dylan-automation.app.n8n.cloud/webhook/golf-bay',
        confirm: 'https://dylan-automation.app.n8n.cloud/webhook/golf-confirm',
        sendBay: 'https://dylan-automation.app.n8n.cloud/webhook/golf-send-bay',
        admin: 'https://dylan-automation.app.n8n.cloud/webhook/golf-admin'
    },
    // Notion Database ID
    notionDbId: '0c5ee4b0-26ab-4f0a-9881-5453b072a0cb'
};

// 현재 레슨 데이터 저장
let currentLessonData = null;

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
        toast_saved: '저장되었습니다!',
        send_title: '김프로에게 전송',
        send_desc: '타석 번호를 김프로에게 전송합니다',
        current_bay_label: '현재 타석:',
        send_btn: '김프로에게 전송',
        toast_send_success: '김프로에게 전송되었습니다!',
        toast_no_bay: '타석 번호가 없습니다. 먼저 등록해주세요.'
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
        toast_saved: 'บันทึกแล้ว!',
        send_title: 'ส่งถึง Pro Kim',
        send_desc: 'ส่งหมายเลข Bay ถึง Pro Kim',
        current_bay_label: 'Bay ปัจจุบัน:',
        send_btn: 'ส่งถึง Pro Kim',
        toast_send_success: 'ส่งถึง Pro Kim แล้ว!',
        toast_no_bay: 'ไม่มีหมายเลข Bay กรุณาลงทะเบียนก่อน'
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
    
    // 회차 표시 업데이트 (언어 토글 시)
    updateLessonNumberDisplay();
}

function updateLessonNumberDisplay() {
    const lessonNumber = document.getElementById('lessonNumber');
    if (lessonNumber) {
        // 현재 표시된 숫자 추출
        const currentText = lessonNumber.textContent;
        const number = currentText.replace(/[^0-9]/g, '');
        
        if (number) {
            if (currentLang === 'ko') {
                lessonNumber.textContent = number + '회차';
            } else {
                lessonNumber.textContent = 'บทที่ ' + number;
            }
        }
    }
}

function t(key) {
    return translations[currentLang][key] || key;
}

// ========================================
// Lesson Data Functions
// ========================================

async function loadLessonData() {
    try {
        // n8n 웹훅에서 실제 노션 데이터 로드
        const response = await fetch(CONFIG.webhooks.getLesson);
        
        if (!response.ok) {
            throw new Error('Failed to fetch lesson data');
        }
        
        const data = await response.json();
        currentLessonData = data;
        
        // Update UI with real data
        updateUIWithLessonData(data);
        
    } catch (error) {
        console.error('Error loading lesson data:', error);
        // 에러 시 더미 데이터로 폴백
        const fallbackData = {
            pageId: null,
            number: 107,
            date: '2026-01-16',
            formattedDate: { ko: '2026-01-16', th: '16/01/2026' },
            dayOfWeek: { ko: '목요일', th: 'วันพฤหัสบดี' },
            location: { ko: '포탈라이', th: 'โปรทาลัย' },
            status: '정상',
            bayNumber: '',
            kimProConfirm: false,
            dylanConfirm: false
        };
        currentLessonData = fallbackData;
        updateUIWithLessonData(fallbackData);
    }
}

function updateUIWithLessonData(data) {
    // 회차 표시
    const lessonNumber = document.getElementById('lessonNumber');
    if (lessonNumber) {
        if (currentLang === 'ko') {
            lessonNumber.textContent = data.number + '회차';
        } else {
            lessonNumber.textContent = 'บทที่ ' + data.number;
        }
    }
    
    // 날짜 표시
    const lessonDate = document.getElementById('lessonDate');
    if (lessonDate) {
        const dayOfWeek = currentLang === 'ko' ? data.dayOfWeek.ko : data.dayOfWeek.th;
        const formattedDate = currentLang === 'ko' ? data.formattedDate.ko : data.formattedDate.th;
        lessonDate.textContent = `${dayOfWeek} (${formattedDate})`;
    }
    
    // 장소 표시
    const lessonLocation = document.getElementById('lessonLocation');
    if (lessonLocation) {
        lessonLocation.textContent = currentLang === 'ko' ? data.location.ko : data.location.th;
    }
    
    // 상태 표시
    const statusMap = {
        '정상': 'normal',
        '취소': 'cancelled',
        '변경': 'changed'
    };
    updateStatusDisplay(statusMap[data.status] || 'normal');
    
    // 타석 번호 표시
    if (data.bayNumber) {
        showCurrentBay(data.bayNumber);
        currentBayNumber = data.bayNumber;
    }
    
    // 김프로 전송 섹션 타석 표시
    const displayBayNumber = document.getElementById('displayBayNumber');
    if (displayBayNumber) {
        displayBayNumber.textContent = data.bayNumber || '-';
    }
    
    // 체크박스 상태 업데이트
    const kimProCheck = document.getElementById('confirmKimPro');
    const dylanCheck = document.getElementById('confirmDylan');
    
    if (kimProCheck) kimProCheck.checked = data.kimProConfirm;
    if (dylanCheck) dylanCheck.checked = data.dylanConfirm;
    
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
    
    // Send to n8n webhook with pageId
    sendToWebhook(CONFIG.webhooks.bayNumber, {
        pageId: currentLessonData?.pageId || null,
        bayNumber: value,
        timestamp: new Date().toISOString()
    })
    .then(() => {
        showToast(t('toast_bay_success'), 'success');
        showCurrentBay(value);
        currentBayNumber = value;
        if (currentLessonData) {
            currentLessonData.bayNumber = value;
        }
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
    
    // 김프로 전송 섹션의 타석 번호도 업데이트
    const displayBayNumber = document.getElementById('displayBayNumber');
    if (displayBayNumber) {
        displayBayNumber.textContent = value || '-';
    }
}

// ========================================
// Send to Pro Kim Functions
// ========================================

let currentBayNumber = '';

function sendToProKim() {
    // 현재 타석 번호 가져오기
    const bayInput = document.getElementById('bayNumber');
    const displayBay = document.getElementById('displayBayNumber');
    
    // 입력 필드에 값이 있으면 그걸 사용, 아니면 표시된 값 사용
    const bayNumber = bayInput?.value?.trim() || displayBay?.textContent || currentBayNumber;
    
    if (!bayNumber || bayNumber === '-') {
        showToast(t('toast_no_bay'), 'error');
        return;
    }
    
    // Send to n8n webhook with pageId and location
    sendToWebhook(CONFIG.webhooks.sendBay, {
        pageId: currentLessonData?.pageId || null,
        bayNumber: bayNumber,
        location: currentLessonData?.location?.ko || '포탈라이',
        timestamp: new Date().toISOString()
    })
    .then(() => {
        showToast(t('toast_send_success'), 'success');
    })
    .catch(() => {
        showToast(t('toast_error'), 'error');
    });
}

// ========================================
// Confirmation Functions
// ========================================

function updateConfirmation() {
    const kimProCheck = document.getElementById('confirmKimPro');
    const dylanCheck = document.getElementById('confirmDylan');
    const confirmBtn = document.getElementById('confirmBtn');
    
    if (!confirmBtn) return;
    
    // 페이지별로 다른 조건 적용
    const path = window.location.pathname;
    
    if (path.includes('kimpro.html')) {
        // 김프로 페이지: 김프로 체크박스만 체크하면 활성화
        confirmBtn.disabled = !kimProCheck?.checked;
    } else if (path.includes('dylan.html')) {
        // Dylan 페이지: Dylan 체크박스만 체크하면 활성화
        confirmBtn.disabled = !dylanCheck?.checked;
    } else {
        // 기타 페이지: 둘 다 체크해야 활성화
        const bothChecked = (kimProCheck?.checked || false) && (dylanCheck?.checked || false);
        confirmBtn.disabled = !bothChecked;
    }
}

// 체크박스 클릭 시 UI만 업데이트 (노션 저장 X)
function onConfirmCheckboxChange(field) {
    // UI 상태만 업데이트
    updateConfirmation();
}

// 확인 완료 버튼 클릭 시 노션에 저장
async function submitConfirmation() {
    if (!currentLessonData || !currentLessonData.pageId) {
        console.error('No lesson data available');
        showToast(t('toast_error'), 'error');
        return;
    }

    const path = window.location.pathname;
    const btn = document.getElementById('confirmBtn');

    // 즉시 비활성화 (중복 클릭 방지)
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ 처리중...';
    }

    try {
        if (path.includes('kimpro.html')) {
            await sendToWebhook(CONFIG.webhooks.confirm, {
                pageId: currentLessonData.pageId,
                field: 'kimPro',
                value: true,
                timestamp: new Date().toISOString()
            });
            currentLessonData.kimProConfirm = true;

        } else if (path.includes('dylan.html')) {
            await sendToWebhook(CONFIG.webhooks.confirm, {
                pageId: currentLessonData.pageId,
                field: 'dylan',
                value: true,
                timestamp: new Date().toISOString()
            });
            currentLessonData.dylanConfirm = true;

        } else {
            await sendToWebhook(CONFIG.webhooks.confirm, {
                pageId: currentLessonData.pageId,
                field: 'kimPro',
                value: true,
                timestamp: new Date().toISOString()
            });
            await sendToWebhook(CONFIG.webhooks.confirm, {
                pageId: currentLessonData.pageId,
                field: 'dylan',
                value: true,
                timestamp: new Date().toISOString()
            });
            currentLessonData.kimProConfirm = true;
            currentLessonData.dylanConfirm = true;
        }

        showToast(t('toast_confirm_success'), 'success');
        if (btn) btn.textContent = '✅ 확인 완료됨';

        // 데이터 새로고침
        loadLessonData();

    } catch (error) {
        console.error('Confirm update error:', error);
        showToast(t('toast_error'), 'error');
        // 에러 시 다시 활성화
        if (btn) {
            btn.disabled = false;
            btn.textContent = t('confirm_submit');
        }
    }
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
        toast.style.background = 'linear-gradient(135deg, #4A7C5F, #3D5A4C)';
        toast.style.color = '#ffffff';
    } else if (type === 'error') {
        toastIcon.textContent = '❌';
        toast.style.background = 'linear-gradient(135deg, #8b4049, #6a2f36)';
        toast.style.color = '#ffffff';
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
    
    // 언어 초기화
    initLanguage();
    
    // 페이지별 초기화
    const path = window.location.pathname;
    
    if (path.includes('family.html') || path.includes('dylan.html') || path.includes('aeey.html') || path.includes('kimpro.html')) {
        // Family 페이지: 레슨 데이터 로드
        loadLessonData();
        
        // 체크박스 이벤트 리스너 연결
        const kimProCheck = document.getElementById('confirmKimPro');
        const dylanCheck = document.getElementById('confirmDylan');
        
        if (kimProCheck) {
            kimProCheck.addEventListener('change', () => onConfirmCheckboxChange('kimPro'));
        }
        if (dylanCheck) {
            dylanCheck.addEventListener('change', () => onConfirmCheckboxChange('dylan'));
        }
    } else if (path.includes('admin.html')) {
        // Admin 페이지: 관리자 데이터 로드
        loadAdminData();
    }
});
