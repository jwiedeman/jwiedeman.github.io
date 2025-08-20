const root = document.documentElement;
const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const mode = stored || (prefersDark ? 'dark' : 'light');
root.classList.toggle('theme-dark', mode === 'dark');
root.classList.toggle('theme-light', mode === 'light');
if (!stored) localStorage.setItem('theme', mode);
