(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rep = {};
  const fails = [];
  const check = (ok, reason) => { if (!ok) fails.push(reason); };

  const burger = document.querySelector('header button[aria-controls="mobile-nav"]');
  const nav = document.getElementById('mobile-nav');
  rep.burgerFound = !!burger;
  rep.navInitiallyHidden = !!(nav && getComputedStyle(nav).display === 'none');
  if (burger) {
    burger.click(); await sleep(400);
    rep.afterOpen_display = getComputedStyle(nav).display;
    rep.afterOpen_aria = burger.getAttribute('aria-expanded');
    burger.click(); await sleep(400);
    rep.afterClose_display = getComputedStyle(nav).display;
    rep.afterClose_aria = burger.getAttribute('aria-expanded');
  }

  check(rep.burgerFound, '모바일 메뉴 버튼을 찾지 못했습니다.');
  check(rep.navInitiallyHidden, '초기 상태에서 모바일 메뉴가 숨겨지지 않았습니다.');
  check(rep.afterOpen_display === 'block', `메뉴를 열어도 display 가 block 이 아닙니다 (${rep.afterOpen_display}).`);
  check(rep.afterOpen_aria === 'true', `메뉴를 열어도 aria-expanded 가 true 가 아닙니다 (${rep.afterOpen_aria}).`);
  check(rep.afterClose_display === 'none', `메뉴를 닫아도 display 가 none 이 아닙니다 (${rep.afterClose_display}).`);
  check(rep.afterClose_aria === 'false', `메뉴를 닫아도 aria-expanded 가 false 가 아닙니다 (${rep.afterClose_aria}).`);
  rep.fail = fails.length ? fails.join(' ') : null;
  window.__it = JSON.stringify(rep);
})();
