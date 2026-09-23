# 빌드와 배포

> **작성일**: 2026-09-23
> **버전**: v1.0.0
> **대상**: 로컬 개발, 빌드 산출물, 정적 배포

---

## 1. 로컬 개발

```bash
npm install        # 최초 1회
npm run dev        # 개발 서버, 변경 시 자동 갱신
```

개발 서버는 소스(`src/`)를 직접 읽습니다. 루트에 HTML 을 두고 직접 여는 방식은 더 이상
동작하지 않습니다. 반드시 `npm run dev` 또는 빌드 후 `npm run preview` 를 사용합니다.

---

## 2. 빌드

```bash
npm run build
```

| 항목 | 값 |
| --- | --- |
| 출력 모드 | `static` |
| 출력 위치 | `dist/` |
| 생성 페이지 | 7 |
| 라우트 형식 | `directory` (예: `/bidbox/service/index.html`) |
| 소요 시간 | 1초 미만 (측정값은 [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md)) |

빌드 산출물 구조:

```
dist/
├── index.html
├── company/index.html
├── bidbox/index.html
├── bidbox/{service,pricing,demo,contact}/index.html
└── _astro/            번들된 CSS 와 JS (해시 파일명)
```

클라이언트 JS 는 Alpine 을 포함한 단일 번들이며, 각 페이지가 모듈로 로드합니다.

---

## 3. 미리보기와 검증

```bash
npm run preview    # 빌드 결과를 로컬에서 확인
npm run verify     # 빌드 + 링크 + 렌더 + 접근성 + 인터랙션 검증
npm run links      # 링크 무결성만 검사
```

`npm run verify` 는 macOS WebKit 을 사용합니다. 상세는
[`../spec/QA_AND_A11Y.md`](../spec/QA_AND_A11Y.md) 를 참조하십시오.

---

## 4. 배포

정적 호스팅이면 어디든 동작합니다. 배포 대상은 **프로젝트 루트가 아니라 `dist/`** 입니다.

| 호스팅 | 설정 |
| --- | --- |
| Cloudflare Pages | 빌드 명령 `npm run build`, 출력 디렉터리 `dist` |
| Netlify | `netlify.toml` 에 `command = "npm run build"`, `publish = "dist"` |
| Vercel | 프레임워크 프리셋 Astro, 출력 `dist` |
| S3 + CloudFront | `dist/` 를 업로드. 기본 문서 `index.html`, 하위 디렉터리 인덱스 처리 필요 |

### 4.1 도메인 전환

`astro.config.mjs` 의 `site` 값이 canonical 과 OG URL 의 기준입니다. 실제 도메인이
정해지면 이 한 곳만 바꿉니다.

```js
export default defineConfig({
  site: 'https://narani.my',
  // ...
});
```

현재 값은 확정 전 임시값입니다.

### 4.2 권장 캐시 헤더

| 경로 | Cache-Control | 이유 |
| --- | --- | --- |
| `/_astro/*` | `public, max-age=31536000, immutable` | 파일명에 해시 포함 |
| `/*.html` | `public, max-age=0, must-revalidate` | 배포 즉시 반영 |
| 그 외 | `public, max-age=3600` | - |

### 4.3 보안 헤더

정적 사이트이므로 다음을 권장합니다.

```
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: SAMEORIGIN
```

외부에서 불러오는 리소스는 Pretendard 폰트 CDN(jsDelivr) 하나입니다. CSP 를 도입할
경우 이 도메인을 허용해야 합니다.

---

## 5. 배포 전 체크리스트

- [ ] `npm run verify` 통과
- [ ] `astro.config.mjs` 의 `site` 값이 실제 도메인
- [ ] 열린 항목 중 미연결 기능이 공개 페이지에 노출되어도 문제가 없는지 확인
      ([`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 4장)
- [ ] 3종 브라우저 육안 확인 (검증 도구는 WebKit 단일)
- [ ] 스크린샷 또는 실제 기기에서 모바일 확인

---

## 6. 롤백

정적 호스팅이므로 이전 배포를 다시 올리면 됩니다. 산출물은 커밋에 대응하므로
`git checkout <커밋>` 후 `npm run build` 로 재생성할 수 있습니다.

---

## 7. 미구현

| 항목 | 상태 |
| --- | --- |
| `sitemap.xml` | 미추가. Astro sitemap 통합으로 추가 예정 |
| `robots.txt` | 미추가 |
| OG 이미지 | 미추가. `public/` 에 이미지를 두고 `BaseLayout` 에 메타 추가 필요 |
| 배포 자동화 | 미구성. 호스팅 연결 후 GitHub Actions 로 `dist/` 업로드 예정 |
| 분석 도구 | 미도입 |
