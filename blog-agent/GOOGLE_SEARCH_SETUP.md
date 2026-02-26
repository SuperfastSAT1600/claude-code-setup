# Google Custom Search API 설정 가이드

Google Custom Search를 사용하여 웹 서칭 기능을 활성화하는 방법입니다.

## 📋 단계별 설정

### 1단계: Google Cloud Console 접속

1. **Google Cloud Console 방문**
   - 👉 https://console.cloud.google.com/

2. **프로젝트 생성** (없는 경우)
   - 상단의 "프로젝트 선택" 클릭
   - "새 프로젝트" 클릭
   - 프로젝트 이름: `blog-agent` (자유롭게 설정)
   - "만들기" 클릭

### 2단계: Custom Search API 활성화

1. **API 및 서비스로 이동**
   - 좌측 메뉴 → "API 및 서비스" → "라이브러리"

2. **Custom Search API 검색**
   - 검색창에 "Custom Search API" 입력
   - "Custom Search API" 클릭
   - "사용" 버튼 클릭

### 3단계: API 키 생성

1. **사용자 인증 정보로 이동**
   - 좌측 메뉴 → "API 및 서비스" → "사용자 인증 정보"

2. **API 키 만들기**
   - 상단의 "+ 사용자 인증 정보 만들기" 클릭
   - "API 키" 선택
   - API 키가 생성됨 (복사해두세요!)

3. **API 키 제한 (권장)**
   - "키 제한" 클릭
   - "API 제한사항" → "키 제한"
   - "Custom Search API"만 선택
   - "저장" 클릭

### 4단계: Custom Search Engine 생성

1. **Programmable Search Engine 콘솔 방문**
   - 👉 https://programmablesearchengine.google.com/

2. **새 검색 엔진 추가**
   - "시작하기" 또는 "추가" 클릭

3. **검색 엔진 설정**
   ```
   검색할 사이트: 웹 전체 검색
   - "전체 웹 검색" 선택

   검색 엔진 이름: SAT Blog Research

   언어: 한국어 또는 영어
   ```

4. **검색 엔진 생성**
   - "만들기" 클릭

5. **검색 엔진 ID 복사**
   - "설정" → "기본" 탭
   - "검색 엔진 ID" 복사
   - 형식: `xxx...xxx` (긴 문자열)

---

## ⚙️ .env 파일 설정

`.env` 파일을 열고 다음 내용을 추가/수정하세요:

```env
# Google Custom Search API
SEARCH_API_KEY=여기에_구글_API_키_붙여넣기
GOOGLE_SEARCH_ENGINE_ID=여기에_검색엔진_ID_붙여넣기
SEARCH_ENGINE=google

# 기존 설정 유지
ANTHROPIC_API_KEY=your_anthropic_key
CLAUDE_MODEL=claude-sonnet-4-5-20250929
...
```

### 예시:
```env
SEARCH_API_KEY=AIzaSyAbc123def456ghi789jkl012mno345pqr
GOOGLE_SEARCH_ENGINE_ID=a1b2c3d4e5f6g7h8i
SEARCH_ENGINE=google
```

---

## 💰 요금 안내

### Google Custom Search API 무료 할당량

- **무료**: 하루 100회 검색
- **초과 시**: $5 / 1,000회 검색

### 비용 예상

| 사용량 | 월 비용 |
|--------|---------|
| 일 10회 (월 300회) | 무료 |
| 일 50회 (월 1,500회) | 무료 |
| 일 100회 (월 3,000회) | 무료 |
| 일 200회 (월 6,000회) | ~$25 |

**블로그 글 1개당**: 1-2회 검색

---

## ✅ 설정 확인

설정이 완료되면 테스트해보세요:

```bash
npm run blog:generate
```

프롬프트에서:
- "🌐 웹 서칭을 할까요?" → **Yes**
- "🔍 웹 검색 키워드:" → **SAT reading tips 2024**

성공하면 실제 Google 검색 결과가 사용됩니다!

---

## 🆘 문제 해결

### "API key not valid" 오류
- API 키가 올바른지 확인
- Custom Search API가 활성화되었는지 확인
- API 키 제한에서 Custom Search API가 허용되었는지 확인

### "Invalid Value" 오류
- 검색 엔진 ID가 올바른지 확인
- 검색 엔진이 "웹 전체 검색"으로 설정되었는지 확인

### 할당량 초과
- Google Cloud Console → "API 및 서비스" → "할당량"
- Custom Search API 할당량 확인
- 필요시 결제 계정 연결

---

## 🔗 유용한 링크

- **Google Cloud Console**: https://console.cloud.google.com/
- **Programmable Search Engine**: https://programmablesearchengine.google.com/
- **Custom Search API 문서**: https://developers.google.com/custom-search/v1/overview
- **요금 정보**: https://developers.google.com/custom-search/v1/overview#pricing

---

## 💡 팁

1. **검색 엔진 최적화**
   - "웹 전체 검색" 사용 (특정 사이트 제한 X)
   - 언어 설정을 한국어로 하면 한글 결과 우선

2. **API 키 보안**
   - `.env` 파일은 절대 공유하지 마세요
   - `.gitignore`에 `.env`가 포함되어 있는지 확인

3. **할당량 관리**
   - 개발 중에는 Mock 모드 사용
   - 실제 블로그 생성 시에만 Google 사용
   - `.env`에서 `SEARCH_ENGINE=mock`으로 전환 가능

---

준비되셨나요? 설정을 시작해보세요! 🚀
