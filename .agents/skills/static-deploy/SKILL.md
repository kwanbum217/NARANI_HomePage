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

현재 값은 확정 전 임시값입니다. 도메인이 정해지면 이 값을 바꾸고 재빌드합니다.

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

외부에서 불러오는 리소스는 Pretendard 폰트 CDN 하나입니다. CSP 를 도입할 경우
`cdn.jsdelivr.net` 을 허용해야 합니다.

## 배포 전 체크리스트

- [ ] `npm run verify` 통과
- [ ] `site` 값이 실제 도메인
- [ ] 열린 항목 중 미연결 기능(폼, 결제)이 공개되어도 문제가 없는지 확인
      [`../../docs/context/CURRENT_STATE.md`](../../docs/context/CURRENT_STATE.md) 4장
- [ ] WebKit 외 브라우저와 실기기에서 육안 확인
- [ ] 이전 배포로 되돌리는 방법 확인

## 롤백

정적 산출물이므로 이전 배포를 다시 올리면 됩니다. 커밋 단위로 재생성할 수 있습니다.

```bash
git checkout <커밋>
npm run build
# 업로드
```

## 미구현

| 항목 | 상태 |
| --- | --- |
| 배포 자동화 | 미구성. 호스팅 연결 후 GitHub Actions 로 `dist/` 업로드 예정 |
| `sitemap.xml` | 미추가. `@astrojs/sitemap` 으로 추가 가능 |
| `robots.txt` | 미추가 |
| OG 이미지 | 미추가. `public/` 에 두고 `BaseLayout` 메타에 연결 |
| 배포 후 스모크 테스트 | 미구성 |
