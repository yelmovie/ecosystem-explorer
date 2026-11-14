const once = load => {
  let pending;
  return () => pending ??= load();
};

export const loadScreen = {
  map: once(() => import('./map-screen.js')),
  activity: once(() => import('./activity-screen.js')),
  mission: once(() => import('./play-mission.js')),
};

export function waitForScreen(pending, signal, deadline = 10000) {
  return new Promise((resolve, reject) => {
    const finish = settle => value => {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      settle(value);
    };
    const fail = finish(reject);
    const cancel = () => fail(signal.reason);
    const timer = setTimeout(() => fail(new Error('Screen load timed out')), deadline);
    if (signal.aborted) cancel();
    else signal.addEventListener('abort', cancel, { once: true });
    pending.then(finish(resolve), fail);
  });
}

const styles = new Map();
export function loadStyle(file, before = null) {
  if (styles.has(file)) return styles.get(file);
  const pending = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.screenStyle = file;
    if (file === './concept-focus.css') link.dataset.conceptFocusStyle = '';
    link.href = new URL(file, import.meta.url);
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', () => {
      styles.delete(file);
      link.remove();
      reject(new Error(`Stylesheet unavailable: ${file}`));
    }, { once: true });
    document.head.insertBefore(link, before);
  });
  styles.set(file, pending);
  return pending;
}

export async function mapAssetsReady(signal) {
  async function picture(file, priority = 'auto') {
    const image = new Image();
    image.fetchPriority = priority;
    image.src = new URL(`../assets/web/${file}.webp`, import.meta.url);
    try {
      await waitForScreen(image.decode(), signal, 20000);
      return image;
    } catch (error) {
      image.removeAttribute('src');
      throw error;
    }
  }
  const [landscape, moa, doto] = await Promise.all([
    picture('ecology-map-v3', 'high'),
    picture('moa-walk-v4'),
    picture('doto-walk-v4'),
  ]);
  return { landscape, moa, doto };
}
