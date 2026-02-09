# 한국 역사 시험 문제집 생성기

AI를 활용하여 한국사 시험 문제를 생성하고 PDF로 다운로드할 수 있는 웹 애플리케이션입니다.

## 기능

- 🤖 AI 문제 생성 (OpenAI GPT / Claude 지원)
- 📱 반응형 디자인 (모바일/데스크톱)
- 📝 실시간 문제 풀기 및 채점
- 📄 문제지/답안지 PDF 분리 다운로드
- ⚙️ 커스터마이징 (시대, 난이도, 문제 유형, 문제 수)

## 기술 스택

- React + TypeScript + Vite
- Tailwind CSS
- html2canvas + jsPDF
- Cloudflare Pages + Workers

## 배포

### Cloudflare Pages 배포

1. Cloudflare 로그인:
```bash
npx wrangler login
```

2. 첫 배포(미리보기/브랜치 배포):
```bash
npm run cf:deploy
```

3. 운영(main 브랜치) 배포:
```bash
npm run cf:deploy:prod
```

> `functions/` 디렉터리의 Pages Functions(`_middleware.ts`, `api/[[path]].ts`)도 함께 배포됩니다.

## 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run local

# 프로덕션 빌드
npm run build

# Cloudflare Pages 로컬 에뮬레이션 (Functions 포함)
npm run cf:simulate
```

## 환경 변수

기본값은 `wrangler.toml`의 `[vars]`에 정의되어 있습니다.
민감한 값이 필요하면 `wrangler pages secret put <KEY>`로 설정하세요.

## 라이선스

MIT
