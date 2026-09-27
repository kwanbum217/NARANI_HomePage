import Cocoa
import WebKit

let args = CommandLine.arguments
let base = args[1]
// each arg: page|WxH|jsFile
func pump(timeout: Double, until: () -> Bool) {
    let deadline = Date().addingTimeInterval(timeout)
    while !until() && Date() < deadline {
        RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.02))
    }
}

// 체크 스크립트는 JSON 하나를 출력하고 기대 위반 이유를 fail 에 담습니다.
// fail 이 null 이면 통과이며, 결과가 없거나 JSON 이 아니면 실패로 봅니다.
func isPass(_ out: String?) -> Bool {
    guard let out = out,
          let data = out.data(using: .utf8),
          let obj = try? JSONSerialization.jsonObject(with: data),
          let dict = obj as? [String: Any] else { return false }
    return dict["fail"] is NSNull
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory)

class Nav: NSObject, WKNavigationDelegate {
    var finished = false
    func webView(_ w: WKWebView, didFinish n: WKNavigation!) { finished = true }
    func webView(_ w: WKWebView, didFail n: WKNavigation!, withError e: Error) { finished = true }
    func webView(_ w: WKWebView, didFailProvisionalNavigation n: WKNavigation!, withError e: Error) { finished = true }
}

var failed = false

for spec in args.dropFirst(2) {
    let parts = spec.split(separator: "|").map(String.init)
    let rel = parts[0]
    let wh = parts[1].split(separator: "x").map { Int($0) ?? 390 }
    let script = try! String(contentsOfFile: parts[2], encoding: .utf8)

    let web = WKWebView(frame: NSRect(x: 0, y: 0, width: wh[0], height: wh[1]))
    let nav = Nav()
    web.navigationDelegate = nav
    web.load(URLRequest(url: URL(string: base + rel)!))
    pump(timeout: 25) { nav.finished }
    pump(timeout: 2.5) { false }

    web.evaluateJavaScript(script, completionHandler: nil)
    var out: String?
    pump(timeout: 20) {
        var got = false
        web.evaluateJavaScript("window.__it || null") { v, _ in
            if let s = v as? String { out = s; got = true }
        }
        pump(timeout: 0.6) { got }
        return got
    }
    print("\n== \(rel) @\(wh[0])x\(wh[1])  [\(parts[2])]")
    print(out ?? "  <no result / timed out>")
    if !isPass(out) { failed = true }
}

if failed {
    FileHandle.standardError.write(Data("인터랙션 검증 실패: 위 항목의 fail 을 확인하세요.\n".utf8))
}

exit(failed ? 1 : 0)
