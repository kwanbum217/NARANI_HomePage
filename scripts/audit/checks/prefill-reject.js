(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rep = {};
  const fails = [];
  const check = (ok, reason) => { if (!ok) fails.push(reason); };

  const E = window.__expected && window.__expected.prefill;
  if (!E) {
    window.__it = JSON.stringify({ fail: '주입된 기대값 window.__expected.prefill 가 없습니다.' });
    return;
  }

  // 거절 케이스입니다. 화이트리스트에 없는 값이므로 주문 상품 패널이 숨겨져야 합니다.
  // 읽은 쿼리 값은 그대로 보고해, 무엇이 들어왔는지 판정이 추측에 의존하지 않게 합니다.
  const raw = new URLSearchParams(window.location.search).get('plan');
  rep.planQuery = raw;
  rep.decodedQuery = raw ? raw.replace(/\+/g, ' ') : null;

  const panel = Array.from(document.querySelectorAll('main p')).find(p =>
    p.querySelector('span.label') && p.querySelector('strong'),
  );
  const valueEl = panel ? panel.querySelector('strong') : null;
  const isVisible = el => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return el.getClientRects().length > 0 && rect.width > 0 && rect.height > 0;
  };

  rep.panelFound = Boolean(panel);
  rep.valueText = valueEl ? valueEl.textContent.trim() : null;
  rep.panelVisible = isVisible(panel);
  rep.valueRendered = isVisible(valueEl);

  // 거절 판정은 화면으로 합니다. Alpine 내부 상태(private 필드)를 읽으면
  // Alpine 버전마다 형태가 달라 조용히 false 가 되어 검사가 통과합니다.
  // 값이 남았다면 x-show 이 패널을 보이게 하므로 화면 판정이 곧 상태 판정입니다.
  check(rep.panelVisible === false, `거절되어야 하는 plan 값이 화면에 보입니다 (${rep.valueText}).`);
  check(rep.valueRendered === false, '거절되었는데 상품명 텍스트가 렌더되어 있습니다.');
  check(rep.valueText === '', `거절되었는데 상품명 자리에 값이 남습니다 (${rep.valueText}).`);

  rep.fail = fails.length ? fails.join(' ') : null;
  window.__it = JSON.stringify(rep);
})();
