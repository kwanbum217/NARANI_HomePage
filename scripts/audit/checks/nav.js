(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rep = {};
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
  window.__it = JSON.stringify(rep);
})();
