---
name: static-deploy
description: dist/ 를 정적 호스팅에 배포하고 도메인, 캐시, 보안 헤더를 설정하는 절차입니다. 첫 배포나 도메인 전환 시 사용합니다.
---

# static-deploy

## 배포 대상

항상 `dist/` 입니다. 프로젝트 루트를 올리지 않습니다. 루트에는 소스만 있고 빌드된
HTML 이 없습니다.

```bash
npm run verify     # 배포 전 필수
npm run build      # dist/ 생성
```

## 호스팅 설정

| 호스팅 | 설정 |
| --- | --- |
| Cloudflare Pages | 빌드 명령 `npm run build`, 출력 `dist` |
| Netlify | `netlify.toml` 에 `command = "npm run build"`, `publish = "dist"` |
| Vercel | Astro 프리셋, 출력 `dist` |
| S3 + CloudFront | `dist/` 업로드. 인덱스 문서와 하위 디렉터리 인덱스 설정 필요 |

## 도메인 전환

`astro.config.mjs` 의 `site` 값이 canonical 과 OG URL 의 기준입니다. 한 곳만 고칩니다.

```js
export default defineConfig({
  site: 'https://narani.my',
});
```

`site` 의 현재 값은 `https://narani.my` 입니다. 공개 도메인이 이 값과 같으면 바꾸지
않습니다. 다른 도메인으로 정했을 때만 이 한 곳을 바꾸고 다시 빌드합니다. 호스트 선택과
DNS 연결, 첫 배포는 사람이 정하기 전에는 진행하지 않습니다.

## 캐시 헤더

| 경로 | Cache-Control |
| --- | --- |
| `/_astro/*` | `public, max-age=31536000, immutable` |
| `/*.html` | `public, max-age=0, must-revalidate` |
| 그 외 | `public, max-age=3600` |

`_astro/` 파일명에는 콘텐츠 해시가 포함되므로 장기 캐시가 안전합니다. HTML 은 배포 즉시
반영되어야 하므로 캐시하지 않습니다.

## 보안 헤더

```
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: SAMEORIGIN
```

폰트는 `public/fonts/pretendard-variable-subset.woff2` 로 self-host 하며
`src/layouts/BaseLayout.astro` 에서 preload 합니다. 외부에서 불러오는 것은 분석 도구
스크립트 하나입니다. 측정 ID 가 있을 때 `src/layouts/BaseLayout.astro` 가
`https://www.googletagmanager.com/gtag/js` 를 불러옵니다. 측정 ID 의 유무와 값은
[`../../../docs/context/CURRENT_STATE.md`](../../../docs/context/CURRENT_STATE.md) 1장이
정본입니다. 나중에 CSP 를 도입할 때는 이 스크립트 출처를 허용해야 합니다.
호스트 설정 파일은 만들지 않습니다.

## 배포 전 체크리스트

- [ ] `npm run verify` 통과
- [ ] `site` 값이 실제 도메인
- [ ] 열린 항목 중 미연결 기능(폼, 결제)이 공개되어도 문제가 없는지 확인
      같은 정본 4장
- [ ] WebKit 외 브라우저와 실기기에서 육안 확인
- [ ] 이전 배포로 되돌리는 방법 확인

## 롤백

정적 산출물이므로 이전 배포를 다시 올리면 됩니다. 커밋 단위로 재생성할 수 있습니다.

```bash
git checkout <커밋>
npm run build
# 업로드
```

## 구현 상태

| 항목 | 상태 |
| --- | --- |
| `sitemap.xml` | 구현 완료. 근거: `src/pages/sitemap.xml.ts` (prerendered 엔드포인트) |
| `robots.txt` | 구현 완료. 근거: `src/pages/robots.txt.ts` (prerendered 엔드포인트) |
| OG 이미지 | 구현 완료. 근거: `public/og.svg`, `public/og.png`, `src/layouts/BaseLayout.astro` 의 og/twitter 메타 |
| 분석 도구 | 연결. 측정 ID 가 있을 때만 GA4 태그가 삽입됩니다. 근거: `src/layouts/BaseLayout.astro`, 같은 정본 1장 |
| 배포 자동화 | 미구성. 호스팅 연결 후 GitHub Actions 로 `dist/` 업로드 예정 |
| 배포 후 스모크 테스트 | 미구성 |
