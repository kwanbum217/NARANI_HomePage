import Cocoa
import WebKit

let args = CommandLine.arguments
let base = args[1]
let outDir = args[2]
let pages = Array(args.dropFirst(3))
try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

func pump(timeout: Double, until: () -> Bool) {
    let deadline = Date().addingTimeInterval(timeout)
    while !until() && Date() < deadline {
        RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.02))
    }
}

let hook = """
(function(){
  window.__diag = { errors: [], warnings: [] };
  var oe = console.error, ow = console.warn;
  console.error = function(){ window.__diag.errors.push([].slice.call(arguments).map(String).join(' ')); oe.apply(console, arguments); };
  console.warn  = function(){ window.__diag.warnings.push([].slice.call(arguments).map(String).join(' ')); ow.apply(console, arguments); };
  window.addEventListener('error', function(e){ window.__diag.errors.push('onerror: ' + (e.message||'') + ' @ ' + (e.filename||'') + ':' + (e.lineno||0)); });
  window.addEventListener('unhandledrejection', function(e){ window.__diag.errors.push('unhandledrejection: ' + String(e.reason)); });
})();
"""

let probe = """
(function(){
  function lum(c){
    var m = String(c).match(/\\d+(\\.\\d+)?/g); if(!m) return 0;
    var v = m.slice(0,3).map(Number).map(function(x){ x/=255; return x<=0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055,2.4); });
    return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2];
  }
  var b = getComputedStyle(document.body);
  var l1 = lum(b.color), l2 = lum(b.backgroundColor);
  var cta = document.querySelector('header nav a.btn-primary');
  var hubCard = document.querySelector('main a.card');
  return JSON.stringify({
    errors: (window.__diag && window.__diag.errors) || [],
    warnings: (window.__diag && window.__diag.warnings) || [],
    brokenImages: [].slice.call(document.images||[]).filter(function(i){return !i.complete||i.naturalWidth===0;}).map(function(i){return i.getAttribute('src');}),
    alpine: typeof window.Alpine !== 'undefined',
    title: document.title,
    h1: document.querySelector('h1') ? document.querySelector('h1').textContent.trim().replace(/\\s+/g,' ') : null,
    bodyBg: b.backgroundColor,
    bodyColor: b.color,
    contrast: Math.round((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)*100)/100,
    ctaHeight: cta ? Math.round(cta.getBoundingClientRect().height) : null,
    hubCardPadding: hubCard ? getComputedStyle(hubCard).paddingTop : null,
    plans: document.querySelectorAll('#plans li.card').length,
    dialog: !!document.querySelector('dialog'),
    headerHrefs: [].slice.call(document.querySelectorAll('header nav a')).map(function(a){return a.getAttribute('href');}),
    footerText: (document.querySelector('footer p')||{}).textContent ? document.querySelector('footer p').textContent.trim().replace(/\\s+/g,' ') : null
  });
})()
"""

let app = NSApplication.shared
app.setActivationPolicy(.accessory)

class Nav: NSObject, WKNavigationDelegate {
    var finished = false
    func webView(_ w: WKWebView, didFinish n: WKNavigation!) { finished = true }
    func webView(_ w: WKWebView, didFail n: WKNavigation!, withError e: Error) {
        print("  NAV-FAIL: \(e.localizedDescription)"); finished = true
    }
    func webView(_ w: WKWebView, didFailProvisionalNavigation n: WKNavigation!, withError e: Error) {
        print("  PROVISIONAL-FAIL: \(e.localizedDescription)"); finished = true
    }
}

var fails = 0

for spec in pages {
    let parts = spec.split(separator: "|").map(String.init)
    let p = parts[0]
    let wh = (parts.count > 1 ? parts[1] : "1440x1700").split(separator: "x").map { Int($0) ?? 1440 }
    let w = wh[0], h = wh.count > 1 ? wh[1] : 1700

    let cfg = WKWebViewConfiguration()
    let ucc = WKUserContentController()
    ucc.addUserScript(WKUserScript(source: hook, injectionTime: .atDocumentStart, forMainFrameOnly: true))
    cfg.userContentController = ucc

    let web = WKWebView(frame: NSRect(x: 0, y: 0, width: w, height: h), configuration: cfg)
    let nav = Nav()
    web.navigationDelegate = nav

    print("\n== \(p) @\(w)")
    web.load(URLRequest(url: URL(string: base + p)!))
    pump(timeout: 25) { nav.finished }
    pump(timeout: 3) { false }

    var res: String?
    var snapDone = false
    web.evaluateJavaScript(probe) { v, e in
        res = e != nil ? "EVAL-ERR \(e!)" : (v as? String)
    }
    pump(timeout: 6) { res != nil }
    if let r = res {
        print("  \(r)")
        if r.contains("\"errors\":[\"") || r.contains("EVAL-ERR") || r.contains("NAV-FAIL") { fails += 1 }
    } else { print("  <no result>") }

    let name = p == "/" ? "root" : p.trimmingCharacters(in: CharacterSet(charactersIn: "/")).replacingOccurrences(of: "/", with: "_")
    let shot = URL(fileURLWithPath: outDir).appendingPathComponent("\(name).png")
    let sc = WKSnapshotConfiguration()
    sc.rect = NSRect(x: 0, y: 0, width: w, height: h)
    web.takeSnapshot(with: sc) { img, _ in
        if let img = img, let t = img.tiffRepresentation, let rep = NSBitmapImageRep(data: t),
           let png = rep.representation(using: .png, properties: [:]) {
            try? png.write(to: shot)
            print("  shot: \(shot.lastPathComponent)")
        }
        snapDone = true
    }
    pump(timeout: 12) { snapDone }
}

print("\n\(fails) page(s) with JS errors")
exit(0)
