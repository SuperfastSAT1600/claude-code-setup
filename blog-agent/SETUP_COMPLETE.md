# ✅ 업그레이드 완료!

블로그 에이전트가 PDF 지원 및 웹 서칭 기능과 함께 업그레이드되었습니다!

## 🎉 새로운 기능

### 1. ✅ PDF 파일 지원
- **내 블로그 포스팅 PDF**: `blog-agent/data/my-posts-pdf/`
- **SAT 자료 PDF**: `blog-agent/data/sat-materials-pdf/`
- PDF에서 자동으로 텍스트 추출 및 스타일 분석

### 2. ✅ 웹 서칭
- 키워드 기반 웹 검색
- 최신 정보 및 트렌드 반영
- 현재 Mock 모드 (실제 API 연결 가능)

### 3. ✅ 인터랙티브 CLI
- 대화형 인터페이스로 편리한 입력
- 키워드, 주제, 타겟 독자 등 상세 설정
- 실시간 피드백

## 📁 새로운 디렉토리 구조

```
blog-agent/data/
├── my-posts/              ← 마크다운 포스팅
├── my-posts-pdf/          ← ✨ PDF 포스팅 (새로 추가!)
├── sat-materials/         ← 마크다운 SAT 자료
├── sat-materials-pdf/     ← ✨ PDF SAT 자료 (새로 추가!)
│   ├── official-guides/
│   ├── practice-tests/
│   └── study-tips/
└── outputs/
    ├── drafts/           ← 생성된 블로그 글
    └── published/
```

## 🚀 사용 방법

### 1단계: PDF 파일 추가

#### 내 블로그 포스팅 PDF
```bash
# 여기에 PDF 파일을 복사하세요
blog-agent/data/my-posts-pdf/
```

예시:
- `sat-reading-tips-2024.pdf`
- `math-strategies.pdf`
- `writing-guide.pdf`

#### SAT 공식 자료 PDF
```bash
# SAT 자료 PDF를 유형별로 정리
blog-agent/data/sat-materials-pdf/
├── official-guides/
│   └── official-sat-guide.pdf
├── practice-tests/
│   └── practice-test-1.pdf
└── study-tips/
    └── time-management.pdf
```

### 2단계: 블로그 생성 실행

```bash
npm run blog:generate
```

### 3단계: 대화형 입력

프롬프트가 나타나면 다음을 입력하세요:

```
📝 블로그 주제를 입력하세요:
→ SAT Reading Comprehension Strategies

🔑 타게팅할 키워드 (쉼표로 구분):
→ SAT reading, comprehension, evidence-based questions

🎯 타겟 독자:
→ SAT를 준비하는 고등학생

📏 목표 길이:
→ 중간 (1200 단어)

📚 SAT 공식 자료를 참고할까요?
→ Yes

📖 SAT 자료 검색 키워드:
→ reading comprehension evidence

🌐 웹 서칭을 할까요?
→ Yes

🔍 웹 검색 키워드:
→ SAT reading tips 2024
```

### 4단계: 결과 확인

생성된 블로그 글은 다음 위치에 저장됩니다:
```
blog-agent/data/outputs/drafts/2026-02-09-your-title.md
```

## 🎯 워크플로우

```
[사용자 입력]
  ↓
[키워드/주제 제시]
  ↓
┌─────────────────────────────────────┐
│ 1. 내 블로그 포스팅 분석            │
│    - 마크다운 파일 읽기             │
│    - PDF 파일 읽기 ✨              │
│    - 스타일 추출 (어조, 관점, 등)   │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 2. SAT 자료 검색                    │
│    - 마크다운 자료 검색             │
│    - PDF 자료 검색 ✨              │
│    - 관련도 순 정렬                 │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 3. 웹 서칭 ✨                       │
│    - 키워드 검색                    │
│    - 최신 정보 수집                 │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 4. AI 블로그 생성                   │
│    - Claude API 호출                │
│    - 내 스타일로 작성               │
│    - 참고 자료 통합                 │
└─────────────────────────────────────┘
  ↓
[완성된 블로그 글]
```

## 🔧 고급 설정

### 웹 서칭 API 연결 (선택)

현재는 Mock 모드로 작동합니다. 실제 웹 서칭을 원하면:

#### SerpAPI (추천)
```bash
# .env 파일에 추가
SEARCH_API_KEY=your_serpapi_key
SEARCH_ENGINE=serpapi
```

SerpAPI 가입: https://serpapi.com/

#### Google Custom Search
```bash
# .env 파일에 추가
SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
SEARCH_ENGINE=google
```

### 로그 레벨 조정

```bash
# .env 파일에 추가
DEBUG=true  # 상세 로그 출력
```

## 📊 지원 파일 형식

| 포맷 | 지원 | 위치 |
|------|------|------|
| Markdown (`.md`) | ✅ | `my-posts/`, `sat-materials/` |
| PDF (`.pdf`) | ✅ ✨ | `my-posts-pdf/`, `sat-materials-pdf/` |
| 이미지 PDF | ⚠️ | OCR 필요 (현재 미지원) |

## 💡 사용 팁

1. **3-5개의 대표 포스팅 추가**
   - PDF와 마크다운 모두 가능
   - 스타일이 일관된 글 선택

2. **SAT 자료 정리**
   - 유형별로 폴더 정리
   - 파일명을 의미있게 설정

3. **키워드 최적화**
   - 구체적인 키워드 사용
   - SEO를 고려한 키워드 선정

4. **결과 검토 및 수정**
   - 생성된 글은 항상 검토 필수
   - 사실 확인 및 스타일 조정

## 🆘 문제 해결

### PDF를 읽을 수 없어요
- 텍스트 추출 가능한 PDF인지 확인
- 스캔 이미지 PDF는 OCR 필요
- 파일 크기가 너무 크면 시간이 오래 걸림

### 웹 서칭이 안 돼요
- 현재 Mock 모드로 작동 중 (정상)
- 실제 검색을 원하면 SerpAPI 키 설정

### 스타일이 안 맞아요
- 더 많은 샘플 포스팅 추가
- 스타일이 일관된 글 선택
- `src/config/agent-config.ts`에서 수동 조정

## 📚 참고 문서

- **README.md** - 전체 문서
- **QUICK_START.md** - 빠른 시작 가이드
- **my-posts-pdf/README.md** - PDF 포스팅 가이드
- **sat-materials-pdf/README.md** - SAT PDF 자료 가이드

## 🎉 준비 완료!

이제 PDF 파일을 추가하고 `npm run blog:generate`를 실행해보세요!

```bash
npm run blog:generate
```

Happy blogging! 🚀
