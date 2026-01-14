# 🏌️ Golf Family App

가족 골프 레슨 관리 웹앱

## 🌐 Live Demo

**URL:** https://dylankwak57.github.io/golf-family-app/

## 📱 Features

### 가족 페이지 (Family)
- 🎯 Bay Number 입력 (타석 번호)
- ✅ 레슨 확인 (김프로, Dylan)
- 🌏 다국어 지원 (한국어 / 태국어)

### 관리자 페이지 (Admin)
- 📅 레슨 일정 변경
- ⛳ 레슨 유형 선택 (일반 / 필드)
- 📊 상태 관리 (정상 / 취소 / 변경)

## 🛠 Tech Stack

| 기술 | 용도 |
|------|------|
| HTML5 | 구조 |
| CSS3 | 스타일 (Glassmorphism) |
| JavaScript | 로직 |
| n8n Webhook | 백엔드 |
| Notion | 데이터베이스 |
| GitHub Pages | 호스팅 |

## 📁 File Structure

```
golf-family-app/
├── index.html      # 메인 (언어 선택)
├── family.html     # 가족 페이지
├── admin.html      # 관리자 페이지
├── style.css       # 스타일
├── script.js       # 로직
└── README.md       # 문서
```

## 🔗 n8n Webhooks

| 용도 | Endpoint |
|------|----------|
| Bay 입력 | `/webhook/golf-bay` |
| 확인 완료 | `/webhook/golf-confirm` |
| 타석 전송 | `/webhook/golf-send-bay` |
| 관리자 설정 | `/webhook/golf-admin` |

## 🎨 Design

- **스타일:** Glassmorphism (유리 효과)
- **컬러:** 다크 테마 + 그린 액센트
- **폰트:** Poppins, Noto Sans KR, Noto Sans Thai
- **애니메이션:** 부드러운 전환 효과

## 📋 Workflow

```
월 11:00 → 레슨 페이지 생성
화 17:00 → Aeey 타석 예약 리마인드
화~수    → 타석 입력 (웹앱)
수 14:00 → 확인 요청 (김프로, Dylan)
수~목    → 확인 완료 (웹앱) → 캘린더 등록
목 16:30 → 타석 알림 원클릭
목 17:00 → 레슨! 🏌️
```

## 👨‍👩‍👧‍👦 Family Members

| 이름 | 역할 | 언어 |
|------|------|------|
| Dylan | 관리자, 확인 | 🇰🇷 |
| JAEWOO | - | 🇰🇷 |
| Aeey | 타석 예약 & 입력 | 🇹🇭 |
| JIWOO | - | - |
| 김프로 | 레슨 확인 | 🇰🇷 |

## 📞 Contact

- **K Family** - 가족 골프 동호회

---

© 2026 K Family. All rights reserved.

*"가족의 평생 취미 활동"* 🏌️
