# 통합 가이드

**기존 코드베이스**에 Claude Code를 추가하는 방법.

---

## 개요

기존 프로젝트가 있고 Claude Code 워크플로우 자동화를 추가하고 싶습니다.

**예시 시나리오**: `/home/user/my-app`에 프로젝트가 있고 Claude Code를 추가하고 싶습니다.

**최종 결과**:
```
my-app/                    (기존 프로젝트)
├── .claude/              ← 새로 추가 (워크플로우 시스템)
├── CLAUDE.md             ← 새로 추가 (기술 스택 구성)
├── setup.cjs             ← 새로 추가 (선택적 설정 마법사)
├── lib/                  ← 새로 추가 (마법사 모듈)
├── src/                  (기존 코드 - 변경 없음)
├── package.json          (기존 코드 - 변경 없음)
└── ... (나머지 코드 - 변경 없음)
```

**예상 시간**: 20-40분

---

## 전제 조건

- [x] 코드가 있는 기존 코드베이스
- [x] Git 초기화됨
- [x] Claude Code CLI 설치됨: `npm install -g @anthropic-ai/claude-code`

---

## 1단계: Claude Code 설정 다운로드

먼저 `claude-code-setup` 파일을 가져옵니다. 두 가지 옵션:

### 옵션 A: 프로젝트 옆에 클론 (권장)

```bash
# 현재 위치: /home/user/my-app (프로젝트)

# 한 단계 위로 이동
cd ..

# 프로젝트 옆에 claude-code-setup 클론
git clone https://github.com/YOUR-ORG/claude-code-setup.git

# 이제 다음과 같이 됨:
# /home/user/my-app/              (프로젝트)
# /home/user/claude-code-setup/   (템플릿)
```

### 옵션 B: 임시 디렉토리에 클론

```bash
# /tmp에 클론 (나중에 삭제됨)
git clone https://github.com/YOUR-ORG/claude-code-setup.git /tmp/claude-code-setup
```

---

## 2단계: 프로젝트에 파일 복사

이제 Claude Code 파일을 프로젝트에 복사합니다:

```bash
# 프로젝트 디렉토리로 이동
cd /home/user/my-app

# 워크플로우 시스템 복사
cp -r ../claude-code-setup/.claude/ .

# 기술 스택 구성 복사 (필수!)
cp ../claude-code-setup/CLAUDE.md .

# 설정 마법사 복사 (선택 사항이지만 권장)
cp ../claude-code-setup/setup.cjs .
cp -r ../claude-code-setup/lib/ .

# MCP 템플릿 복사 (선택 사항)
cp ../claude-code-setup/.mcp.template.json .
```

**옵션 B를 사용한 경우**, `../claude-code-setup/`를 `/tmp/claude-code-setup/`로 바꾸세요:
```bash
cp -r /tmp/claude-code-setup/.claude/ .
cp /tmp/claude-code-setup/CLAUDE.md .
# 등...
```

**이 단계 후 프로젝트는 다음과 같습니다**:
```
my-app/
├── .claude/       ← 새로 추가 (33개 에이전트, 20개 명령어, 13개 체크리스트)
├── CLAUDE.md      ← 새로 추가 (기술 스택 구성)
├── setup.cjs      ← 새로 추가 (마법사)
├── lib/           ← 새로 추가 (마법사 모듈)
├── src/           (기존 코드)
└── ...
```

---

## 3단계: CLAUDE.md 커스터마이즈

프로젝트의 `CLAUDE.md`를 열고 플레이스홀더를 바꾸세요:

```bash
# 에디터에서 CLAUDE.md 열기
code CLAUDE.md   # 또는 vim, nano 등
```

**찾아서 바꾸기**:
- `{{FRONTEND_STACK}}` → `Next.js 14, React 18, TypeScript` (또는 사용하는 것)
- `{{BACKEND_STACK}}` → `Supabase, PostgreSQL` (또는 사용하는 것)
- `{{TESTING_STACK}}` → `Vitest, Playwright` (또는 사용하는 것)
- `{{PROJECT_STRUCTURE}}` → 실제 디렉토리 구조

**또는 마법사 사용** (더 쉬움):
```bash
# 마법사가 스택을 감지하고 CLAUDE.md를 자동으로 업데이트합니다
node setup.cjs
```

---

## 4단계: 프레임워크별 템플릿 추가 (필요한 경우)

Claude Code는 기본적으로 작동하는 일반 템플릿(test, migration, PR description)을 포함합니다.

React/Next.js를 사용하는 경우 해당 템플릿을 복사하세요:

```bash
# React를 사용하나요?
cp .claude/templates/variants/react/*.template .claude/templates/

# Next.js를 사용하나요?
cp .claude/templates/variants/nextjs/*.template .claude/templates/
```

---

## 5단계: 작동 확인

```bash
# Claude Code 시작
claude
```

Claude에게 물어보세요:
```
우리 기술 스택은 무엇인가요?
```

Claude가 템플릿 기본값이 아닌 귀하의 스택(CLAUDE.md에서)을 설명해야 합니다.

---

## 완전한 예제 연습

`/Users/john/projects/my-saas-app`에 Next.js + Supabase 프로젝트가 있다고 가정해 봅시다:

```bash
# 1. claude-code-setup 다운로드
cd /Users/john/projects
git clone https://github.com/YOUR-ORG/claude-code-setup.git

# 2. 프로젝트로 이동
cd my-saas-app

# 3. 파일 복사
cp -r ../claude-code-setup/.claude/ .
cp ../claude-code-setup/CLAUDE.md .
cp ../claude-code-setup/setup.cjs .
cp -r ../claude-code-setup/lib/ .

# 4. 설정 마법사 실행 (Next.js + Supabase 자동 감지)
node setup.cjs

# 마법사는:
# - 감지: Next.js 14, Supabase, Vitest
# - 감지된 스택으로 CLAUDE.md 업데이트 제안
# - MCP 서버 구성
# - 완료!

# 5. Next.js 템플릿 복사
cp .claude/templates/variants/nextjs/*.template .claude/templates/
cp .claude/templates/variants/react/*.template .claude/templates/

# 6. git에 추가
git add .claude/ CLAUDE.md setup.cjs lib/
git commit -m "Add Claude Code workflow automation"

# 7. 사용 시작
claude
```

이제 프로젝트에 Claude Code가 있습니다! 🎉

---

## setup.cjs를 원하지 않는다면?

`setup.cjs`와 `lib/` 복사를 건너뛸 수 있습니다:

```bash
# 최소 통합 (이 2개만 복사)
cp -r ../claude-code-setup/.claude/ .
cp ../claude-code-setup/CLAUDE.md .

# CLAUDE.md를 수동으로 편집
code CLAUDE.md
# {{...}} 플레이스홀더를 스택으로 바꾸기

# 완료!
claude
```

---

## 정리 (선택 사항)

모든 것을 복사한 후 클론된 템플릿을 삭제할 수 있습니다:

```bash
# 프로젝트 옆에 클론한 경우:
rm -rf ../claude-code-setup

# /tmp에 클론한 경우:
rm -rf /tmp/claude-code-setup
```

---

## 문제 해결

### "복사 후 .claude/ 폴더가 보이지 않습니다"

**원인**: 잘못된 디렉토리에 있을 수 있음

**해결책**: 현재 위치 확인:
```bash
pwd  # /home/user/my-app (프로젝트)를 표시해야 함
ls -la  # .claude/ 폴더를 표시해야 함
```

### "Claude가 내 기술 스택을 모릅니다"

**원인**: `CLAUDE.md`에 여전히 `{{...}}` 플레이스홀더가 있음

**해결책**: `CLAUDE.md`를 편집하고 모든 플레이스홀더를 바꾸거나 `node setup.cjs` 실행

### "setup.cjs를 찾을 수 없습니다"

**원인**: `setup.cjs`와 `lib/`를 복사하지 않음

**해결책**: 복사하거나 마법사를 건너뛰고 `CLAUDE.md`를 수동으로 편집

---

## 다음 단계

1. [WORKFLOW.md](WORKFLOW.md) 읽기 - 완전한 워크플로우 가이드
2. `/full-feature` 시도 - Claude로 첫 번째 기능 빌드
3. 변경 사항 커밋: `git add .claude/ CLAUDE.md && git commit -m "Add Claude Code"`

---

**도움이 필요하신가요?**
- 템플릿 설정: [TEMPLATE-SETUP.md](TEMPLATE-SETUP.md)
- 메인 README: [README.md](README.md)
- 이슈: https://github.com/YOUR-ORG/claude-code-setup/issues
