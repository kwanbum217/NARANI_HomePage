(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rep = {};
  const btns = Array.from(document.querySelectorAll('#plans button'));
  rep.planButtons = btns.length;
  rep.dialogOpenInitially = document.querySelector('dialog').open;
  btns[1].click(); await sleep(300);
  const dlg = document.querySelector('dialog');
  rep.dialogOpenAfterClick = dlg.open;
  rep.dialogTitle = (dlg.querySelector('h2') || {}).textContent || null;
  rep.dialogPrice = (dlg.querySelectorAll('dd')[2] || {}).textContent || null;
  const closeBtn = dlg.querySelector('button[aria-label]');
  if (closeBtn) { closeBtn.click(); await sleep(300); rep.dialogOpenAfterClose = dlg.open; }
  window.__it = JSON.stringify(rep);
})();
