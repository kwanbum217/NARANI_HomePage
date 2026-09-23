import Cocoa
import WebKit

let args = CommandLine.arguments
let base = args[1]
let pages = Array(args.dropFirst(2))

func pump(timeout: Double, until: () -> Bool) {
    let deadline = Date().addingTimeInterval(timeout)
    while !until() && Date() < deadline {
        RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.02))
    }
}

let audit = """
(function(){
  var vw = window.innerWidth;
  function inScrollContainer(el){
    var p = el.parentElement;
    while (p && p !== document.body) {
      var ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
      p = p.parentElement;
    }
    return false;
  }
  function overflow(){
    var out = [];
    [].slice.call(document.querySelectorAll('body *')).forEach(function(el){
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      // 스크롤 컨테이너 내부는 문서 폭을 밀지 않으므로 제외합니다.
      if (inScrollContainer(el)) return;
      if (r.right > vw + 1 || r.left < -1) {
        out.push((el.tagName.toLowerCase()) + '.' + String(el.className||'').split(' ').slice(0,2).join('.') + ' [' + Math.round(r.left) + '..' + Math.round(r.right) + ']');
      }
    });
    return out.slice(0, 8);
  }
  function unlabeled(){
    var out = [];
    [].slice.call(document.querySelectorAll('input:not([type=hidden]), textarea, select')).forEach(function(el){
      var id = el.id, ok = false;
      if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) ok = true;
      if (!ok && id && document.querySelector('label[for="'+id+'"]')) ok = true;
      if (!ok && el.closest('label')) ok = true;
      if (!ok) out.push(el.tagName.toLowerCase() + (id ? '#'+id : '') + ' name=' + (el.name||'-'));
    });
    return out;
  }
  function smallTargets(){
    var out = [];
    [].slice.call(document.querySelectorAll('a, button')).forEach(function(el){
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (r.height < 44 || r.width < 44) {
        var t = (el.textContent||'').trim().slice(0,18);
        if (el.closest('nav') || el.tagName === 'BUTTON') {
          out.push(el.tagName.toLowerCase() + ' "' + t + '" ' + Math.round(r.width) + 'x' + Math.round(r.height));
        }
      }
    });
    return out.slice(0, 6);
  }
  function contrast(){
    function lum(c){
      var m = c.match(/\\d+(\\.\\d+)?/g).map(Number).slice(0,3).map(function(v){
        v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
      });
      return 0.2126*m[0] + 0.7152*m[1] + 0.0722*m[2];
    }
    var b = getComputedStyle(document.body);
    var l1 = lum(b.color), l2 = lum(b.backgroundColor);
    var ratio = (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
    return Math.round(ratio*100)/100;
  }
  return JSON.stringify({
    vw: vw,
    docScrollW: document.documentElement.scrollWidth,
    hOverflow: document.documentElement.scrollWidth - vw,
    overflowing: overflow(),
    unlabeled: unlabeled(),
    smallTargets: smallTargets(),
    bodyContrast: contrast(),
    h1count: document.querySelectorAll('h1').length,
    lang: document.documentElement.lang,
    imgNoAlt: [].slice.call(document.images).filter(function(i){return !i.hasAttribute('alt');}).length
  });
})()
"""

let app = NSApplication.shared
app.setActivationPolicy(.accessory)

class Nav: NSObject, WKNavigationDelegate {
    var finished = false
    func webView(_ w: WKWebView, didFinish n: WKNavigation!) { finished = true }
    func webView(_ w: WKWebView, didFail n: WKNavigation!, withError e: Error) { finished = true }
    func webView(_ w: WKWebView, didFailProvisionalNavigation n: WKNavigation!, withError e: Error) { finished = true }
}

var issues = 0

for page in pages {
    let parts = page.split(separator: "|")
    let rel = String(parts[0])
    let size = parts.count > 1 ? String(parts[1]) : "1440x900"
    let wh = size.split(separator: "x").map { Int($0) ?? 1440 }
    let w = wh[0], h = wh.count > 1 ? wh[1] : 900

    let cfg = WKWebViewConfiguration()
    let web = WKWebView(frame: NSRect(x: 0, y: 0, width: w, height: h), configuration: cfg)
    let nav = Nav()
    web.navigationDelegate = nav

    web.load(URLRequest(url: URL(string: base + rel)!))
    pump(timeout: 25) { nav.finished }
    pump(timeout: 2.5) { false }

    var res: String?
    web.evaluateJavaScript(audit) { v, e in
        res = e != nil ? "ERR \(e!)" : (v as? String)
    }
    pump(timeout: 6) { res != nil }

    print("\n== \(rel) @\(w)px")
    if let s = res, let d = try? JSONSerialization.jsonObject(with: Data(s.utf8)) as? [String: Any] {
        print("   hOverflow: \(d["hOverflow"] ?? "?")   docScrollW: \(d["docScrollW"] ?? "?")   bodyContrast: \(d["bodyContrast"] ?? "?")")
        print("   h1: \(d["h1count"] ?? "?")  lang: \(d["lang"] ?? "?")  imgWithoutAlt: \(d["imgNoAlt"] ?? "?")")
        let over = d["overflowing"] as? [String] ?? []
        let unl = d["unlabeled"] as? [String] ?? []
        let small = d["smallTargets"] as? [String] ?? []
        if !over.isEmpty { print("   OVERFLOW: \(over)") ; issues += 1 }
        if !unl.isEmpty { print("   UNLABELED: \(unl)"); issues += 1 }
        if !small.isEmpty { print("   SMALL TARGETS: \(small)") }
        if over.isEmpty && unl.isEmpty { print("   clean") }
    } else {
        print("   \(res ?? "no result")")
    }
}

print("\n\(issues) issue group(s)")
exit(0)
