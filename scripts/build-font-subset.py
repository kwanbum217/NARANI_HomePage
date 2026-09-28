#!/usr/bin/env python3
"""
폰트 서브셋 재생성.

Pretendard Variable 전체 폰트에서, 이 사이트가 실제로 그리는 문자만 남긴
woff2 서브셋을 만듭니다. 새 한국어 카피를 추가할 때마다 이 스크립트를 돌립니다
(그리고 scripts/check-font-subset.swift 로 누락이 없는지 확인합니다).

원본은 Pretendard 자체 배포본을 씁니다. jsDelivr gh/ 미러는 1.3.9 에서
variable/woff2 경로가 없어 404 를 돌려주므로 npm 패키지 경로를 씁니다.

사용법:
  python3 -m pip install --user fonttools brotli
  python3 scripts/build-font-subset.py

의존성: fonttools, brotli. 실행 후 폰트 파일은 public/fonts/ 에 커밋합니다.
"""
import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
OUT = ROOT / "public" / "fonts" / "pretendard-variable-subset.woff2"

# Pretendard 1.3.9 variable 전체 폰트. npm 패키지 경로만 안정적으로 提供됩니다.
SOURCE_URL = "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2"

# 렌더되는 텍스트만 모으기 위해 제거할 태그. 이 안의 문자열은 사용자에게 보이지 않습니다.
DROP_TAGS = ("script", "style")
# 보조 속성값도 화면에 보이므로 포함합니다.
ATTR_PATTERNS = (
    r'\b(?:alt|placeholder|aria-label|title)="([^"]*)"',
    r'<meta[^>]*content="([^"]*)"',
)

# 이 사이트가 실제로 그리는 가중치 범위. global.css 의 @font-face 와 맞췄습니다.
# 본문 400, 강조 600/700, b/strong(bolder), 로고 font-black 900.
# 45-930 을 그대로 두면 400 미만 구간의 델리터만 남고 파일이 29KB 커집니다.
WGHT_RANGE = (400.0, 900.0)

# 남길 OpenType 기능. 브라우저가 기본으로 켜는 자간·리겨·위치변형·기호치환과,
# global.css 의 .num 이 실제로 요청하는 tabular-nums(tnum)입니다.
# cv01~cv13, ss01~ss08, salt, pwid, subs, sups 같은 예체는 이 사이트가 쓰지
# 않으므로 제외합니다. 특히 fontTools 기본값만 쓰면 tnum 이 사라져
# 데이터 테이블 숫자가 정렬되지 않으므로 반드시 명시해야 합니다.
LAYOUT_FEATURES = [
    "ccmp", "locl", "kern", "liga", "clig", "calt", "rlig",
    "mark", "mkmk", "frac", "numr", "dnom", "case", "pnum", "tnum",
]
# 폰트 이름 테이블. family(1), subfamily(2), full(4), version(5), PS name(6) 만
# 남깁니다. 예체 이름(17)은 이 사이트가 쓰지 않습니다.
NAME_IDS = [0, 1, 2, 3, 4, 5, 6]


def collect_chars() -> str:
    """빌드된 HTML 에서 실제로 그리는 문자 집합을 모읍니다."""
    if not DIST.exists():
        sys.exit(f"dist 가 없습니다: {DIST}\n먼저 npm run build 를 실행하세요.")

    chars: set[str] = set()
    for html_file in sorted(DIST.rglob("*.html")):
        text = html_file.read_text(encoding="utf-8")
        for tag in DROP_TAGS:
            text = re.sub(rf"<{tag}[\s\S]*?</{tag}>", " ", text)
        for pattern in ATTR_PATTERNS:
            chars.update("".join(re.findall(pattern, text)))
        # 태그를 지운 뒤 남은 것이 보이는 텍스트입니다.
        chars.update(re.sub(r"<[^>]+>", " ", text))

    # 가변 폰트의 가중치 축과 이탤릭/슬래시 같은 OpenType 기능이 글리프를 요구합니다.
    # 없으면 브라우저가 합성 기울임으로 대신 그립니다.
    printable = {c for c in chars if c.strip() and ord(c) > 0x1F and not 0x7F <= ord(c) <= 0x9F}
    # 공백 글리프는 폰트 안에 없으면 브라우저가 폰트를 바꿔 그리므로, 반드시 직접 넣습니다.
    # 이게 빠지면 서브셋이 있더라도 공백 폭이 어긋나 글자가 뒤섞인 것처럼 보입니다.
    printable.add(" ")
    # 줄바꿈과 탭도 폴백 폭 계산을 막기 위해 포함합니다.
    printable.update("\n\t")
    return "".join(sorted(printable))


def main() -> None:
    chars = collect_chars()
    if not chars:
        sys.exit("수집된 문자가 없습니다. dist 에 HTML 이 있는지 확인하세요.")

    print(f"수집한 문자: {len(chars)}개")

    with tempfile.TemporaryDirectory() as tmp:
        source = Path(tmp) / "PretendardVariable.woff2"
        print(f"원본 내려받는 중: {SOURCE_URL}")
        urllib.request.urlretrieve(SOURCE_URL, source)
        if source.stat().st_size < 10_000:
            sys.exit(f"원본 크기가 비정상입니다 ({source.stat().st_size}바이트). URL 을 확인하세요.")

        OUT.parent.mkdir(parents=True, exist_ok=True)
        # 순서: 문자 서브셋 -> 가중치 축 좁히기 -> woff2 압축.
        # 축 좁히기를 먼저 하면 gvar 인스턴싱이 서브셋 글리프와 어긋나 실패하므로
        # 이 순서를 지킵니다.
        font = TTFont(str(source))
        font.flavor = None

        options = subset.Options()
        options.layout_features = LAYOUT_FEATURES
        options.name_IDs = NAME_IDS
        options.name_languages = ["*"]
        options.notdef_outline = True
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(text=chars)
        subsetter.subset(font)

        font = instancer.instantiateVariableFont(
            font, {"wght": WGHT_RANGE}, inplace=True, updateFontNames=False
        )
        font.flavor = "woff2"
        font.save(str(OUT))
        font.close()

    size = OUT.stat().st_size
    print(f"생성: {OUT.relative_to(ROOT)} ({size:,}바이트)")


if __name__ == "__main__":
    main()
