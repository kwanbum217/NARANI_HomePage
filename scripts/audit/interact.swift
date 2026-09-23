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

let app = NSApplication.shared
app.setActivationPolicy(.accessory)

class Nav: NSObject, WKNavigationDelegate {
    var finished = false
    func webView(_ w: WKWebView, didFinish n: WKNavigation!) { finished = true }
    func webView(_ w: WKWebView, didFail n: WKNavigation!, withError e: Error) { finished = true }
    func webView(_ w: WKWebView, didFailProvisionalNavigation n: WKNavigation!, withError e: Error) { finished = true }
}

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
}

exit(0)
