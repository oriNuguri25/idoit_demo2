# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Idoit 챌린지 플랫폼

## 프로젝트 구조

- `/src`: Vite 기반 프론트엔드 코드
- `/api`: Vercel Serverless Functions (백엔드 API)

## 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```
# 프론트엔드 환경 변수 (클라이언트에 노출됨)
VITE_BASE_URL=https://idoitproto.vercel.app
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Vercel 대시보드에서 다음 환경 변수 설정 (서버 측에서만 사용됨):

```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## Vercel 배포

1. Vercel CLI 설치

```bash
npm i -g vercel
```

2. 로그인 및 배포

```bash
vercel login
vercel
```

3. 환경 변수 설정
   Vercel 대시보드 > 프로젝트 설정 > 환경 변수에서 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY 설정

4. 배포

```bash
vercel --prod
```
