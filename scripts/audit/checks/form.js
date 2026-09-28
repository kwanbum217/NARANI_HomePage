(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rep = {};
  const fails = [];
  const check = (ok, reason) => { if (!ok) fails.push(reason); };

  // 기대 카피는 정본에서 파생해 interact.swift 가 주입합니다(scripts/audit/expected.mjs).
  const E = window.__expected && window.__expected.form;
  if (!E) {
    window.__it = JSON.stringify({ fail: '주입된 기대값 window.__expected.form 이 없습니다.' });
    return;
  }

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
  rep.successVisible = !!Array.from(document.querySelectorAll('main h2')).find(h => h.textContent.includes(E.successText));

  check(rep.submitDisabledAtRest === false, '전송 버튼이 처음부터 비활성입니다.');
  check(rep.invalidFields === 3, `빈 제출 시 무효 필드가 3개가 아닙니다 (${rep.invalidFields}개).`);
  check(rep.firstErrorText === E.nameError, `첫 오류 문구가 다릅니다 (${rep.firstErrorText}).`);
  check(rep.submitStillEnabled === true, '무효 제출 후 전송 버튼이 비활성입니다.');
  check(rep.invalidAfterFill === 0, `정상 입력 후에도 무효 필드가 남아 있습니다 (${rep.invalidAfterFill}개).`);
  check(rep.labelWhileBusy === E.busyLabel, `전송 중 라벨이 다릅니다 (${rep.labelWhileBusy}).`);
  check(rep.ariaBusyWhileBusy === 'true', `전송 중 aria-busy 가 true 가 아닙니다 (${rep.ariaBusyWhileBusy}).`);
  check(rep.successVisible === true, '접수 완료 표시가 보이지 않습니다.');
  rep.fail = fails.length ? fails.join(' ') : null;
  window.__it = JSON.stringify(rep);
})();
