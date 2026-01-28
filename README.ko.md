# Claude Code 워크플로우 템플릿

**33개의 전문 에이전트**, **20개의 강력한 명령어**, **5개의 오케스트레이션된 워크플로우**, **13개의 리뷰 체크리스트**, **16개의 코드 템플릿**, **20개의 스킬 참조**, **2개의 자동 강제 규칙 파일**을 특징으로 하는 Claude Code용 하이브리드 코딩 워크플로우를 구현한 바로 사용 가능한 템플릿입니다.

**핵심 기능**: 메인 에이전트가 표준 작업(CRUD, 간단한 기능, 버그 수정)을 직접 코딩하고, 복잡한 도메인(인증, 데이터베이스, 성능, 보안)에는 전문 에이전트에게 위임합니다.

---

## 🎯 이 템플릿 사용하기

이 템플릿은 다음과 같은 경우에 적용할 수 있는 완전한 개발 워크플로우 설정을 제공합니다:
- **새 프로젝트**: 모든 구성이 준비된 시작점으로 사용
- **기존 프로젝트**: 현재 설정을 방해하지 않고 원활하게 통합
- **개인 개발자**: 포괄적인 워크플로우 자동화
- **팀**: 공유 표준 및 지식 기반

### 빠른 시작 (모든 플랫폼)

```bash
# 1. 리포지토리 클론
git clone <this-repo> my-project
cd my-project

# 2. 설정 마법사 실행
node setup.cjs

# 3. Claude Code 시작
claude
```

설정 마법사는:
- 플랫폼(Windows/macOS/Linux)을 감지하고 그에 따라 MCP 서버를 구성합니다
- 활성화할 MCP 서버를 묻습니다
- API 키를 안전하게 수집합니다 (gitignore된 `.mcp.json`에 저장)
- 템플릿에서 `.env` 파일을 생성합니다
- 선택적으로 의존성을 설치합니다

### 수동 설정 (대안)

**새 프로젝트의 경우**:
```bash
git clone <this-repo> my-project
cd my-project
rm -rf .git && git init
cp .mcp.template.json .mcp.json
cp .env.example .env
# API 키로 .mcp.json 및 .env 편집
```

**기존 프로젝트의 경우**:
```bash
# 기존 프로젝트에 템플릿 파일 복사
# 통합 가이드는 QUICKSTART.md 및 WORKFLOW.md 섹션 7 참조
```

📖 **전체 설정 지침**: 5분 설정은 [QUICKSTART.md](QUICKSTART.md) 참조, 포괄적인 커스터마이제이션은 [WORKFLOW.md](WORKFLOW.md) 섹션 7 참조

---

## 포함 내용

### ⚡ 커스텀 명령어 (20개)
- `/full-feature` - 전체 기능 사이클 (계획 → 테스트 → PR)
- `/quick-fix` - 빠른 버그 수정 워크플로우
- `/commit-push-pr` - 커밋, 푸시 및 PR 생성 워크플로우
- `/review-changes` - 포괄적인 코드 리뷰
- `/test-and-build` - 자동 수정과 함께 테스트 및 빌드 실행
- `/test-coverage` - 테스트 커버리지 분석 및 개선
- `/lint-fix` - ESLint + Prettier + TypeScript
- `/type-check` - 엄격한 TypeScript 검사
- `/build-fix` - 빌드 오류 자동 수정
- `/refactor-clean` - 죽은 코드 제거, 패턴 현대화
- `/spike` - 시간 제한 기술 연구
- `/plan` - 상세한 구현 계획 생성
- `/tdd` - 테스트 주도 개발 워크플로우
- `/new-component` - React 컴포넌트 + 테스트 + 스토리 스캐폴드
- `/dead-code` - 사용하지 않는 코드/exports/의존성 찾기
- `/audit-deps` - 의존성 보안 감사
- `/create-migration` - 롤백이 포함된 데이터베이스 마이그레이션 생성
- `/e2e` - 엔드투엔드 테스트 생성 및 실행
- `/security-review` - 포괄적인 보안 감사
- `/update-docs` - 코드 변경 사항과 문서 동기화

### 🤖 커스텀 에이전트 (33개의 전문가)

**철학**: 메인 에이전트가 표준 개발을 직접 처리합니다. 전문 에이전트는 복잡한 도메인에 대한 전문가 지침을 제공합니다.

**핵심 워크플로우:**
- **planner** - 구현 계획 및 작업 분해 (복잡한 기능의 경우 선택 사항)
- **architect** - 시스템 설계 및 아키텍처 결정
- **code-reviewer** - 포괄적인 코드 품질 리뷰
- **security-reviewer** - OWASP 보안 감사
- **verify-app** - 엔드투엔드 애플리케이션 검증

**코드 품질:**
- **code-simplifier** - 불필요한 복잡성 제거
- **refactor-cleaner** - 레거시 코드 현대화, 죽은 코드 제거
- **tech-debt-analyzer** - 기술 부채 우선순위 지정
- **type-safety-enforcer** - `any` 타입 제거

**테스트:**
- **tdd-guide** - 테스트 주도 개발 워크플로우
- **unit-test-writer** - AAA 패턴을 사용한 단위 테스트
- **integration-test-writer** - API/서비스 통합 테스트
- **e2e-runner** - Playwright/Cypress E2E 테스트
- **load-test-specialist** - k6/Artillery 성능 테스트

**개발:**
- **api-designer** - REST/GraphQL API 설계 및 문서화
- **database-architect** - 스키마 설계 및 최적화
- **auth-specialist** - OAuth, JWT, MFA 구현
- **graphql-specialist** - GraphQL 스키마 및 리졸버
- **websocket-specialist** - 실시간 Socket.io 패턴

**운영:**
- **build-error-resolver** - 빌드 오류 반복적 수정
- **ci-cd-specialist** - GitHub Actions 파이프라인
- **docker-specialist** - 컨테이너화 및 최적화
- **migration-specialist** - 무중단 데이터베이스 마이그레이션
- **dependency-manager** - 패키지 관리 및 감사

**특수화:**
- **accessibility-auditor** - WCAG 2.1 AA 준수
- **i18n-specialist** - 국제화 지원
- **doc-updater** - 코드와 문서 동기화
- **performance-optimizer** - 병목 현상 프로파일링 및 최적화
- **monitoring-architect** - 로깅, 메트릭 및 알림
- **runbook-writer** - 배포 및 문제 해결 가이드
- **mobile-specialist** - React Native/Flutter 개발
- **ai-integration-specialist** - LLM API, RAG, 프롬프트 엔지니어링
- **iac-specialist** - Terraform, CloudFormation 인프라

### 📂 조직

- **5개의 오케스트레이션된 워크플로우** - full-feature, bug-fix, refactor, release, security-audit
- **13개의 리뷰 체크리스트** - PR 리뷰, 보안, 성능, 접근성, 출시 전, 온보딩, AI 코드 리뷰, 데이터베이스 마이그레이션, 의존성 감사, 배포, 핫픽스, 빌드 오류, E2E 테스트
- **16개의 코드 템플릿** - component, API route, test, migration, PR description, error-handler, form, guard, hook, middleware, service, API documentation, GitHub workflow, Dockerfile, Playwright config, README
- **20개의 스킬 참조** - React, Next.js, REST API, GraphQL, WebSocket, TDD, backend patterns, frontend patterns, coding standards, Node.js, Prisma, GitHub Actions, project guidelines, user intent, prompt engineering, RAG patterns, auth patterns, database patterns, Docker patterns, documentation patterns
- **하이브리드 에이전트 규칙** - 메인 에이전트가 표준 작업을 코딩하고, 효율성과 전문성을 위해 특수 작업을 위임합니다

### 📚 문서

- [QUICKSTART.md](QUICKSTART.md) - 일일 워크플로우 빠른 참조 (5분 설정)
- [WORKFLOW.md](WORKFLOW.md) - **완전한 워크플로우 가이드 (1500+ 줄)** 의사결정 트리 및 실제 예제 포함
- [CLAUDE.md](CLAUDE.md) - 팀 가이드라인 (프로젝트에 맞게 커스터마이즈)
- `.claude/rules/` - 자동 강제 가이드라인 (2개의 규칙 파일)
- `.claude/skills/` - 패턴 참조 (20개의 스킬 파일)

### ⚙️ 구성

- `.claude/settings.json` - 공유 팀 설정 (49개의 사전 승인 작업, 훅)
- `.mcp.template.json` - MCP 서버 템플릿 (27개 서버, 크로스 플랫폼)
- `.env.example` - 환경 변수 템플릿
- `setup.cjs` - 크로스 플랫폼 설정 마법사
- `.gitignore` - 다양한 프로젝트 유형에 대한 합리적인 기본값

---

## 시작하기

1. **빠른 시작**: [QUICKSTART.md](QUICKSTART.md) - 5분 안에 시작
2. **워크플로우 마스터**: [WORKFLOW.md](WORKFLOW.md) - **완전한 1500+ 줄 가이드** 다음 내용 포함:
   - "필요한 것은..." 시나리오를 위한 의사결정 트리
   - 명령어 및 에이전트 선택 매트릭스
   - 실제 인증 구현 예제
   - MCP 서버 통합 가이드
   - 점진적 도입 로드맵
3. **가이드라인 커스터마이즈**: 프로젝트 세부사항에 맞게 [CLAUDE.md](CLAUDE.md) 편집
4. **리소스 탐색**: 패턴을 위해 `.claude/rules/` 및 `.claude/skills/` 확인
5. **명령어 시도**: Claude Code에서 `/full-feature` 또는 `/commit-push-pr` 실행

---

## 워크플로우 개요

### 기본 개발 플로우

1. 프로젝트에서 Claude Code 시작: `claude`
2. 빌드하고 싶은 것 설명
3. 계획 검토 및 승인
4. Claude가 커스텀 명령어로 구현하도록 허용
5. 완료되면 `/commit-push-pr` 사용

### 주요 기능

- **병렬 세션**: 최대 5개의 동시 Claude 세션 실행
- **모델 선택**: 자동 모델 전환 (대부분 Sonnet, 간단한 것 Haiku, 복잡한 것 Opus)
- **사전 승인된 명령어**: 속도를 위해 사전 승인된 일반적인 bash 작업
- **커스텀 훅**: 자동화된 품질 검사 및 포맷팅

---

## 커스터마이제이션

### 필수 커스터마이제이션 (먼저 수행)

- [ ] 프로젝트 세부사항으로 이 README 업데이트
- [ ] 기술 스택으로 [CLAUDE.md](CLAUDE.md) 편집
- [ ] [CLAUDE.md](CLAUDE.md)에 프로젝트 구조 추가
- [ ] git 구성: `git config user.name` 및 `git config user.email`

### 선택적 커스터마이제이션

- [ ] [CLAUDE.md](CLAUDE.md)에 프로젝트별 규칙 추가
- [ ] 워크플로우에 대한 커스텀 명령어 생성
- [ ] 도메인별 작업을 위한 커스텀 에이전트 구축
- [ ] `.claude/settings.json`에서 모델 선호도 조정

전체 커스터마이제이션 로드맵은 [WORKFLOW.md](WORKFLOW.md) 섹션 7 참조.

---

## 프로젝트 구조

```
.
├── .claude/
│   ├── agents/               # 33개의 전문 에이전트
│   │   ├── planner.md
│   │   ├── architect.md
│   │   ├── code-reviewer.md
│   │   ├── auth-specialist.md
│   │   └── ... (29개 더)
│   ├── commands/             # 20개의 슬래시 명령어
│   │   ├── full-feature.md
│   │   ├── quick-fix.md
│   │   ├── commit-push-pr.md
│   │   └── ... (17개 더)
│   ├── workflows/            # 5개의 오케스트레이션된 에이전트 시퀀스
│   │   ├── full-feature.md
│   │   ├── bug-fix.md
│   │   └── ... (3개 더)
│   ├── checklists/           # 13개의 리뷰 체크리스트
│   │   ├── pr-review.md
│   │   ├── security-audit.md
│   │   ├── build-errors-checklist.md
│   │   └── ... (10개 더)
│   ├── templates/            # 코드 템플릿 (Claude가 여기를 봅니다)
│   │   ├── *.template        # 작동하는 템플릿 (8개의 일반 템플릿)
│   │   └── variants/         # 조직화된 소스 템플릿
│   │       ├── generic/      # 프레임워크 독립적 (8개 템플릿)
│   │       ├── react/        # React 특정 (2개 템플릿)
│   │       ├── nextjs/       # Next.js 특정 (1개 템플릿)
│   │       └── vue/          # Vue 특정 (직접 추가)
│   ├── rules/                # 핵심 가이드라인
│   │   ├── essential-rules.md
│   │   ├── agent-workflow.md (하이브리드 모델)
│   │   └── self-aware-system.md
│   ├── skills/               # 20개의 참조 지식 파일
│   │   ├── react-patterns.md
│   │   ├── auth-patterns.md
│   │   ├── database-patterns.md
│   │   └── ... (17개 더)
│   ├── settings.json         # 공유 설정 (훅, 사전 승인 작업)
│   └── settings.local.json   # 로컬 재정의 (gitignored)
├── lib/                      # 설정 마법사 모듈
│   ├── techstack.cjs         # 프레임워크/백엔드/데이터베이스 자동 감지
│   ├── claude-md.cjs         # 감지된 스택에서 CLAUDE.md 생성
│   └── ... (기타 모듈)
├── .mcp.template.json        # MCP 템플릿 (27개 서버, 커밋됨)
├── .mcp.json                 # 키가 포함된 MCP 구성 (gitignored, 생성됨)
├── .env.example              # 환경 템플릿
├── .env                      # 시크릿 (gitignored, 생성됨)
├── setup.cjs                 # 크로스 플랫폼 설정 마법사
├── CLAUDE.md                 # 팀 가이드라인 ⚠️ 커스터마이즈
├── TEMPLATE-SETUP.md         # 새 프로젝트를 위한 설정 가이드
├── INTEGRATION.md            # 기존 코드베이스를 위한 통합 가이드
├── WORKFLOW.md               # 완전한 1500+ 줄 가이드
├── QUICKSTART.md             # 빠른 참조
└── README.md                 # 이 파일
```

---

## 일일 사용

### 세션 시작

```bash
cd your-project
claude
```

### 일반적인 작업

```bash
# Claude Code에서:
"사용자 인증 구현을 도와주세요"
"checkout.ts의 버그를 수정하세요"
"결제 모듈에 대한 테스트 추가"
"/review-changes"              # 커밋 전 리뷰
"/commit-push-pr"              # 커밋 및 PR 생성
```

### 팁

- `/`를 사용하여 모든 커스텀 명령어 확인
- [filename.ts:42](src/filename.ts#L42) 구문으로 파일 참조
- 서로 다른 기능에 대해 최대 5개의 병렬 세션 실행
- 키보드 단축키는 [QUICKSTART.md](QUICKSTART.md) 확인

---

## 지원 및 리소스

- **빠른 시작 (5분)**: [QUICKSTART.md](QUICKSTART.md)
- **완전한 워크플로우 가이드 (1500+ 줄)**: [WORKFLOW.md](WORKFLOW.md) - 의사결정 트리, 예제 및 통합 패턴
- **Claude Code 도움말**: Claude에서 `/help` 실행 또는 https://claude.com/claude-code 방문
- **보관된 문서**: 레거시 파일은 [.archive/README.md](.archive/README.md) 참조

---

## 유지보수

### 최신 상태 유지

- Claude가 실수할 때 [CLAUDE.md](CLAUDE.md) 업데이트
- 패턴이 나타나면 새 규칙 추가
- 주간 검토 및 오래된 가이드라인 제거
- `.claude`를 태그하여 업데이트 제안

### 버전 관리

- 템플릿 업데이트 커밋: `git add .claude/ CLAUDE.md`
- 팀과 공유: CLAUDE.md의 가이드라인은 모두에게 적용
- 동기화 유지: 정기적으로 템플릿 업데이트 가져오기

---

## 라이선스

[여기에 라이선스 추가]

---

**템플릿 버전**: 2.1
**모델**: 하이브리드 에이전트 시스템 (메인 에이전트가 코딩 + 전문가)
**마지막 업데이트**: 2026-01-26
