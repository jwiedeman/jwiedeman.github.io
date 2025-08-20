const root = document.documentElement;
const update = () => {
  const label = root.classList.contains('theme-dark') ? 'MODE: CRT' : 'MODE: NASA';
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    (btn as HTMLElement).textContent = label;
  });
};
update();
document.querySelectorAll('[data-theme-toggle]').forEach(el => {
  el.addEventListener('click', () => {
    const next = root.classList.contains('theme-dark') ? 'light' : 'dark';
    root.classList.toggle('theme-dark', next === 'dark');
    root.classList.toggle('theme-light', next === 'light');
    localStorage.setItem('theme', next);
    update();
  });
});

