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

  // '주문 상품' 표시 패널을 찾습니다. x-show 로 표시만 바뀌므로
  // DOM 에 항상 있고, 렌더된 사각형이 있을 때만 보입니다.
  const panel = Array.from(document.querySelectorAll('main p')).find(p =>
    p.querySelector('span.label') && p.querySelector('strong'),
  );
  const labelEl = panel ? panel.querySelector('span.label') : null;
  const valueEl = panel ? panel.querySelector('strong') : null;
  const isVisible = el => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return el.getClientRects().length > 0 && rect.width > 0 && rect.height > 0;
  };

  rep.panelFound = Boolean(panel);
  rep.labelText = labelEl ? labelEl.textContent.trim() : null;
  rep.valueText = valueEl ? valueEl.textContent.trim() : null;
  rep.panelVisible = isVisible(panel);
  rep.valueRendered = isVisible(valueEl);
  rep.statusRole = panel ? panel.getAttribute('role') : null;

  check(rep.panelFound, '주문 상품 표시 패널을 찾지 못했습니다.');
  check(rep.labelText === E.topicPrefix, `패널 라벨이 다릅니다 (${rep.labelText}).`);
  check(rep.panelVisible === true, '유효한 plan 쿼리가 있는데 주문 상품 패널이 보이지 않습니다.');
  check(rep.valueText === E.planLabel, `표시된 상품명이 다릅니다 (${rep.valueText}).`);
  check(rep.valueRendered === true, '상품명 텍스트가 렌더되지 않았습니다.');
  // x-text 를 쓰므로 라벨 값이 HTML 로 해석되지 않습니다. 다만 검사 단계에서
  // 실제로 값이 화면 문자열로만 들어갔는지 확인합니다.
  check(!/<[a-z/]/i.test(rep.valueText || ''), '상품명 자리에 태그가 그대로 보입니다.');
  check(rep.statusRole === 'status', '패널에 role=status 가 없어 스크린리더에 알려지지 않습니다.');

  rep.fail = fails.length ? fails.join(' ') : null;
  window.__it = JSON.stringify(rep);
})();
