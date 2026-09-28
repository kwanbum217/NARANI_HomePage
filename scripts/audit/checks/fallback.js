(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rep = {};
  const fails = [];
  const check = (ok, reason) => { if (!ok) fails.push(reason); };

  const E = window.__expected && window.__expected.fallback;
  if (!E) {
    window.__it = JSON.stringify({ fail: '주입된 기대값 window.__expected.fallback 가 없습니다.' });
    return;
  }

  const isVisible = el => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return el.getClientRects().length > 0 && rect.width > 0 && rect.height > 0;
  };

  // 실패 패널은 x-show 로 표시만 바뀌므로 DOM 에 항상 있고, 렌더되어야 보입니다.
  // 이 검사는 성공 경로만 봅니다. 클립보드 실패 분기는 이 환경에서 재현할 수
  // 없어(127.0.0.1 과 localhost 가 모두 보안 컨텍스트) 자동 판정하지 않습니다.
  const panel = document.querySelector('[role=alert]');
  rep.panelFound = Boolean(panel);
  rep.panelVisible = isVisible(panel);
  rep.alertRole = panel ? panel.getAttribute('role') : null;

  // 주소는 화면에 보여야 하고, 복사 버튼과 mailto 링크가 있어야 합니다.
  const addressText = E.brandEmail;
  rep.addressShown = panel ? panel.textContent.includes(addressText) : false;
  // 패널 안 mailto 가 둘입니다. 하나는 주소를 그대로 보여 주는 링크, 다른 하나는
  // '메일 열기' 버튼입니다. 어느 쪽이든 사용자가 주소를 여는 길이므로 둘 다
  // 유효해야 하지만, 주소 표시 링크는 반드시 살아 있어야 합니다.
  const mailtoLinks = panel ? Array.from(panel.querySelectorAll('a[href^="mailto:"]')) : [];
  rep.mailtoCount = mailtoLinks.length;
  const addressLink = mailtoLinks.find(a => a.textContent.trim() === addressText);
  const openLink = mailtoLinks.find(a => a !== addressLink);
  rep.addressLinkHref = addressLink ? addressLink.getAttribute('href') : null;
  rep.mailtoHref = openLink ? openLink.getAttribute('href') : null;
  const mailto = openLink || addressLink;
  rep.mailtoVisible = isVisible(mailto);
  const copyBtn = panel
    ? Array.from(panel.querySelectorAll('button')).find(b => b.textContent.trim() === E.copyLabel)
    : null;
  rep.copyButtonFound = Boolean(copyBtn);
  rep.copyButtonVisible = isVisible(copyBtn);
  rep.copyButtonNotDisabled = copyBtn ? !copyBtn.disabled : null;
  rep.copyScopeIsolated = panel ? panel.getAttribute('x-data') !== null : false;

  check(rep.panelFound, '전송 실패 degrade 패널을 찾지 못했습니다.');
  check(rep.alertRole === 'alert', '패널에 role=alert 가 없어 보조기술에 알려지지 않습니다.');
  // 전송 전에는 패널이 숨겨져 있어야 합니다. 그래서 아래 렌더 판정은
  // 실제 실패를 만든 뒤에 합니다. 숨겨진 상태에서 보이지 않는 것은 결함이 아닙니다.
  check(rep.panelVisible === false, '전송 전인데 실패 패널이 이미 보입니다.');
  check(rep.addressShown, `패널에 지원 주소(${addressText})가 들어 있지 않습니다.`);
  check(rep.mailtoCount >= 1, '패널 안에 mailto 링크가 없습니다.');
  check(rep.addressLinkHref === 'mailto:' + addressText,
    `주소 표시 링크가 죽었습니다 (${rep.addressLinkHref}).`);
  check(rep.mailtoHref === 'mailto:' + addressText, `메일 열기 링크가 다릅니다 (${rep.mailtoHref}).`);
  check(rep.copyButtonFound, `복사 버튼("${E.copyLabel}")을 찾지 못했습니다.`);
  check(rep.copyButtonNotDisabled === true, '대기 상태에서 복사 버튼이 비활성입니다.');
  check(rep.copyScopeIsolated, '복사 상태를 쓰는 x-data 스코프가 없습니다.');

  // 패널을 실제로 보여 주고, 안의 요소가 보이는지 봅니다.
  // 감춘 요소를 눌러 복사 상태까지 확인하되, 시각 판정은 패널을 연 뒤에 합니다.
  if (panel) {
    const prev = panel.style.display;
    panel.style.display = 'block';
    await sleep(80);
    rep.mailtoVisible = isVisible(mailto);
    rep.copyButtonVisible = isVisible(copyBtn);
    panel.style.display = prev;
    check(rep.mailtoVisible, '패널이 열렸는데 mailto 링크가 렌더되지 않습니다.');
    check(rep.copyButtonVisible, '패널이 열렸는데 복사 버튼이 보이지 않습니다.');
  }

  // 실제로 눌러 상태 전이를 봅니다.
  // 클립보드 결과는 환경에 따라 달라집니다. 이 저장소는 127.0.0.1 과 localhost 가
  // 모두 보안 컨텍스트라 성공해야 하지만, 헤드리스 실행이나 탭 제약으로 거절될
  // 수 있습니다. 그래서 두 결과 라벨을 모두 정당한 결과로 인정합니다.
  // 중간 라벨("담는 중")은 인정하지 않습니다. 클릭 후 600ms 안에 끝나야 하므로
  // 아직 담는 중이면 멈춘 것입니다.
  if (copyBtn) {
    copyBtn.click();
    await sleep(120);
    rep.labelRightAfterClick = copyBtn.textContent.trim();
    await sleep(600);
    rep.labelAfterClick = copyBtn.textContent.trim();
    rep.ariaBusy = copyBtn.getAttribute('aria-busy');
    check(
      rep.labelAfterClick !== E.copyLabel,
      `복사 버튼을 눌렀는데 라벨이 바뀌지 않습니다 (${rep.labelAfterClick}).`,
    );
    check(
      [E.copiedLabel, E.copyFailedLabel].includes(rep.labelAfterClick),
      `누른 뒤 라벨이 완료 상태가 아닙니다 (${rep.labelAfterClick}).`,
    );
    // 결과가 어느 쪽이든 mailto 링크는 그대로 남아 있어야 합니다.
    // 복사가 실패한 사용자에게 남는 유일한 길입니다.
    check(
      rep.mailtoHref === 'mailto:' + addressText,
      '복사 후 mailto 링크가 사라졌습니다.',
    );
  }

  rep.fail = fails.length ? fails.join(' ') : null;
  window.__it = JSON.stringify(rep);
})();
