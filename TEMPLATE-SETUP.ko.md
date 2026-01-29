# 템플릿 설정 가이드

프로젝트에 맞게 이 Claude Code 템플릿을 커스터마이즈하기 위한 완전한 가이드입니다.

---

## 개요

이 템플릿은 **프레임워크 독립적**이며 모든 기술 스택에 맞게 커스터마이즈할 수 있도록 설계되었습니다. 사용하기 전에 다음을 수행해야 합니다:

1. **`CLAUDE.md`에서 기술 스택 참조 업데이트**
2. **관련 없는 스킬/템플릿 제거**
3. **프로젝트별 설정 커스터마이즈**
4. **설정 마법사 실행**

**예상 시간**: 15-30분

---

## 1단계: CLAUDE.md 업데이트 (필수)

`CLAUDE.md`는 Claude가 프로젝트를 이해하기 위해 읽는 기본 구성 파일입니다.

### 커스터마이즈할 내용

`CLAUDE.md`를 열고 다음 플레이스홀더 섹션을 바꾸세요:

#### 기술 스택 (약 49-75줄)

`{{FRONTEND_STACK}}`, `{{BACKEND_STACK}}` 등을 실제 스택으로 바꾸세요:

```markdown
**프론트엔드**: React 18+, Next.js 14+ (App Router), TypeScript 5+, Tailwind CSS
**백엔드**: Node.js 20+, Supabase (PostgreSQL, Auth, Storage, Real-time)
**테스트**: Vitest, Playwright, React Testing Library
**DevOps**: Docker, GitHub Actions, Vercel
```

또는 다른 스택의 경우:

```markdown
**프론트엔드**: Vue 3, Nuxt 3, TypeScript, UnoCSS
**백엔드**: Python 3.11+, FastAPI, PostgreSQL, SQLAlchemy
**테스트**: Pytest, Playwright
**DevOps**: Docker, GitHub Actions, Railway
```

#### 프로젝트 구조 (약 61-72줄)

프로젝트에 맞게 디렉토리 구조를 업데이트하세요:

```markdown
## 프로젝트 구조

\```
backend/
├── src/
│   ├── api/           # FastAPI 라우트
│   ├── models/        # SQLAlchemy 모델
│   ├── services/      # 비즈니스 로직
│   └── utils/         # 유틸리티
frontend/
├── src/
│   ├── pages/         # Vue 페이지
│   ├── components/    # Vue 컴포넌트
│   └── composables/   # Vue composables
\```
```

#### 의존성 (약 77-81줄)

승인된 의존성과 금지된 의존성을 나열하세요:

```markdown
**승인됨**: pydantic, sqlalchemy, alembic, pytest, httpx

**금지됨**: django-rest-framework (FastAPI 사용), flask (FastAPI 사용)
```

---

## 2단계: 관련 없는 파일 정리 (권장)

사용하지 않을 스킬, 템플릿 및 에이전트를 삭제하세요.

### 프레임워크별 스킬

`.claude/skills/`에 위치:

| 스킬 파일 | 삭제 조건... |
|------------|--------------|
| `react-patterns.md` | React를 사용하지 않는 경우 |
| `nextjs-patterns.md` | Next.js를 사용하지 않는 경우 |
| `nodejs-patterns.md` | Node.js 백엔드를 사용하지 않는 경우 |

### 프레임워크별 템플릿

`.claude/templates/`에 위치:

| 템플릿 파일 | 삭제 조건... |
|---------------|--------------|
| `component.tsx.template` | React/TSX를 사용하지 않는 경우 |
| `form.tsx.template` | React 폼을 사용하지 않는 경우 |
| `api-route.ts.template` | Next.js App Router를 사용하지 않는 경우 |

### 유지해야 할 것 (프레임워크 독립적)

**스킬**:
- `coding-standards.md` - 범용 모범 사례
- `tdd-workflow.md` - 테스트 방법론
- `backend-patterns.md` - 일반 백엔드 패턴
- `rest-api-design.md` - REST API 표준
- `database-patterns.md` - 데이터베이스 디자인 패턴

**템플릿**:
- `test.spec.ts.template` - 일반 테스트 템플릿
- `migration.sql.template` - 데이터베이스 마이그레이션
- `pr-description.md.template` - 풀 리퀘스트 템플릿
- `error-handler.ts.template` - 에러 처리
- `Dockerfile.template` - 컨테이너화

**에이전트**: 모든 33개 에이전트는 프레임워크 독립적입니다 - `CLAUDE.md`를 기반으로 스택에 적응합니다

---

## 3단계: 설정 및 훅 업데이트 (선택 사항)

### `.claude/settings.json`

`.claude/settings.json`에 위치 - 검토 및 커스터마이즈:

#### 허용된 프롬프트 (4-220줄)

일반적인 bash 작업을 사전 승인합니다. 프로젝트별 명령어 추가:

```json
{
  "tool": "Bash",
  "prompt": "run supabase commands"
},
{
  "tool": "Bash",
  "prompt": "run your-custom-cli commands"
}
```

#### 훅 (221-354줄)

자동 트리거 액션. 검토 및 커스터마이즈:

**프리 커밋 훅** (261줄):
```json
{
  "matcher": "tool == \"Bash\" && tool_input.command matches \"git commit\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\nif [ -f \".claude/scripts/pre-commit-checks.sh\" ]; then\n  ./.claude/scripts/pre-commit-checks.sh\nfi || true"
  }]
}
```

**자동 포맷 훅** (318줄):
```json
{
  "matcher": "tool in [\"Edit\", \"Write\"] && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx|json|css|scss|md)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\nnpx prettier --write \"$file_path\" 2>/dev/null || true"
  }]
}
```

---

## 4단계: 설정 마법사 실행

설정 마법사는 플랫폼별 설정을 구성하고 API 키를 수집합니다.

```bash
node setup.cjs
```

마법사는:

1. **플랫폼 감지** (Windows/macOS/Linux)
2. **MCP 서버 구성** (올바른 경로 포함)
3. **Slack MCP 필수 설정** (개발 채널에 PR 알림을 보내기 위해 필수)
4. **API 키 수집** (안전하게, gitignore된 `.mcp.json`에 저장)
5. **`.env` 파일 생성** (템플릿에서)
6. **선택적으로 의존성 설치**

**중요**: 설정 마법사는 Slack MCP 자격 증명을 요청합니다 (필수):
- Slack Bot Token (https://api.slack.com/apps 에서 발급)
- Slack Team ID (T로 시작하는 워크스페이스 ID)

이는 `/commit-push-pr` 명령어 사용 시 개발 채널에 자동으로 PR 알림을 보내는 데 필요합니다.

### 생성되는 것

- `.mcp.json` - API 키가 포함된 MCP 서버 구성 (**gitignored**)
- `.env` - 환경 변수 (**gitignored**)
- `package.json` - 생성을 선택한 경우

### 수동 설정 (대안)

수동 설정을 선호하는 경우:

```bash
# 1. 템플릿 복사
cp .mcp.template.json .mcp.json
cp .env.example .env

# 2. API 키로 편집
# .mcp.json 편집 - GitHub 토큰, Supabase 키 등 추가
# .env 편집 - 프로젝트별 시크릿 추가

# 3. 의존성 설치 (해당하는 경우)
npm install  # 또는 yarn, pnpm, bun
```

---

## 5단계: 설정 확인

### Claude Code 테스트

```bash
claude
```

그런 다음 물어보세요:

```
우리 기술 스택은 무엇인가요?
```

Claude가 템플릿 기본값이 아닌 귀하의 스택(CLAUDE.md에서)을 설명해야 합니다.

### 명령어 테스트

```bash
# Claude에서
/full-feature
```

Claude가 귀하의 기술 스택을 사용하여 기능을 계획해야 합니다.

### MCP 서버 확인

```bash
# Claude에서
GitHub에 접근할 수 있나요?
Supabase에 접근할 수 있나요?
```

올바르게 구성된 경우 Claude가 액세스를 확인합니다.

---

## 빠른 참조: 커스터마이즈할 것

### 반드시 커스터마이즈

- [x] `CLAUDE.md` - 기술 스택, 프로젝트 구조, 의존성
- [x] `setup.cjs` 실행 - 플랫폼 구성 및 API 키

### 커스터마이즈해야 함

- [ ] `.claude/skills/` - 관련 없는 프레임워크 스킬 삭제
- [ ] `.claude/templates/` - 관련 없는 프레임워크 템플릿 삭제

### 선택적 커스터마이제이션

- [ ] `.claude/settings.json` - 훅 및 허용된 프롬프트
- [ ] `.claude/scripts/` - 커스텀 자동화 스크립트
- [ ] `.gitignore` - 프로젝트별 무시 패턴

---

## 문제 해결

### "Claude가 내 기술 스택을 모릅니다"

**원인**: `CLAUDE.md`에 여전히 플레이스홀더 텍스트가 있음

**해결책**: `CLAUDE.md`를 편집하고 모든 `{{...}}` 플레이스홀더를 바꾸세요

### "MCP 서버가 작동하지 않습니다"

**원인**: API 키가 구성되지 않았거나 잘못된 경로

**해결책**: `node setup.cjs`를 다시 실행하거나 `.mcp.json`을 수동으로 편집하세요

### "스킬이 잘못된 프레임워크를 참조합니다"

**원인**: 프레임워크별 스킬이 여전히 존재함

**해결책**: `.claude/skills/react-patterns.md`, `nextjs-patterns.md` 등을 삭제하세요

### "프리 커밋 훅이 실패합니다"

**원인**: 스크립트가 없는 도구(예: `prettier`, `eslint`)를 참조함

**해결책**: `.claude/settings.json` 훅 섹션을 편집하고 명령어를 제거하거나 업데이트하세요

---

## 예제: FastAPI + Vue 설정

### 1. CLAUDE.md 업데이트

```markdown
## 기술 스택

**프론트엔드**: Vue 3, Vite, TypeScript, Pinia, VueUse
**백엔드**: Python 3.11+, FastAPI, PostgreSQL, SQLAlchemy, Alembic
**테스트**: Pytest, Playwright, Vitest
**DevOps**: Docker, GitHub Actions

## 프로젝트 구조

\```
backend/
├── app/
│   ├── api/
│   ├── models/
│   └── services/
frontend/
├── src/
│   ├── views/
│   ├── components/
│   └── stores/
\```

## 의존성

**승인됨**: pydantic, httpx, pytest, vue-router, pinia

**금지됨**: django (FastAPI 사용), axios (httpx 사용)
```

### 2. React/Next.js 파일 삭제

```bash
rm .claude/skills/react-patterns.md
rm .claude/skills/nextjs-patterns.md
rm .claude/skills/nodejs-patterns.md
rm .claude/templates/component.tsx.template
rm .claude/templates/form.tsx.template
rm .claude/templates/api-route.ts.template
```

### 3. 설정 실행

```bash
node setup.cjs
```

### 4. 사용 시작

```bash
claude
```

```
Vue로 사용자 프로필 페이지를 빌드하세요
```

Claude는 Vue 3 패턴, FastAPI 백엔드 및 구성된 스택을 사용합니다.

---

## 다음 단계

1. **읽기** [WORKFLOW.md](WORKFLOW.md) - 완전한 워크플로우 가이드
2. **탐색** `.claude/commands/` - 사용 가능한 명령어 학습
3. **시도** `/full-feature` - 첫 번째 기능 빌드
4. **커스터마이즈** 패턴을 발견하면 `CLAUDE.md`

---

**도움이 필요하신가요?**

- 이슈 열기: https://github.com/anthropics/claude-code/issues
- Claude Code 문서: https://claude.com/claude-code
- 템플릿 문서: [README.md](README.md), [WORKFLOW.md](WORKFLOW.md)
