/** Removes service workers registered by earlier versions of the site. */
export const unregisterServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () =>
    navigator.serviceWorker.ready.then((registration) => registration.unregister())
  );
};
