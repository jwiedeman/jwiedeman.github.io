const load = () => import('./topo.ts');
if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(load);
} else {
  setTimeout(load, 2000);
}

