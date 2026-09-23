(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rep = {};
  const form = document.querySelector('main form');
  const submit = form.querySelector('button[type=submit]');
  rep.submitDisabledAtRest = submit.disabled;
  // 1) invalid submit
  submit.click(); await sleep(300);
  rep.invalidFields = document.querySelectorAll('.field.is-invalid').length;
  rep.firstErrorText = (document.querySelector('.field .error') || {}).textContent || null;
  rep.submitStillEnabled = !submit.disabled;
  // 2) fill valid values
  const set = (el, val) => { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); };
  set(document.querySelector('input[type=text]'), '나란히물류');
  set(document.querySelector('input[type=email]'), 'ops@narani.my');
  set(document.querySelector('textarea'), '경비 용역 입찰 예상 낙찰가와 근거를 확인하고 싶습니다.');
  await sleep(200);
  rep.invalidAfterFill = document.querySelectorAll('.field.is-invalid').length;
  submit.click();
  await sleep(200);
  rep.labelWhileBusy = submit.textContent.trim().replace(/\s+/g, ' ');
  rep.ariaBusyWhileBusy = submit.getAttribute('aria-busy');
  await sleep(1800);
  rep.successVisible = !!Array.from(document.querySelectorAll('main h2')).find(h => /접수되었습니다/.test(h.textContent));
  window.__it = JSON.stringify(rep);
})();
