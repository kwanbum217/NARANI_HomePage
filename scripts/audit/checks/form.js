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

  // 이 스크립트는 contact 와 demo 두 페이지에서 돕니다. 페이지마다 카피와 필드가
  // 다르므로 location.pathname 으로 자기 페이지의 기대값을 고릅니다.
  // 쿼리(?plan=...)는 pathname 에 들어오지 않으므로 판정에 영향을 주지 않습니다.
  const isDemo = /\/demo\/?$/.test(location.pathname);
  const page = isDemo ? 'demo' : 'contact';
  const flow = (isDemo && E.demo) || {
    nameError: E.nameError,
    busyLabel: E.busyLabel,
    successText: E.successText,
  };
  const fields = (E.fields && E.fields[page]) || null;

  const form = document.querySelector('main form');
  const submit = form.querySelector('button[type=submit]');

  // 정적 필드 속성(aria-required / maxlength)을 정본 파생 기대값과 대조합니다.
  // 값이 서버에서 렌더되는 속성이라 검사 시점에는 이미 확정되어 있습니다.
  if (fields) {
    // 실패 사유에 쓸 화면 라벨은 마크업의 label[for] 에서 읽습니다. 새 문자열을 만들지 않습니다.
    const labelOf = (id) => {
      const label = document.querySelector(`label[for="${id}"]`);
      return label ? label.textContent.trim() : id;
    };
    rep.fields = {};
    for (const f of fields) {
      const el = document.getElementById(f.id);
      if (!el) {
        check(false, `${labelOf(f.id)} 필드(${f.id})를 찾지 못했습니다.`);
        continue;
      }
      const ariaRequired = el.getAttribute('aria-required');
      const maxLength = el.getAttribute('maxlength');
      rep.fields[f.id] = { ariaRequired, maxLength };
      if (f.ariaRequired) {
        check(
          ariaRequired === 'true',
          `${labelOf(f.id)} 필드(${f.id})의 aria-required 가 true 가 아닙니다 (값: ${ariaRequired}).`,
        );
      } else {
        // 선택 필드는 aria-required 를 두지 않습니다. 없으면 getAttribute 가 null 입니다.
        check(
          ariaRequired === null,
          `${labelOf(f.id)} 필드(${f.id})의 aria-required 가 없어야 합니다 (값: ${ariaRequired}).`,
        );
      }
      check(
        maxLength === String(f.maxLength),
        `${labelOf(f.id)} 필드(${f.id})의 maxlength 가 ${f.maxLength} 가 아닙니다 (값: ${maxLength}).`,
      );
    }
  }
  rep.submitDisabledAtRest = submit.disabled;
  // 접수 완료 h2 와 폼 제목 h2 는 x-show 로 표시만 바뀌고 DOM 에 항상 존재합니다.
  // 그래서 존재 여부가 아니라 실제로 렌더된 사각형이 있는지로 가시성을 판정합니다.
  const successHeading = () =>
    Array.from(document.querySelectorAll('main h2')).find(h => h.textContent.includes(flow.successText)) || null;
  // 전제: 은닉 방식이 display:none 일 때만 사각형 기준으로 구분됩니다.
  // visibility:hidden 이나 opacity:0 은 구분하지 못합니다.
  const isVisible = el => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return el.getClientRects().length > 0 && rect.width > 0 && rect.height > 0;
  };
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
  // 전송이 아직 끝나지 않은 시점에는 성공 패널이 숨겨져 있어야 합니다.
  rep.successVisibleWhileBusy = isVisible(successHeading());
  await sleep(1800);
  rep.successVisible = isVisible(successHeading());

  check(rep.submitDisabledAtRest === false, '전송 버튼이 처음부터 비활성입니다.');
  check(rep.invalidFields === 3, `빈 제출 시 무효 필드가 3개가 아닙니다 (${rep.invalidFields}개).`);
  check(rep.firstErrorText === flow.nameError, `첫 오류 문구가 다릅니다 (${rep.firstErrorText}).`);
  check(rep.submitStillEnabled === true, '무효 제출 후 전송 버튼이 비활성입니다.');
  check(rep.invalidAfterFill === 0, `정상 입력 후에도 무효 필드가 남아 있습니다 (${rep.invalidAfterFill}개).`);
  check(rep.labelWhileBusy === flow.busyLabel, `전송 중 라벨이 다릅니다 (${rep.labelWhileBusy}).`);
  check(rep.ariaBusyWhileBusy === 'true', `전송 중 aria-busy 가 true 가 아닙니다 (${rep.ariaBusyWhileBusy}).`);
  check(rep.successVisibleWhileBusy === false, '전송이 끝나기 전인데 접수 완료 표시가 이미 보입니다.');
  check(rep.successVisible === true, '접수 완료 표시가 보이지 않습니다.');
  rep.fail = fails.length ? fails.join(' ') : null;
  window.__it = JSON.stringify(rep);
})();
