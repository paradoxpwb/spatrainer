# SPA Speaking Trainer

현대자동차그룹 비공식 영어 말하기 시험(SPA - Speaking Proficiency Assessment) 실전 대비 자가 훈련 웹 애플리케이션입니다.

> **안내**: 본 서비스는 현대자동차그룹의 공식 SPA 시험 서비스가 아니며, 응시자가 비즈니스 및 일상 영어 말하기를 자가 연습할 수 있도록 돕는 비공식 훈련 도구입니다.

---

## 1. 프로젝트 개요 & 핵심 가치

- **핵심 가치**: 질문을 받고, 제한시간 안에 영어로 답하고, 자신의 녹음을 다시 들어보며 객관적 지표와 1:1 맞춤형 AI 코칭, 전후 비교 및 성장 대시보드로 반복 연습합니다.
- **원칙 & 경계**:
  1. **비공식성 엄수**: 공식 SPA 등급(Level 1~8), 총점, 합격/불합격 예측을 일체 생성하지 않습니다.
  2. **음향 평가 제외**: 오디오의 음향 특성(발음, 억양, 성량 등)은 추정하여 평가하지 않으며, 한계 고지를 항상 명시합니다.
  3. **사용자 경험 보존**: 사용자의 실제 답변 내용을 기반으로 구조와 영어 표현을 교정합니다.
  4. **온디맨드 호출**: AI 코칭은 사용자가 명시적으로 버튼을 누른 경우에만 호출되며, Dashboard 진입 시에는 AI API를 호출하지 않습니다.

---

## 2. Sprint 4-1 & Sprint 4-2 개요

- **Sprint 4-1 (세션 연결 & 전후 비교)**:
  - `PracticeSession` 단위로 동일 질문에 대한 여러 번의 답변(`PracticeAttempt`)을 구조적으로 연결.
  - Initial Attempt와 Retry Attempt 간의 객관적 지표 변화, 순수 TypeScript 기반 어휘/문장 변화 분석, 재도전 체크리스트 이행 여부 평가, 로컬 규칙 기반 종합 비교 요약.
- **Sprint 4-2 (성장 대시보드 & 활동 분석)**:
  - 기간 필터(최근 7일, 최근 30일, 전체) 기반 **Progress Dashboard**.
  - 순수 SVG 기반 **시계열 추세 차트(Trend Chart)** (접근성 대체 텍스트 목록 포함).
  - 8개 영역별 **카테고리 분석** 및 미연습 영역 식별.
  - 브라우저 로컬 날짜 기준 **연속 연습일(Streak)** 및 28일 활동 캘린더.
  - 개인별 **주간 목표(Weekly Goals)** 설정 및 실시간 진행률.
  - 규칙 기반 **맞춤형 연습 추천(Recommendation Engine)** (최대 3개).
  - 검색·필터·정렬을 지원하는 **History 세션 목록** 및 **세션 상세 타임라인**.
  - 과거 세션에서 **Retry 이어서 하기 vs 새 세션 시작하기** 선택 기능.
  - **개별 세션 영구 삭제** 및 확인 단어("초기화") 입력 기반 **전체 데이터 초기화**.
  - 오디오 및 API 키를 제외한 안전한 **JSON 백업 파일 내보내기**.

---

## 3. 데이터 아키텍처 & 관계

### PracticeSession과 PracticeAttempt의 관계
- **PracticeSession**: 하나의 질문에 대한 전체 연습 단위
  - `id`: 고유 세션 식별자 (`session-...`)
  - `questionId`: 질문 식별자
  - `category`: 문제 카테고리
  - `attemptIds`: 해당 세션에 속한 답변 시도 ID 목록
  - `originalAttemptId`: 최초 시도 ID
  - `latestAttemptId`: 최신 시도 ID
  - `status`: `'in-progress' | 'completed' | 'abandoned'`
- **PracticeAttempt**: 세션 내에서 녹음된 개별 답변 시도
  - `sessionId`: 소속 세션 ID
  - `attemptNumber`: 시도 번호 (1: 첫 답변, 2+: 재도전 답변)
  - `parentAttemptId`: 직전 시도 ID
  - `retrySource`: `'direct' | 'history' | 'coaching_mode_a' | 'coaching_mode_b'`
  - `metrics`: SpeakingMetrics (발화 시간, 단어 수, WPM, Filler 비율 등)
  - `aiCoaching`: 선택적으로 생성된 AI 코칭 결과

---

## 4. 기능별 상세 사양

### A. Progress Dashboard & 핵심 지표 계산
- **기간 필터**: 최근 7일(`7d`), 최근 30일(`30d`), 전체(`all`)
  - 사용자 로컬 타임존 날짜 기준 필터링
  - 잘못된 날짜(`NaN`) 및 미래 날짜 자동 제외
- **8대 핵심 지표**:
  1. 총 답변 수 (`totalAttempts`)
  2. 완료한 세션 수 (`completedSessions`): 유효 시도가 있고 'abandoned'가 아닌 고유 세션
  3. Retry 횟수 (`retryCount`): `attemptNumber >= 2` 또는 `parentAttemptId` 존재
  4. 연습한 날짜 수 (`practiceDays`): 로컬 날짜 기준 유효 시도가 있는 날의 수
  5. 총 발화 시간 (`totalRecordingSeconds`): 0초 및 음수 녹음 제외
  6. 평균 답변 시간: 유효 녹음 건수 기준 평균 (표본 없을 시 "데이터 없음" 표시)
  7. 평균 WPM: 유효한 양수 WPM 표본 기준 평균 (표본 없을 시 "데이터 없음" 표시)
  8. 평균 Filler 비율: 유효 발화 기준 평균 (표본 없을 시 "데이터 없음" 표시)

### B. 시계열 추세 차트 (Trend Chart)
- 외부 무거운 라이브러리 없이 접근 가능한 순수 SVG로 구현
- 속도(WPM), 발화 시간, Filler 비율, 단어 수 4개 지표 전환 지원
- 데이터 포인트가 1개인 경우 "추세를 확인하려면 연습 기록이 한 개 더 필요합니다" 안내
- 스크린 리더 및 키보드 접근성을 위한 `<details>` 대체 텍스트 목록 제공

### C. 카테고리별 연습 분석
- 8개 핵심 카테고리 전체 현황 표시:
  - 연습한 카테고리: 시도 횟수, Retry 횟수, 평균 시간, 평균 WPM, 평균 Filler 비율, 최근 연습일, 자주 언급된 AI 코칭 개선 태그
  - 연습하지 않은 카테고리: 0회 (미연습), "아직 연습하지 않음", 지표는 "데이터 없음"으로 표시

### D. 연속 연습일 (Streak Calculation)
- 사용자 기기의 로컬 날짜(`YYYY-MM-DD`) 기준으로 계산
- 하루에 여러 번 연습하더라도 스트릭에서는 1일로 계산
- 오늘 또는 어제 연습 기록이 있으면 스트릭 유지
- 과거 전체 기록 중 최장 연속일(`longestStreak`) 보존
- 최근 28일 일별 활동 빈도 히트맵 그리드 표시

### E. 개인 주간 목표 (Goal Progress)
- 지원 목표: 주간 답변 수, 주간 연습 일수, 주간 Retry 횟수, 카테고리별 목표 등
- 월요일 00:00 로컬 시간 기준 주간 자동 평가
- 목표치 수정 시 안전 범위(1~30회 등) 클램핑 적용
- 긍정적인 교육용 문구 사용: "이번 주 목표까지 N회 남았습니다" (실패 낙인 방지)

### F. 규칙 기반 추천 엔진 (Recommendation Engine)
- AI API 호출 없이 로컬 순수 규칙으로 최대 3개 추천 생성:
  1. 30일간 연습하지 않은 카테고리 추천
  2. 첫 답변만 있고 Retry하지 않은 세션 재도전 권장
  3. 최근 답변 시간이 30초 미만인 경우 근거 보강 연습 권장
  4. 최근 Filler 비율이 5.0 이상인 경우 호흡 훈련 권장
- 원클릭으로 해당 카테고리 또는 질문 연습 시작 지원

### G. History & Session 상세
- 기간, 카테고리, Retry 여부, AI Coaching 여부 다중 필터 및 최신순/오래된순/시도많은순 정렬
- 세션 상세에서 모든 답변 시도의 Transcript, 지표, 코칭 결과 타임라인 확인
- **세션 재연습 선택지 (AC-21)**:
  - `같은 Session에서 Retry`: 기존 세션 ID를 유지하고 `attemptNumber` 증가 (전후 비교 지속 가능)
  - `새 연습으로 시작`: 완전히 새로운 독립 `PracticeSession` 생성

### H. 데이터 관리 및 보안
- **개별 세션 삭제**: 해당 세션과 연결된 Attempt만 안전하게 영구 삭제 (다른 세션과 목표는 보존)
- **전체 데이터 초기화**: 실수 방지를 위해 사용자가 직접 "초기화" 텍스트를 입력해야 버튼 활성화
- **JSON 백업 파일 내보내기**:
  - 파일명: `spa-speaking-trainer-backup-YYYY-MM-DD.json`
  - 포함: 세션, 시도별 텍스트 및 지표, AI 코칭 결과, 목표, 환경설정
  - 제외: 오디오 Blob, Object URL, MediaStream, API 키, 서버 내부 환경변수

---

## 5. localStorage Schema Versioning & 마이그레이션

- **현재 스키마 버전**: `CURRENT_SCHEMA_VERSION = 4`
- **저장 키**:
  - `spa_practice_data_v4`: 통합 데이터 구조 (`attempts`, `sessions`, `goals`, `preferences`)
  - `spa_practice_history_v1`: 하위 호환성을 위한 최근 20개 시도 동기화
- **마이그레이션 전략**:
  - 레거시(Sprint 2~3)의 평면 배열(`PracticeAttempt[]`) 감지 시, 각 시도를 독립된 `PracticeSession`으로 자동 래핑하여 데이터 유실 없이 무손실 마이그레이션.
  - 손상된 JSON이나 비정상 데이터 입력 시 안전한 기본값으로 폴백.

---

## 6. 테스트 및 검증

Vitest를 활용하여 7개 테스트 스위트, 총 59개의 단위 및 통합 테스트를 실행합니다.

```bash
# 전체 테스트 실행
npm test

# 타입 검사 및 린트
npm run lint

# 프로덕션 빌드 검증
npm run build
```

### 테스트 커버리지 영역
- `progressAnalytics.test.ts`: 기간 필터링(경계값, 미래 날짜 제외), 요약 지표(null 처리, 0초 제외), 카테고리 통계, 스트릭(로컬 타임존, 결측일), 목표 진행률, 추천 엔진, 정렬/필터, 세션 삭제, JSON 내보내기
- `attemptComparison.test.ts`: 객관적 지표 전후 비교, 허용 오차 판정, 체크리스트 이행 여부 평가, Transcript 텍스트 차이 분석
- `storageMigrations.test.ts`: V1 평면 배열 무손실 마이그레이션, 손상된 JSON 복구
- `speakingMetrics.test.ts`: WPM 계산, Filler 감지, 어휘 다양성
- `coaching.test.ts`: AI 코칭 스키마 검증, 4단계 평점

---

## 7. 알려진 제한사항

1. **오디오 영구 저장 미지원**: 브라우저 로컬 저장소 용량 한계 및 프라이버시 보호를 위해 녹음된 오디오 Blob은 세션 종료 시 정리되며, localStorage에는 텍스트와 수치 지표만 영속화됩니다.
2. **Transcript 수정 영향**: 사용자가 오인식된 전사 텍스트를 수정하면 지표와 비교 데이터가 재계산됩니다.
3. **Filler 단어 감지 한계**: 규칙 기반(n-gram/정규식)으로 감지하므로 문맥적 사용(예: "I mean what I said")을 완전히 구분하지 못할 수 있습니다.
4. **어휘 다양성(Lexical Diversity)**: 답변 길이가 매우 짧은 경우 다양성 수치가 통계적으로 왜곡될 수 있습니다.
5. **로컬 브라우저 한정**: 클라우드 계정 동기화가 없으므로 브라우저 캐시/데이터를 모두 삭제하면 기록이 사라질 수 있으며, 정기적인 JSON 백업을 권장합니다.

---

## 8. Sprint 5 권장 기능 로드맵

- 사용자 정의 문제 생성 및 커스텀 문제 은행 추가
- JSON 백업 파일 복원(Import / Restore) 기능 (스키마 검증 및 병합 옵션)
- 세션별 오디오 일시적 내보내기(WebM/WAV 다운로드)
- 모바일 PWA 오프라인 모드 지원
