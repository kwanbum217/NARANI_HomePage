(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rep = {};
  const fails = [];
  const check = (ok, reason) => { if (!ok) fails.push(reason); };

  // 기대 카피는 정본에서 파생해 interact.swift 가 주입합니다(scripts/audit/expected.mjs).
  const E = window.__expected && window.__expected.dialog;
  if (!E) {
    window.__it = JSON.stringify({ fail: '주입된 기대값 window.__expected.dialog 가 없습니다.' });
    return;
  }

  const btns = Array.from(document.querySelectorAll('#plans button'));
  rep.planButtons = btns.length;
  rep.dialogOpenInitially = document.querySelector('dialog').open;
  btns[E.planIndex].click(); await sleep(300);
  const dlg = document.querySelector('dialog');
  rep.dialogOpenAfterClick = dlg.open;
  rep.dialogTitle = (dlg.querySelector('h2') || {}).textContent || null;
  rep.dialogPrice = (dlg.querySelectorAll('dd')[2] || {}).textContent || null;
  const closeBtn = dlg.querySelector('button[aria-label]');
  if (closeBtn) { closeBtn.click(); await sleep(300); rep.dialogOpenAfterClose = dlg.open; }

  check(rep.planButtons === 5, `요금 구매 버튼이 5개가 아닙니다 (${rep.planButtons}개).`);
  check(rep.dialogOpenInitially === false, '다이얼로그가 처음부터 열려 있습니다.');
  check(rep.dialogOpenAfterClick === true, '구매 버튼을 눌러도 다이얼로그가 열리지 않습니다.');
  check(rep.dialogTitle === E.title, `다이얼로그 제목이 다릅니다 (${rep.dialogTitle}).`);
  check(rep.dialogPrice === E.price, `다이얼로그 금액이 다릅니다 (${rep.dialogPrice}).`);
  check(rep.dialogOpenAfterClose === false, '닫기 후에도 다이얼로그가 열려 있습니다.');
  rep.fail = fails.length ? fails.join(' ') : null;
  window.__it = JSON.stringify(rep);
})();
