#!/usr/bin/env swift
// 폰트 서브셋 누락 검사 (CoreText 렌더 폭 기반).
//
// public/fonts/ 의 woff2 서브셋은 빌드된 페이지가 실제로 그리는 문자만 담습니다.
// 새 한국어 카피가 추가되면 서브셋에 없는 글자가 생기고, 그 글자는 시스템 폰트로
// 폴백해 시각적으로 뒤섞인 채로 배포됩니다. 링크 무결성 검사로는 잡히지 않으므로
// 여기서 명시적으로 실패시킵니다.
//
// 판정 방법: 서브셋 폰트로만 그릴 때의 폭과, 시스템 폰트까지 이어 붙인 스택으로
// 그릴 때의 폭을 비교합니다. 두 폭이 다르면 그 글자는 서브셋에 없어 폴백된 것입니다.
// CTFontGetGlyphsForCharacters 는 없는 문자에도 .notdef glyph 를 돌려줘서 구분에
// 쓸 수 없습니다. 실제 폰트 선택 결과를 폭으로 확인하는 편이 정확합니다.
//
// 사용법: swift scripts/check-font-subset.swift <dist경로> [폰트경로]

import Foundation
import CoreText
import AppKit

let args = CommandLine.arguments
guard args.count >= 2 else {
    FileHandle.standardError.write("사용법: swift scripts/check-font-subset.swift <dist경로> [폰트경로]\n".data(using: .utf8)!)
    exit(2)
}

let dist = URL(fileURLWithPath: args[1], isDirectory: true)
let fontURL = args.count >= 3
    ? URL(fileURLWithPath: args[2])
    : URL(fileURLWithPath: "public/fonts/pretendard-variable-subset.woff2")

var isDir: ObjCBool = false
guard FileManager.default.fileExists(atPath: dist.path, isDirectory: &isDir), isDir.boolValue else {
    FileHandle.standardError.write("dist 경로가 없습니다: \(dist.path)\n먼저 npm run build 를 실행하세요.\n".data(using: .utf8)!)
    exit(1)
}
guard FileManager.default.fileExists(atPath: fontURL.path) else {
    FileHandle.standardError.write("폰트 파일이 없습니다: \(fontURL.path)\n".data(using: .utf8)!)
    exit(1)
}

var htmlFiles: [URL] = []
if let walker = FileManager.default.enumerator(at: dist, includingPropertiesForKeys: nil) {
    for case let url as URL in walker where url.pathExtension == "html" {
        htmlFiles.append(url)
    }
}
guard !htmlFiles.isEmpty else {
    FileHandle.standardError.write("dist 에 HTML 이 없습니다: \(dist.path)\n".data(using: .utf8)!)
    exit(1)
}

// 서브셋 폰트를 한 번만 등록합니다.
// 이름은 임의로 정하지 않습니다. 등록된 폰트의 실제 PostScript 이름을 그대로 써야
// 그 폰트로 그려집니다(가짜 이름이면 CoreText 가 다른 폰트로 대체해 조용히 오탐합니다).
guard let provider = CGDataProvider(url: fontURL as CFURL),
      let cgFont = CGFont(provider) else {
    FileHandle.standardError.write("폰트를 읽지 못했습니다: \(fontURL.path)\n".data(using: .utf8)!)
    exit(1)
}
var regError: Unmanaged<CFError>?
guard CTFontManagerRegisterGraphicsFont(cgFont, &regError) else {
    FileHandle.standardError.write("서브셋 폰트를 등록하지 못했습니다: \(fontURL.path)\n".data(using: .utf8)!)
    exit(1)
}
defer { CTFontManagerUnregisterGraphicsFont(cgFont, nil) }

guard let psName = cgFont.postScriptName as String? else {
    FileHandle.standardError.write("폰트의 PostScript 이름을 읽지 못했습니다.\n".data(using: .utf8)!)
    exit(1)
}

// 렌더할 문자 수집
var candidates = Set<Character>()
var charToFiles: [Character: Set<String>] = [:]

for file in htmlFiles {
    guard let html = try? String(contentsOf: file, encoding: .utf8) else { continue }
    var visible = html
    for tag in ["script", "style"] {
        visible = visible.replacingOccurrences(
            of: "<\(tag)[\\s\\S]*?</\(tag)>",
            with: " ",
            options: .regularExpression
        )
    }
    var attrs = ""
    for pattern in [
        "\\b(?:alt|placeholder|aria-label|title)=\"([^\"]*)\"",
        "<meta[^>]*content=\"([^\"]*)\"",
    ] {
        if let re = try? NSRegularExpression(pattern: pattern) {
            let ns = visible as NSString
            for m in re.matches(in: visible, range: NSRange(location: 0, length: ns.length)) {
                attrs += ns.substring(with: m.range(at: 1)) + " "
            }
        }
    }
    let stripped = visible.replacingOccurrences(
        of: "<[^>]+>",
        with: " ",
        options: .regularExpression
    )
    let relative = file.path.replacingOccurrences(of: dist.path + "/", with: "")
    for scalar in (stripped + " " + attrs).unicodeScalars {
        // 제어문자와 공백은 폭 판정이 의미를 갖지 않습니다.
        if scalar.value < 0x21 { continue }
        if scalar.value >= 0x7f && scalar.value <= 0x9f { continue }
        let ch = Character(String(scalar))
        candidates.insert(ch)
        charToFiles[ch, default: []].insert(relative)
    }
}

guard !candidates.isEmpty else {
    print("검사할 문자가 없습니다.")
    exit(0)
}

let fontSize = 40.0
let subsetFont = NSFont(name: psName, size: fontSize)
    ?? (CTFontCreateWithGraphicsFont(cgFont, fontSize, nil, nil) as NSFont)
let systemFont = NSFont.systemFont(ofSize: fontSize)

/// CTLine 으로 실제 폰트 선택 결과의 폭을 잽니다.
/// fallbackDescriptors 는 서브셋 폰트 다음에 이어 붙일 폴백 목록입니다.
/// 빈 배열이면 서브셋 폰트만으로 그리고, 차이는 폴백이 개입했다는 뜻입니다.
func width(_ ch: Character, fallbackDescriptors: [CTFontDescriptor]) -> CGFloat {
    var descriptor = subsetFont.fontDescriptor as CTFontDescriptor
    if !fallbackDescriptors.isEmpty {
        // kCTFontCascadeListAttribute 로 서브셋 폰트 뒤에 폴백 목록을 붙입니다.
        let attrs: [CFString: Any] = [
            kCTFontCascadeListAttribute: fallbackDescriptors as CFArray,
        ]
        descriptor = CTFontDescriptorCreateCopyWithAttributes(
            descriptor,
            attrs as CFDictionary
        ) as CTFontDescriptor
    }
    let cfFont = CTFontCreateWithFontDescriptor(descriptor, fontSize, nil)
    let attributed = NSAttributedString(
        string: String(ch),
        attributes: [.font: cfFont]
    )
    let line = CTLineCreateWithAttributedString(attributed)
    return CGFloat(CTLineGetTypographicBounds(line, nil, nil, nil))
}

var missing: [(Character, [String])] = []
let systemDescriptor = systemFont.fontDescriptor as CTFontDescriptor
for ch in candidates.sorted() {
    let onlySubset = width(ch, fallbackDescriptors: [])
    let withFallback = width(ch, fallbackDescriptors: [systemDescriptor])
    // 폭이 다르면 폴백이 개입한 것입니다. 미세한 반올림 오차는 무시합니다.
    if abs(onlySubset - withFallback) > 0.5 {
        missing.append((ch, charToFiles[ch]!.sorted()))
    }
}

if missing.isEmpty {
    print("폰트 서브셋에 누락된 글자가 없습니다 (검사 문자 \(candidates.count)개).")
    exit(0)
}

FileHandle.standardError.write(
    "폰트 서브셋에 없는 글자가 있습니다. 새 카피를 추가했다면 서브셋을 다시 만드세요.\n".data(using: .utf8)!
)
for (ch, files) in missing {
    let hex = String(format: "U+%04X", ch.unicodeScalars.first!.value)
    FileHandle.standardError.write("  \"\(ch)\" (\(hex)) — \(files.joined(separator: ", "))\n".data(using: .utf8)!)
}
exit(1)
